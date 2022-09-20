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

const useAttendanceRecord = () => {
  const [state, setState] = useState<(AttendanceReportDocument & { updatedAt: Date }) | null>(null);

  const reload = useCallback(() => {
    const data = getAttendanceReportDocument();
    setState({ ...data, updatedAt: new Date() });
  }, []);

  return { data: state, reload };
};

const Root = () => {
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');
  const { reload, data } = useAttendanceRecord();

  useEffect(() => {
    // TODO: 月が変わったとき、最終集計時刻が変わったときに再度取得する
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedMonth = useMemo(
    () => (data ? toAttendanceRecordMonth(data.displayedMonth) : undefined),
    [data],
  );

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
      // TODO: 申請済みの時間外勤務時間を追加する
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
        padding: '4px',
        border: '1px solid #f3f3eb',
      }}
    >
      <h2>予想時間</h2>
      <div style={{ padding: '0 8px', maxWidth: '320px' }}>
        <button onClick={reload} style={{ width: '100%', marginBottom: '8px' }}>
          データを再取得する
        </button>
        <div style={{ marginBottom: '4px' }}>
          <TextInput
            id="working-time"
            name="workingTimePerDay"
            label="1日の勤務時間"
            value={workingTime}
            onChange={setWorkingTime}
          />
        </div>
        {!!displayedMonth && !!data && !!items.length && (
          <div style={{}}>
            <SummaryReport
              title={`${format(displayedMonth, 'yyyy年M月')}の勤怠時間の予想`}
              items={items}
              updatedAt={`${format(data.updatedAt, 'yyyy/MM/dd HH:mm:ss')} 更新`}
            />
          </div>
        )}
      </div>
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
