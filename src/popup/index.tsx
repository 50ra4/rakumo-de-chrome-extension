import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useChromeStorage } from '../hooks/useChromeStorage';
import {
  generateCsv,
  toAttendanceRecords,
  generateTextPlain,
  toReportSummary,
} from '../utils/attendance';
import { AttendanceReportDocument } from '../utils/document';

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

  const onClickExport = () => {
    chrome.runtime.sendMessage<
      { name: 'message' },
      { status: 'done'; data: AttendanceReportDocument }
    >({ name: 'message' }, (response) => {
      console.log(response);

      const records = toAttendanceRecords(response.data);
      const blob = outputFormat.type === 'csv' ? generateCsv(records) : generateTextPlain(records);
      const fileName = `report.${outputFormat.extension}`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([blob]));
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    });
  };

  const onClickExpectedSummary = () => {
    chrome.runtime.sendMessage<
      { name: 'message' },
      { status: 'done'; data: AttendanceReportDocument }
    >({ name: 'message' }, (response) => {
      const summary = toReportSummary(response.data);
      console.log(summary);
      // TODO: calc times
    });
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
      <div style={{ display: 'flex', marginBottom: '8px' }}>
        <select value={outputFormat.type} onChange={onChangeFormat}>
          {OUTPUT_FORMAT_OPTIONS.map(({ type, name }) => (
            <option key={type} value={type}>
              {name}で
            </option>
          ))}
        </select>
        <button onClick={onClickExport}>勤怠情報を出力する</button>
      </div>
      <div style={{ display: 'flex' }}>
        <label htmlFor="working-time">1日の勤務時間</label>
        <input
          type="text"
          id="working-time"
          name="working-time"
          placeholder="H:mm 形式で入力"
          value={workingTime}
          onChange={onChangeWorkingTime}
        />
      </div>
      <button onClick={onClickExpectedSummary}>予測時間を表示する</button>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
