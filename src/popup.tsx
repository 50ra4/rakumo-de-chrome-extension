import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useChromeStorage } from './hooks/useChromeStorage';

const Popup = () => {
  const [workingTime, setWorkingTime] = useChromeStorage('working-time', '');

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
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
