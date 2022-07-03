const Menus = {
  exportRecord: 'exportRecord',
} as const;

const fetchActiveTab = async () => await chrome.tabs.query({ active: true }).then(([tab]) => tab);

const fetchListContent = async (tabId?: number) => {
  if (!tabId) return;
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const getCells = () => {
        const element = document.querySelector('div.list-content');
        if (!element) return;

        const rows = Array.from(element.querySelectorAll('div.trow').values());
        return rows.map((row) => ({
          isDayOff: row.classList.contains('day-off'),
          date: (row.querySelector('.date') as HTMLDivElement)?.innerText,
          workingPattern: (row.querySelector('.working-pattern') as HTMLDivElement)?.innerText,
          checkIn: (row.querySelector('.checkin-time') as HTMLDivElement)?.innerText,
          checkOut: (row.querySelector('.checkout-time') as HTMLDivElement)?.innerText,
          breakTime: (row.querySelector('.break-minutes') as HTMLDivElement)?.innerText,
          workingTime: (row.querySelector('.working-minutes') as HTMLDivElement)?.innerText,
          note: row.querySelector('.note'), // FIXME:
          flows: row.querySelector('.flows'), // FIXME:
          holidayText: (
            row.querySelector('.time-span-banner')?.querySelector('.bar.lh.rh') as HTMLDivElement
          )?.innerText,
        }));
      };

      console.log('query', getCells());
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
