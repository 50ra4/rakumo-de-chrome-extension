import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './AttendanceContent.css';

import { format } from 'date-fns';
import { SummaryReport } from '../components/SummaryReport';
import { TextInput } from '../components/TextInput';
import { useChromeStorage } from '../hooks/useChromeStorage';
import {
  calcExpectedReportSummary,
  toWorkingMinutes,
  isValidWorkingMinutesFormat,
} from '../utils/attendance';
import { Accordion } from '../components/Accordion';
import { SelectInput } from '../components/SelectInput';
import {
  MonthlyAttendanceRecord,
  getMonthlyAttendanceRecord,
  MonthlyAttendanceSummary,
  getMonthlyAttendanceSummary,
  getDisplayedMonthElement,
  getDisplayedMonth,
  getLastAggregationTimeElement,
  getLastAggregationTime,
} from '../document';
import {
  generateCsv,
  generateTextPlain,
  createAttendanceRecordFilename,
} from '../utils/outputFile';
import { minutesToTimeString } from '../utils/date';
import { useMutationObservable } from '../hooks/useMutationObservable';
import { Button } from '../components/Button';
import { debounce } from '../utils/debounce';

type MonthlyRecord = MonthlyAttendanceRecord & {
  summary: MonthlyAttendanceSummary;
};

const useFetchMonthlyRecord = () => {
  const [state, setState] = useState<(MonthlyRecord & { updatedAt: Date }) | null>(null);

  const reload = useCallback(() => {
    const record = getMonthlyAttendanceRecord();
    const summary = getMonthlyAttendanceSummary();
    // TODO: remove console.log
    // console.log({ record, summary });
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

const useDetectMonthChange = (callback: (month: string) => void) => {
  const previousValue = useRef('');

  const elm = getDisplayedMonthElement();

  const handler = () => {
    const month = getDisplayedMonth();
    if (!month) {
      return;
    }

    const monthStr = format(month, 'yyyy-MM');
    if (monthStr === previousValue.current) {
      return;
    }
    previousValue.current = monthStr;
    callback(monthStr);
  };

  useMutationObservable(elm, handler, {
    childList: true, // required
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
};

const useLastAggregationTimeChange = (callback: (dateString: string) => void) => {
  const previousValue = useRef('');

  const elm = getLastAggregationTimeElement();

  const handler = () => {
    const date = getLastAggregationTime();
    if (!date) {
      return;
    }

    const dateStr = format(date, 'yyyy-M-d H:mm');
    if (dateStr === previousValue.current) {
      return;
    }
    previousValue.current = dateStr;
    callback(dateStr);
  };

  useMutationObservable(elm, handler, {
    characterData: true,
    childList: true, // required
    subtree: true,
  });
};

export function AttendanceContent() {
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');
  const [appliedOvertimeWorkingTime, setAppliedOvertimeWorkingTime] = useChromeStorage(
    'applied-overtime-working-time',
    '',
  );

  const { reload, data } = useFetchMonthlyRecord();
  const { outputFormat, options, downloadRecord, changeFormat } = useOutputAttendanceRecord();

  const reloadDelay = useMemo(() => debounce(reload, 2000), [reload]);

  useEffect(() => {
    if (data) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDetectMonthChange(() => {
    reloadDelay();
  });

  useLastAggregationTimeChange(() => {
    reloadDelay();
  });

  const dailyWorkingMinutes = isValidWorkingMinutesFormat(workingTime)
    ? toWorkingMinutes(workingTime)
    : undefined;

  const appliedOvertimeWorkingMinutes = isValidWorkingMinutesFormat(appliedOvertimeWorkingTime)
    ? toWorkingMinutes(appliedOvertimeWorkingTime)
    : 0;

  const items = useMemo(() => {
    if (!data || !dailyWorkingMinutes) {
      return [];
    }

    const holidaysInPast = data.records.filter(
      ({ isHoliday, isFuture }) => isHoliday && !isFuture,
    ).length;

    const {
      expectedRemainingActualWorkingMinutes,
      expectedOvertimeWorkingMinutes,
      expectedActualWorkingMinutes,
    } = calcExpectedReportSummary({
      dailyWorkingMinutes,
      summary: data.summary,
      holidaysInPast,
    });
    const { prescribedWorkingTime, actualWorkingTime, leavePaidTime } = data.summary;

    const unappliedOvertimeWorkingMinutes =
      expectedOvertimeWorkingMinutes - appliedOvertimeWorkingMinutes;

    return [
      {
        label: '未申請の時間外労働時間',
        value: minutesToTimeString(unappliedOvertimeWorkingMinutes),
        emphasized: unappliedOvertimeWorkingMinutes > 0,
      },
      { label: '[予測]時間外労働時間', value: minutesToTimeString(expectedOvertimeWorkingMinutes) },
      {
        label: '[予測]残りの実労働時間',
        value: minutesToTimeString(expectedRemainingActualWorkingMinutes),
      },
      { label: '[予測]実労働時間（A）', value: minutesToTimeString(expectedActualWorkingMinutes) },
      { label: '実労働時間（A）', value: actualWorkingTime ?? 'N/A' },
      { label: '有給取得時間 (年休・特休など)（B）', value: leavePaidTime ?? 'N/A' },
      { label: '所定労働時間（C）', value: prescribedWorkingTime ?? 'N/A' },
    ];
  }, [appliedOvertimeWorkingMinutes, dailyWorkingMinutes, data]);

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
        defaultExpanded={true}
      >
        <div className="ex-main">
          <div className="ex-option-container">
            <Button className="ex-reload-button" onClick={reload}>
              データを再取得する
            </Button>
            <TextInput
              className="ex-text-input"
              id="working-time"
              name="workingTimePerDay"
              label="1日の勤務時間"
              placeholder="H:mm 形式で入力してください"
              value={workingTime}
              onChange={setWorkingTime}
            />
            <TextInput
              className="ex-text-input"
              id="overtime-working-time"
              name="appliedOvertimeWorkingTime"
              label="申請済の時間外労働時間"
              placeholder="H:mm 形式で入力してください"
              value={appliedOvertimeWorkingTime}
              onChange={setAppliedOvertimeWorkingTime}
            />
            <div style={{ marginTop: '10px' }}>
              <h3 style={{ marginTop: '0', marginBottom: '4px' }}>勤怠情報出力</h3>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SelectInput value={outputFormat} options={options} onChange={changeFormat} />
                <Button onClick={onClickExport}>出力する</Button>
              </div>
            </div>
          </div>
          <div className="ex-summary-container">
            {!!data && !!items.length ? (
              <SummaryReport
                title={`${format(data.month, 'yyyy年M月')}の勤怠時間の予想`}
                items={items}
                updatedAt={`${format(data.updatedAt, 'yyyy/MM/dd HH:mm:ss')} 更新`}
              />
            ) : (
              <div className="ex-summary-report-empty">
                1日の勤務時間を入力し、データを再取得すると予測時間が表示されます
              </div>
            )}
          </div>
        </div>
      </Accordion>
    </div>
  );
}
