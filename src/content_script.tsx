import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return <span>rakumo-de-extension</span>;
};

const renderRoot = () => {
  const root = createRoot(document.body.appendChild(document.createElement('div')));
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

const main = () => {
  console.log('rakumo-de-extension main');
  renderRoot();
};

main();
