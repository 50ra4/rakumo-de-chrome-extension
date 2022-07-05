import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { generateCsv, toAttendanceRecords } from '../utils/attendance';
import { AttendanceReportDocument } from '../utils/document';

const OUTPUT_FORMAT_OPTIONS = [
  {
    type: 'csv',
    name: 'CSV形式',
  },
  {
    type: 'text',
    name: 'Text形式',
  },
] as const;

type OutputFormat = typeof OUTPUT_FORMAT_OPTIONS[number];

const Popup = () => {
  const [state, setState] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OUTPUT_FORMAT_OPTIONS[0]);

  const onClickExport = () => {
    chrome.runtime.sendMessage<
      { name: 'message' },
      { status: 'done'; data: AttendanceReportDocument }
    >({ name: 'message' }, (response) => {
      console.log(response);
      setState(response?.status);

      const records = toAttendanceRecords(response.data);
      const blob = generateCsv(records);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([blob]));
      link.setAttribute('download', `report.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    });
  };

  const onChangeFormat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected =
      OUTPUT_FORMAT_OPTIONS.find(({ type }) => e.target.value === type) ?? OUTPUT_FORMAT_OPTIONS[0];
    setOutputFormat(selected);
  };

  return (
    <div
      style={{
        minWidth: '320px',
        minHeight: '320px',
      }}
    >
      <div style={{ display: 'flex' }}>
        <select value={outputFormat.type} onChange={onChangeFormat}>
          {OUTPUT_FORMAT_OPTIONS.map(({ type, name }) => (
            <option key={type} value={type}>
              {name}で
            </option>
          ))}
        </select>
        <button onClick={onClickExport}>勤怠情報を出力する</button>
      </div>
      <div>{`${state}`}</div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
