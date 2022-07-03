import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ContentCells, toAttendanceRecords } from '../utils/document';

const Popup = () => {
  const [state, setState] = useState('');

  const onClickExport = () => {
    chrome.runtime.sendMessage<{ name: 'message' }, { status: 'done'; data: ContentCells }>(
      { name: 'message' },
      (response) => {
        console.log(response);
        setState(response?.status);
        console.log(toAttendanceRecords(response.data));
      },
    );
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
