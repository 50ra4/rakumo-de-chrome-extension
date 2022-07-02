chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  console.log(request.text);
  sendResponse({ text: 'onMessage response' });
});

const main = () => {
  console.log('rakumo-de-extension background process run!');
};

// NOTE: for service worker error
export default main;
