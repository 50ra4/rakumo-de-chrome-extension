import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AttendanceContent } from './AttendanceContent';

const rootId = 'rakumo-de-extension';

const render = (parentElement: HTMLElement) => {
  const root = document.createElement('div');
  root.setAttribute('id', rootId);
  root.style.setProperty('background-color', '#ffffff');
  root.style.setProperty('padding', '8px 32px');

  parentElement.prepend(root);
  createRoot(root).render(
    <StrictMode>
      <AttendanceContent />
    </StrictMode>,
  );
};

const main = () => {
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
