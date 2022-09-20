import React, { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { format } from 'date-fns';
import { SummaryReport } from '../components/SummaryReport';
import { TextInput } from '../components/TextInput';
import { AttendanceReportDocument, getAttendanceReportDocument } from '../document';
import { useChromeStorage } from '../hooks/useChromeStorage';
import {
  toReportSummary,
  calcExpectedReportSummary,
  toWorkingMinutes,
  toAttendanceRecordMonth,
} from '../utils/attendance';
import { minutesToTimeString } from '../utils/date';

const ExpectedTimeSection = ({
  title,
  data,
  updatedAt,
}: {
  title: string;
  data?: AttendanceReportDocument;
  updatedAt?: string;
}) => {
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');

  const items = useMemo(() => {
    if (!data || !workingTime) {
      return [];
    }

    const summary = toReportSummary(data);
    const {
      expectedRemainingActualWorkingMinutes,
      expectedOvertimeWorkingMinutes,
      expectedActualWorkingMinutes,
    } = calcExpectedReportSummary({
      dailyWorkingMinutes: toWorkingMinutes(workingTime),
      summary,
    });
    const {
      prescribedWorkingDays,
      prescribedWorkingTime,
      actualWorkingDays,
      actualWorkingTime,
      overtimeWorkTime,
      leavePaidTime,
    } = summary;

    return [
      { label: '(予測)時間外勤務時間', value: minutesToTimeString(expectedOvertimeWorkingMinutes) },
      // TODO: 申請済みの時間外勤務時間
      { label: '(予測)実労働時間', value: minutesToTimeString(expectedActualWorkingMinutes) },
      {
        label: '(予測)残りの実労働時間',
        value: minutesToTimeString(expectedRemainingActualWorkingMinutes),
      },
      {
        label: '所定労働日数',
        value: prescribedWorkingDays ? `${prescribedWorkingDays}日` : 'N/A',
      },
      { label: '所定労働時間', value: prescribedWorkingTime ?? 'N/A' },
      { label: '実労働日数', value: actualWorkingDays ? `${actualWorkingDays}日` : 'N/A' },
      { label: '実労働時間', value: actualWorkingTime ?? 'N/A' },
      { label: '時間外労働時間', value: overtimeWorkTime ?? 'N/A' },
      { label: '有給取得時間 (年休・特休など)', value: leavePaidTime ?? 'N/A' },
    ];
  }, [data, workingTime]);

  return (
    <div
      style={{
        padding: '0 8px',
      }}
    >
      <div style={{ maxWidth: '300px' }}>
        <TextInput
          id="working-time"
          name="workingTimePerDay"
          label="1日の勤務時間"
          value={workingTime}
          onChange={setWorkingTime}
        />
      </div>
      <div style={{ maxWidth: '320px' }}>
        <SummaryReport title={title} items={items} updatedAt={updatedAt ?? ''} />
      </div>
    </div>
  );
};

const useAttendanceRecord = () => {
  const [state, setState] = useState<{
    data: AttendanceReportDocument;
    updatedAt: Date;
  } | null>(null);

  const reload = useCallback(() => {
    const data = getAttendanceReportDocument();
    setState({ data, updatedAt: new Date() });
  }, []);

  return { data: state?.data, updatedAt: state?.updatedAt, reload };
};

const Root = () => {
  const { reload, data, updatedAt } = useAttendanceRecord();

  useEffect(() => {
    // TODO: 月が変わったとき、最終集計時刻が変わったときに再度取得する
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const month = useMemo(
    () => (data ? toAttendanceRecordMonth(data.displayedMonth) : undefined),
    [data],
  );

  const sectionTitle = month ? `${format(month, 'yyyy年M月')}の勤怠時間の予想` : undefined;

  return (
    <div
      style={{
        padding: '4px',
        border: '1px solid #f3f3eb',
      }}
    >
      <h2 style={{}}>予想時間</h2>
      {sectionTitle && (
        <ExpectedTimeSection
          title={sectionTitle}
          data={data}
          updatedAt={updatedAt ? `${format(updatedAt, 'yyyy/MM/dd HH:mm:ss')} 更新` : undefined}
        />
      )}
    </div>
  );
};

const rootId = 'rakumo-de-extension';

const render = (parentElement: HTMLElement) => {
  const root = document.createElement('div');
  root.setAttribute('id', rootId);
  root.style.setProperty('background-color', '#ffffff');
  root.style.setProperty('padding', '24px 32px');

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
