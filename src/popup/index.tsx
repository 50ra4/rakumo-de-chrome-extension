import { format } from 'date-fns';
import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useChromeStorage } from '../hooks/useChromeStorage';
import {
  generateCsv,
  toAttendanceRecords,
  generateTextPlain,
  toReportSummary,
  toWorkingMinutes,
  calcExpectedReportSummary,
  toAttendanceRecordMonth,
  createAttendanceRecordFilename,
} from '../utils/attendance';
import { minutesToTimeString } from '../utils/date';
import { SummaryReport } from './SummaryReport';
import { useAttendanceReportDocument } from './useAttendanceReportDocument';

const OUTPUT_FORMAT_OPTIONS = [
  {
    type: 'csv',
    name: 'csv形式',
    extension: 'csv',
  },
  {
    type: 'text',
    name: 'text形式',
    extension: 'txt',
  },
] as const;

type OutputFormat = typeof OUTPUT_FORMAT_OPTIONS[number];

const Popup = () => {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OUTPUT_FORMAT_OPTIONS[0]);
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');

  const { attendanceReportDocument, fetchAttendanceReportDocument, error, updatedAt } =
    useAttendanceReportDocument();

  useEffect(() => {
    fetchAttendanceReportDocument();

    const timerId = window.setInterval(() => {
      fetchAttendanceReportDocument();
    }, 30000);

    return () => {
      window.clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { attendanceRecordMonth, attendanceRecords } = useMemo(() => {
    return {
      attendanceRecordMonth: attendanceReportDocument
        ? toAttendanceRecordMonth(attendanceReportDocument.displayedMonth)
        : undefined,
      attendanceRecords: attendanceReportDocument
        ? toAttendanceRecords(attendanceReportDocument)
        : undefined,
    };
  }, [attendanceReportDocument]);

  const onClickExport = () => {
    if (error) {
      window.alert('エラーが発生しました!');
      return;
    }
    if (!attendanceRecordMonth || !attendanceRecords) {
      window.alert('更新ボタンを押して再度取得してください!');
      return;
    }

    const blob =
      outputFormat.type === 'csv'
        ? generateCsv(attendanceRecords)
        : generateTextPlain(attendanceRecords);
    const fileName = createAttendanceRecordFilename(attendanceRecordMonth, outputFormat.extension);

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blob]));
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const expectedWorkingItems = useMemo(() => {
    if (!attendanceReportDocument) {
      return [];
    }

    const summary = toReportSummary(attendanceReportDocument);
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
      {
        label: '予想の残実労働時間',
        value: minutesToTimeString(expectedRemainingActualWorkingMinutes),
      },
      { label: '予想の実労働時間', value: minutesToTimeString(expectedActualWorkingMinutes) },
      { label: '予想の時間外勤務時間', value: minutesToTimeString(expectedOvertimeWorkingMinutes) },
      // TODO: 申請済みの時間外勤務時間
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
  }, [attendanceReportDocument, workingTime]);

  const onClickReload = () => {
    fetchAttendanceReportDocument();
  };

  const onChangeFormat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected =
      OUTPUT_FORMAT_OPTIONS.find(({ type }) => e.target.value === type) ?? OUTPUT_FORMAT_OPTIONS[0];
    setOutputFormat(selected);
  };

  const onChangeWorkingTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkingTime(e.currentTarget.value);
  };

  return (
    <div
      style={{
        minWidth: '320px',
        minHeight: '320px',
      }}
    >
      <button onClick={onClickReload} style={{ minWidth: '100%', marginBottom: '8px' }}>
        データを再取得する
      </button>
      <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
        <select
          value={outputFormat.type}
          onChange={onChangeFormat}
          style={{ marginRight: '4px', width: '120px' }}
        >
          {OUTPUT_FORMAT_OPTIONS.map(({ type, name }) => (
            <option key={type} value={type}>
              {name}で
            </option>
          ))}
        </select>
        <button onClick={onClickExport} style={{ flex: '1 1 auto' }}>
          勤怠情報を出力する
        </button>
      </div>
      <hr />
      <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
        <label htmlFor="working-time" style={{ marginRight: '4px', width: '120px' }}>
          1日の勤務時間
        </label>
        <input
          type="text"
          id="working-time"
          name="working-time"
          placeholder="H:mm 形式で入力"
          value={workingTime}
          onChange={onChangeWorkingTime}
          style={{ flex: '1 1 auto' }}
        />
      </div>
      {!!expectedWorkingItems.length && !!attendanceRecordMonth && (
        <SummaryReport
          title={`${format(attendanceRecordMonth, 'yyyy年M月')}の勤怠時間の予想`}
          items={expectedWorkingItems}
          updatedAt={`${format(updatedAt, 'yyyy/MM/dd HH:mm:ss')} 更新`}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
