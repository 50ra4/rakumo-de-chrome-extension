import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TextInput } from './components/TextInput';
import { useChromeStorage } from './hooks/useChromeStorage';

const Popup = () => {
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');

  return (
    <div
      style={{
        minWidth: '320px',
        minHeight: '320px',
      }}
    >
      <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
        <TextInput
          id="working-time"
          name="workingTimePerDay"
          label="1日の勤務時間"
          placeholder="H:mm 形式で入力"
          value={workingTime}
          onChange={setWorkingTime}
        />
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
