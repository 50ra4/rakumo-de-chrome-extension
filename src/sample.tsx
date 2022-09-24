import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const Root = () => {
  return (
    <div>
      <h1>rakumo-de-extension components samples</h1>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
