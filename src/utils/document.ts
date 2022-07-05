type HTMLElementOrNull = HTMLElement | null;

export const getAttendanceReportDocument = () => {
  const getDisplayedMonth = () => {
    const date = (document.querySelector('.period-select') as HTMLElementOrNull)?.innerText;
    return date ?? ''; // TODO: type check
  };

  const getListContent = () => {
    const element = document.querySelector('div.list-content');
    if (!element) return [];

    const rows = Array.from(element.querySelectorAll('div.trow').values());
    const records = rows.map((row) => ({
      isDayOff: row.classList.contains('day-off'),
      date: (row.querySelector('.date') as HTMLElement).innerText,
      workingPattern: (row.querySelector('.working-pattern') as HTMLElementOrNull)?.innerText,
      checkIn: (row.querySelector('.checkin-time') as HTMLElementOrNull)?.innerText,
      checkOut: (row.querySelector('.checkout-time') as HTMLElementOrNull)?.innerText,
      breakTime: (row.querySelector('.break-minutes') as HTMLElementOrNull)?.innerText,
      workingTime: (row.querySelector('.working-minutes') as HTMLElementOrNull)?.innerText,
      // note: row.querySelector('.note'), // FIXME:
      // flows: row.querySelector('.flows'), // FIXME:
      holidayText: (
        row.querySelector('.time-span-banner')?.querySelector('.bar.lh.rh') as HTMLElementOrNull
      )?.innerText,
    }));

    return records;
  };

  const getReportSummary = () => {
    const items = (
      Array.from(
        document.querySelectorAll('.report-summary > .row > .content > .column > .item'),
      ) as HTMLElement[]
    ).map((element) => ({
      name: (element.querySelector('.name') as HTMLElementOrNull)?.innerText,
      value: (element.querySelector('.value') as HTMLElementOrNull)?.innerText,
    }));

    // TODO: 扱いやすいフォーマットに変更する
    return items;
  };

  const displayedMonth = getDisplayedMonth();
  const listContent = getListContent();
  const reportSummary = getReportSummary();

  return { displayedMonth, listContent, reportSummary };
};

export type AttendanceReportDocument = ReturnType<typeof getAttendanceReportDocument>;
