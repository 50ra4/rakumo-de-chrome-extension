type HTMLElementOrNull = HTMLElement | null;

type ReportSummaryName =
  | '所定労働日数'
  | '所定労働時間'
  | '実労働日数'
  | '実労働時間'
  | '時間外労働時間'
  | '法定内'
  | '法定外'
  | 'みなし'
  | '深夜労働時間'
  | '休日労働時間'
  | '所定休日'
  | '法定休日'
  | '有給休暇 (年休+特休)'
  | '代休・休日'
  | '有給取得時間 (年休・特休など)'
  | '無給・欠勤・遅刻・早退';

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
    const mapping = new Map(
      (
        Array.from(
          document.querySelectorAll('.report-summary > .row > .content > .column > .item'),
        ) as HTMLElement[]
      ).map(
        (element) =>
          [
            (element.querySelector('.name') as HTMLElement).innerText,
            (element.querySelector('.value') as HTMLElement).innerText,
          ] as [ReportSummaryName, string],
      ),
    );

    return {
      prescribedWorking: {
        days: mapping.get('所定労働日数'),
        minutes: mapping.get('所定労働時間'),
      },
      actualWorking: {
        days: mapping.get('実労働日数'),
        minutes: mapping.get('実労働時間'),
      },
      overTime: {
        totalMinutes: mapping.get('時間外労働時間'),
        includeMinutes: mapping.get('法定内'),
        excludeMinutes: mapping.get('法定外'),
      },
      leave: {
        paidMinutes: mapping.get('有給取得時間 (年休・特休など)'),
        unpaidMinutes: mapping.get('無給・欠勤・遅刻・早退'),
      },
      nightWorkingMinutes: mapping.get('深夜労働時間'),
      dayOffWorkingMinutes: mapping.get('休日労働時間'),
    };
  };

  const displayedMonth = getDisplayedMonth();
  const listContent = getListContent();
  const reportSummary = getReportSummary();

  return { displayedMonth, listContent, reportSummary };
};

export type AttendanceReportDocument = ReturnType<typeof getAttendanceReportDocument>;
