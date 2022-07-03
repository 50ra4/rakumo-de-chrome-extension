import { getCellsFromDocument } from './utils/document';

// FIXME: Get different tabs...
const fetchActiveTab = async () =>
  await chrome.tabs.query({ lastFocusedWindow: true }).then(([tab]) => tab);

const fetchListContent = async (tabId?: number) => {
  if (!tabId) return;
  const response = await chrome.scripting.executeScript({
    target: { tabId },
    func: getCellsFromDocument,
  });
  const [head] = response;
  return head.result;
};

// TODO: add menus
// const Menus = {
//   exportRecord: 'exportRecord',
// } as const;

chrome.contextMenus.create({
  id: 'rakumo-de-extension-tab-test',
  title: 'タブの種類を出力する',
  contexts: ['all'],
});

const getTabs = async () => {
  const lastFocusedWindowTabs = await chrome.tabs.query({ lastFocusedWindow: true });
  const activeTabs = await chrome.tabs.query({ active: true });
  const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
  console.log({ lastFocusedWindowTabs, activeTabs, currentWindowTabs });
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'rakumo-de-extension-tab-test':
      console.log('listen tab', tab);
      getTabs();
      break;

    default:
      break;
  }
});

chrome.runtime.onMessage.addListener((_message, _, sendResponse) => {
  // TODO: Switch to different processing depending on the message
  fetchActiveTab()
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
