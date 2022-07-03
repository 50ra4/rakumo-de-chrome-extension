export const getCellsFromDocument = () => {
  const element = document.querySelector('div.list-content');
  if (!element) return;

  const rows = Array.from(element.querySelectorAll('div.trow').values());
  const cells = rows.map((row) => ({
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
  // TODO: remove
  console.log('getCellsFromDocument', cells);
  return cells;
};
