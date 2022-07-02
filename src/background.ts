const Menus = {
  exportRecord: 'exportRecord',
} as const;

const fetchActiveTab = async () => await chrome.tabs.query({ active: true }).then(([tab]) => tab);

const fetchListContent = async (tabId?: number) => {
  if (!tabId) return;
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const element = document.querySelector('div.list-content');
      console.log('query', element);
    },
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

const main = () => {
  console.log('rakumo-de-extension background process run!');
};

// NOTE: for service worker error
export default main;
