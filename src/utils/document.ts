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
    const date = document.querySelector<HTMLElement>('.period-select')?.innerText;
    return date ?? ''; // TODO: type check
  };

  const getListContent = () => {
    const element = document.querySelector('div.list-content');
    if (!element) return [];

    const rows = Array.from(element.querySelectorAll('div.trow').values());
    const records = rows.map((row) => ({
      isDayOff: row.classList.contains('day-off'),
      date: row.querySelector<HTMLElement>('.date')?.innerText ?? '', // TODO: type check
      workingPattern: row.querySelector<HTMLElement>('.working-pattern')?.innerText,
      checkIn: row.querySelector<HTMLElement>('.checkin-time')?.innerText,
      checkOut: row.querySelector<HTMLElement>('.checkout-time')?.innerText,
      breakTime: row.querySelector<HTMLElement>('.break-minutes')?.innerText,
      workingTime: row.querySelector<HTMLElement>('.working-minutes')?.innerText,
      // note: row.querySelector('.note'), // FIXME:
      // flows: row.querySelector('.flows'), // FIXME:
      holidayText: row
        .querySelector<HTMLElement>('.time-span-banner')
        ?.querySelector<HTMLElement>('.bar.lh.rh')?.innerText,
    }));

    return records;
  };

  const getReportSummary = () => {
    const mapping = new Map(
      Array.from(
        document.querySelectorAll<HTMLElement>(
          '.report-summary > .row > .content > .column > .item',
        ),
      ).map((element) => {
        const name = element.querySelector<HTMLElement>('.name')?.innerText as ReportSummaryName;
        const value = element.querySelector<HTMLElement>('.value')?.innerText;
        return [name, value] as const;
      }),
    );

    return {
      prescribedWorkingDays: mapping.get('所定労働日数'),
      prescribedWorkingTime: mapping.get('所定労働時間'),
      actualWorkingDays: mapping.get('実労働日数'),
      actualWorkingTime: mapping.get('実労働時間'),
      overtimeWorkTime: mapping.get('時間外労働時間'),
      overtimeWorkIncludeTime: mapping.get('法定内'),
      overtimeWorkExcludeTime: mapping.get('法定外'),
      overtimeDeemedTime: mapping.get('みなし'),
      leavePaidTime: mapping.get('有給取得時間 (年休・特休など)'),
      leaveUnpaidTime: mapping.get('無給・欠勤・遅刻・早退'),
      nightWorkingTime: mapping.get('深夜労働時間'),
      dayOffWorkingTime: mapping.get('休日労働時間'),
    };
  };

  const displayedMonth = getDisplayedMonth();
  const listContent = getListContent();
  const reportSummary = getReportSummary();

  return { displayedMonth, listContent, reportSummary };
};

export type AttendanceReportDocument = ReturnType<typeof getAttendanceReportDocument>;
