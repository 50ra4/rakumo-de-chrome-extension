import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toExportCsv } from '../utils/attendance';
import { AttendanceReportDocument } from '../utils/document';

const Popup = () => {
  const [state, setState] = useState('');
  const [downloadLink, setDownloadLink] = useState<string>();

  const onClickExport = () => {
    chrome.runtime.sendMessage<
      { name: 'message' },
      { status: 'done'; data: AttendanceReportDocument }
    >({ name: 'message' }, (response) => {
      console.log(response);
      setState(response?.status);
      const blob = toExportCsv(response.data);
      setDownloadLink(URL.createObjectURL(blob));
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
      {downloadLink && (
        <a href={downloadLink} download="report.csv">
          ダウンロード
        </a>
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
