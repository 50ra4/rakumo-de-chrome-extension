const Menus = {
  exportRecord: 'exportRecord',
} as const;

chrome.contextMenus.create({
  id: Menus.exportRecord,
  title: '勤怠を出力する',
  contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener((info, _) => {
  switch (info.menuItemId) {
    case Menus.exportRecord:
      console.log(`${Menus.exportRecord} clicked`);
      break;

    default:
      break;
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  console.log(request.text);
  sendResponse({ text: 'onMessage response' });
});

const main = () => {
  console.log('rakumo-de-extension background process run!');
};

// NOTE: for service worker error
export default main;
