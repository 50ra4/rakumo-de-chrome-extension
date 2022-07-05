import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { generateCsv, toAttendanceRecords } from '../utils/attendance';
import { AttendanceReportDocument } from '../utils/document';

const Popup = () => {
  const [state, setState] = useState('');

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

  return (
    <div
      style={{
        minWidth: '320px',
        minHeight: '320px',
      }}
    >
      <button onClick={onClickExport}>勤怠情報を出力する</button>
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
