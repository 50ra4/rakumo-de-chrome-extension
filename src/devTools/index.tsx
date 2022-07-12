import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((details) => {
      console.log(`watch`, details.request.url);

      if (!/a-rakumo.appspot.com\/api\//.test(details.request.url)) {
        return;
      }

      details.getContent((content, _) => {
        const response = JSON.parse(content);
        console.log(`${details.request.url} content`, response);
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
          if (!tab?.id) {
            return;
          }
          chrome.tabs.sendMessage(tab.id, { data: response, from: 'devtools.js' }, (response) => {
            console.log(response);
          });
        });
      });
    });
  }, []);

  return null;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
