import { getDay, getDate, compareAsc, getMonth, isFuture } from 'date-fns';
import { dateStringToDate, isMatchDateFormat, timeStringToMinute } from './utils/date';

export const getDisplayedMonthElement = () => document.querySelector<HTMLElement>('.period-select');

export const getDisplayedMonth = () => {
  const text = getDisplayedMonthElement()?.innerText;
  if (!text) return undefined;
  return dateStringToDate(text, 'yyyy年 M月度');
};

export const getMonthlyAttendanceRecord = () => {
  const displayedMonth = getDisplayedMonth();
  const element = document.querySelector('div.list-content');
  if (!displayedMonth || !element) return undefined;

  const month = getMonth(displayedMonth) + 1;
  const rows = Array.from(element.querySelectorAll('div.trow').values());
  const records = rows
    .map((row) => ({
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
    }))
    .map(
      ({
        date: dateStr,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        breakTime,
        workingTime,
        holidayText = '',
        ...rest
      }) => {
        const isHoliday = holidayText.startsWith('全休');
        const isFirstDay = isMatchDateFormat(dateStr, 'M/d (EEEEE)');
        const date = dateStringToDate(isFirstDay ? dateStr : `${month}/${dateStr}`, 'M/d (EEEEE)');
        const dayOfWeek = getDay(date);
        const dayOfMonth = getDate(date);
        const checkIn = checkInStr ? dateStringToDate(checkInStr, 'H:mm') : undefined;
        const checkOut = checkOutStr ? dateStringToDate(checkOutStr, 'H:mm') : undefined;
        const breakTimeMinute = breakTime ? timeStringToMinute(breakTime) : undefined;
        const workingTimeMinute = workingTime ? timeStringToMinute(workingTime) : undefined;
        return {
          ...rest,
          month,
          isHoliday,
          holidayText,
          date,
          dayOfWeek,
          dayOfMonth,
          checkIn,
          checkOut,
          breakTimeMinute,
          workingTimeMinute,
          isFuture: isFuture(date),
        };
      },
    )
    .sort((a, b) => compareAsc(a.date, b.date));

  return {
    month: displayedMonth,
    records,
  };
};

export type MonthlyAttendanceRecord = NonNullable<ReturnType<typeof getMonthlyAttendanceRecord>>;
export type AttendanceRecord = MonthlyAttendanceRecord['records'][number];

const daysStringToDays = (str: string) => {
  const parsed = parseInt(str.trim().replace('日', ''), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

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

export const getMonthlyAttendanceSummary = () => {
  const mapping = new Map(
    Array.from(
      document.querySelectorAll<HTMLElement>('.report-summary > .row > .content > .column > .item'),
    ).map((element) => {
      const name = element.querySelector<HTMLElement>('.name')?.innerText as ReportSummaryName;
      const value = element.querySelector<HTMLElement>('.value')?.innerText;
      return [name, value] as const;
    }),
  );

  const prescribedWorkingDays = mapping.get('所定労働日数');
  const prescribedWorkingTime = mapping.get('所定労働時間');
  const actualWorkingDays = mapping.get('実労働日数');
  const actualWorkingTime = mapping.get('実労働時間');
  const overtimeWorkTime = mapping.get('時間外労働時間');
  const overtimeWorkIncludeTime = mapping.get('法定内');
  const overtimeWorkExcludeTime = mapping.get('法定外');
  const overtimeDeemedTime = mapping.get('みなし');
  const leavePaidTime = mapping.get('有給取得時間 (年休・特休など)');
  const leaveUnpaidTime = mapping.get('無給・欠勤・遅刻・早退');
  const nightWorkingTime = mapping.get('深夜労働時間');
  const dayOffWorkingTime = mapping.get('休日労働時間');

  return {
    /** 所定労働日数 */
    prescribedWorkingDays: prescribedWorkingDays
      ? daysStringToDays(prescribedWorkingDays)
      : undefined,
    /** 所定労働時間 */
    prescribedWorkingTime,
    /** 所定労働時間（分） */
    prescribedWorkingMinutes: prescribedWorkingTime
      ? timeStringToMinute(prescribedWorkingTime)
      : undefined,
    /** 実労働日数 */
    actualWorkingDays: actualWorkingDays ? daysStringToDays(actualWorkingDays) : undefined,
    /** 実労働時間 */
    actualWorkingTime,
    /** 実労働時間（分） */
    actualWorkingMinutes: actualWorkingTime ? timeStringToMinute(actualWorkingTime) : undefined,
    /** 時間外労働時間 */
    overtimeWorkTime,
    /** 時間外労働時間(分) */
    overtimeWorkMinutes: overtimeWorkTime ? timeStringToMinute(overtimeWorkTime) : undefined,
    /** 時間外労働時間・法定内 */
    overtimeWorkIncludeTime,
    /** 時間外労働時間・法定内（分） */
    overtimeWorkIncludeMinutes: overtimeWorkIncludeTime
      ? timeStringToMinute(overtimeWorkIncludeTime)
      : undefined,
    /** 時間外労働時間・法定外 */
    overtimeWorkExcludeTime,
    /** 時間外労働時間・法定外（分） */
    overtimeWorkExcludeMinutes: overtimeWorkExcludeTime
      ? timeStringToMinute(overtimeWorkExcludeTime)
      : undefined,
    /** 時間外労働時間・みなし */
    overtimeDeemedTime,
    /** 時間外労働時間・みなし（分） */
    overtimeDeemedMinutes: overtimeDeemedTime ? timeStringToMinute(overtimeDeemedTime) : undefined,
    /** 有給取得時間 (年休・特休など) */
    leavePaidTime,
    /** 有給取得時間 (年休・特休など)（分） */
    leavePaidMinutes: leavePaidTime ? timeStringToMinute(leavePaidTime) : undefined,
    /** 無給・欠勤・遅刻・早退 */
    leaveUnpaidTime,
    /** 無給・欠勤・遅刻・早退（分） */
    leaveUnpaidMinutes: leaveUnpaidTime ? timeStringToMinute(leaveUnpaidTime) : undefined,
    /** 深夜労働時間 */
    nightWorkingTime,
    /** 深夜労働時間（分） */
    nightWorkingMinutes: nightWorkingTime ? timeStringToMinute(nightWorkingTime) : undefined,
    /** 休日労働時間 */
    dayOffWorkingTime,
    /** 休日労働時間（分） */
    dayOffWorkingMinutes: dayOffWorkingTime ? timeStringToMinute(dayOffWorkingTime) : undefined,
  };
};

export type MonthlyAttendanceSummary = ReturnType<typeof getMonthlyAttendanceSummary>;

export const getLastAggregationTimeElement = () =>
  document.querySelector<HTMLElement>('.lastAggregationTime');

export const getLastAggregationTime = () => {
  const elm = getLastAggregationTimeElement()?.lastElementChild as HTMLElement | undefined;
  if (!elm) {
    return undefined;
  }
  if (!elm.innerText) {
    return undefined;
  }
  return dateStringToDate(elm.innerText, 'yyyy年M月d日 H:mm');
};
