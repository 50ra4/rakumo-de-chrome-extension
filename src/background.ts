import { getCellsFromDocument } from './utils/document';

const Menus = {
  exportRecord: 'exportRecord',
} as const;

const fetchActiveTab = async () => await chrome.tabs.query({ active: true }).then(([tab]) => tab);

const fetchListContent = async (tabId?: number) => {
  if (!tabId) return;
  chrome.scripting.executeScript({
    target: { tabId },
    func: getCellsFromDocument,
  });
};

chrome.contextMenus.create({
  id: Menus.exportRecord,
  title: '勤怠を出力する',
  contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case Menus.exportRecord:
      fetchListContent(tab?.id);
      break;

    default:
      break;
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  console.log(request.text);
  fetchActiveTab().then((tab) => {
    fetchListContent(tab?.id);
  });

  sendResponse({ text: 'onMessage response' });
});
