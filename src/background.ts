import { getAttendanceReportDocument } from './document';

const fetchCurrentActiveTab = async () =>
  await chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => tab);

const fetchListContent = async (tabId?: number) => {
  if (!tabId) return;
  const response = await chrome.scripting.executeScript({
    target: { tabId },
    func: getAttendanceReportDocument,
  });
  const [head] = response;
  return head.result;
};

// chrome.contextMenus.create({
//   id: 'rakumo-de-extension-tab-test',
//   title: 'タブの種類を出力する',
//   contexts: ['all'],
// });

// const getTabs = async () => {
//   const lastFocusedWindowTabs = await chrome.tabs.query({ lastFocusedWindow: true });
//   const activeTabs = await chrome.tabs.query({ active: true });
//   const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
//   console.log({ lastFocusedWindowTabs, activeTabs, currentWindowTabs });
// };

// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   switch (info.menuItemId) {
//     case 'rakumo-de-extension-tab-test':
//       console.log('listen tab', tab);
//       getTabs();
//       break;

//     default:
//       break;
//   }
// });

chrome.runtime.onInstalled.addListener(() => {
  // declarativeContent
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'a-rakumo.appspot.com' },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

chrome.runtime.onMessage.addListener((_message, _, sendResponse) => {
  // TODO: Switch to different processing depending on the message
  fetchCurrentActiveTab()
    .then((tab) => fetchListContent(tab?.id))
    .then((data) => {
      // TODO: add type
      sendResponse({ status: 'done', data });
    })
    .catch((err) => {
      sendResponse({ status: 'error', err });
    });
  return true;
});
