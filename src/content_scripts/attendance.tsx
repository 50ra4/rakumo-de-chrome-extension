import React, { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { format } from 'date-fns';
import { SummaryReport } from '../components/SummaryReport';
import { TextInput } from '../components/TextInput';
import { useChromeStorage } from '../hooks/useChromeStorage';
import {
  calcExpectedReportSummary,
  toWorkingMinutes,
  isValidWorkingMinutesFormat,
} from '../utils/attendance';
import { minutesToTimeString } from '../utils/date';
import { Accordion } from '../components/Accordion';
import { SelectInput } from '../components/SelectInput';
import {
  MonthlyAttendanceRecord,
  getMonthlyAttendanceRecord,
  MonthlyAttendanceSummary,
  getMonthlyAttendanceSummary,
} from '../document';
import {
  generateCsv,
  generateTextPlain,
  createAttendanceRecordFilename,
} from '../utils/outputFile';

type MonthlyRecord = MonthlyAttendanceRecord & {
  summary: MonthlyAttendanceSummary;
};

const useFetchMonthlyRecord = () => {
  const [state, setState] = useState<(MonthlyRecord & { updatedAt: Date }) | null>(null);

  const reload = useCallback(() => {
    const record = getMonthlyAttendanceRecord();
    const summary = getMonthlyAttendanceSummary();
    if (!record) {
      setState(null);
      return;
    }
    setState({ ...record, summary, updatedAt: new Date() });
  }, []);

  return { data: state, reload };
};

type OutputFormat = { value: 'csv' | 'text' } & { name: string; extension: string };
const OUTPUT_FORMAT_OPTIONS: OutputFormat[] = [
  {
    value: 'csv',
    name: 'csv形式',
    extension: 'csv',
  },
  {
    value: 'text',
    name: 'text形式',
    extension: 'txt',
  },
];

const useOutputAttendanceRecord = () => {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OUTPUT_FORMAT_OPTIONS[0]);

  const changeFormat = useCallback((value: OutputFormat['value']) => {
    const selected =
      OUTPUT_FORMAT_OPTIONS.find((option) => option.value === value) ?? OUTPUT_FORMAT_OPTIONS[0];
    setOutputFormat(selected);
  }, []);

  const downloadRecord = useCallback(
    ({ month, records }: MonthlyAttendanceRecord) => {
      const blob = outputFormat.value === 'csv' ? generateCsv(records) : generateTextPlain(records);
      const fileName = createAttendanceRecordFilename(month, outputFormat.extension);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([blob]));
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    },
    [outputFormat.extension, outputFormat.value],
  );

  return {
    outputFormat: outputFormat.value,
    options: OUTPUT_FORMAT_OPTIONS,
    downloadRecord,
    changeFormat,
  };
};

const Root = () => {
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');
  const { reload, data } = useFetchMonthlyRecord();
  const { outputFormat, options, downloadRecord, changeFormat } = useOutputAttendanceRecord();

  useEffect(() => {
    // TODO: 月が変わったとき、最終集計時刻が変わったときに再度取得する
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(() => {
    if (!data || !workingTime || !isValidWorkingMinutesFormat(workingTime)) {
      return [];
    }

    const {
      expectedRemainingActualWorkingMinutes,
      expectedOvertimeWorkingMinutes,
      expectedActualWorkingMinutes,
    } = calcExpectedReportSummary({
      dailyWorkingMinutes: toWorkingMinutes(workingTime),
      summary: data.summary,
    });
    const {
      prescribedWorkingDays,
      prescribedWorkingTime,
      actualWorkingDays,
      actualWorkingTime,
      overtimeWorkTime,
      leavePaidTime,
    } = data.summary;

    return [
      { label: '[予測]時間外勤務時間', value: minutesToTimeString(expectedOvertimeWorkingMinutes) },
      {
        label: '[予測]残りの実労働時間',
        value: minutesToTimeString(expectedRemainingActualWorkingMinutes),
      },
      // TODO: 申請済みの時間外勤務時間を追加する
      { label: '[予測]実労働時間（A）', value: minutesToTimeString(expectedActualWorkingMinutes) },
      { label: '有給取得時間 (年休・特休など)（B）', value: leavePaidTime ?? 'N/A' },
      { label: '所定労働時間（C）', value: prescribedWorkingTime ?? 'N/A' },
      {
        label: '所定労働日数',
        value: prescribedWorkingDays ? `${prescribedWorkingDays}日` : 'N/A',
      },
      { label: '実労働日数', value: actualWorkingDays ? `${actualWorkingDays}日` : 'N/A' },
      { label: '実労働時間（A）', value: actualWorkingTime ?? 'N/A' },
      { label: '時間外労働時間', value: overtimeWorkTime ?? 'N/A' },
    ];
  }, [data, workingTime]);

  const onClickExport = useCallback(() => {
    if (!data) {
      window.alert('【エラー】更新ボタンを押して再取得してください!');
      return;
    }

    downloadRecord(data);
  }, [data, downloadRecord]);

  return (
    <div
      style={{
        border: '1px solid #f3f3eb',
      }}
    >
      <Accordion
        id="rakumo-de-extension-attendance-accordion"
        title="rakumo-de-extension"
        defaultExpanded={false}
      >
        <div style={{ maxWidth: '320px' }}>
          <button onClick={reload} style={{ marginBottom: '8px' }}>
            データを再取得する
          </button>
          <div style={{ marginBottom: '4px' }}>
            <TextInput
              id="working-time"
              name="workingTimePerDay"
              label="1日の勤務時間"
              placeholder="H:mm 形式で入力"
              value={workingTime}
              onChange={setWorkingTime}
            />
          </div>
          {!!data && !!items.length && (
            <SummaryReport
              title={`${format(data.month, 'yyyy年M月')}の勤怠時間の予想`}
              items={items}
              updatedAt={`${format(data.updatedAt, 'yyyy/MM/dd HH:mm:ss')} 更新`}
            />
          )}
          <div style={{ display: 'flex', marginTop: '4px', alignItems: 'center' }}>
            <SelectInput value={outputFormat} options={options} onChange={changeFormat} />
            <button onClick={onClickExport} style={{ flex: '1 1 auto' }}>
              勤怠情報を出力する
            </button>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

const rootId = 'rakumo-de-extension';

const render = (parentElement: HTMLElement) => {
  const root = document.createElement('div');
  root.setAttribute('id', rootId);
  root.style.setProperty('background-color', '#ffffff');
  root.style.setProperty('padding', '8px 32px');

  parentElement.prepend(root);
  createRoot(root).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
};

const main = () => {
  const extensionElement = document.body.querySelector<HTMLElement>(`#${rootId}`);
  if (extensionElement) {
    // 既に表示済の場合
    return;
  }

  const timer = setInterval(() => {
    const content = document.body.querySelector<HTMLElement>(
      'div.main div.content div.report-content',
    );

    if (!content) {
      // 勤怠表が表示前の場合
      console.warn('report-content waiting');
      return;
    }

    render(content);
    clearInterval(timer);
  }, 2000);
};

main();
