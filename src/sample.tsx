import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './components/Button';

const Root = () => {
  return (
    <div>
      <h1>rakumo-de-extension components samples</h1>
      <section>
        <h2>button</h2>
        <div>
          <Button
            onClick={() => {
              // nothing
            }}
          >
            Button
          </Button>
        </div>
      </section>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
