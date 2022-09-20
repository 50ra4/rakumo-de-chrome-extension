import { getDay, getDate, compareAsc, getMonth } from 'date-fns';
import { dateStringToDate, isMatchDateFormat, timeStringToMinute } from './utils/date';

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

export const getDisplayedMonth = () => {
  const text = document.querySelector<HTMLElement>('.period-select')?.innerText;
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
          isFirstDay,
          date,
          dayOfWeek,
          dayOfMonth,
          checkIn,
          checkOut,
          breakTimeMinute,
          workingTimeMinute,
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
    prescribedWorkingDays: prescribedWorkingDays
      ? daysStringToDays(prescribedWorkingDays)
      : undefined,
    prescribedWorkingTime,
    prescribedWorkingMinutes: prescribedWorkingTime
      ? timeStringToMinute(prescribedWorkingTime)
      : undefined,
    actualWorkingDays: actualWorkingDays ? daysStringToDays(actualWorkingDays) : undefined,
    actualWorkingTime,
    actualWorkingMinutes: actualWorkingTime ? timeStringToMinute(actualWorkingTime) : undefined,
    overtimeWorkTime,
    overtimeWorkMinutes: overtimeWorkTime ? timeStringToMinute(overtimeWorkTime) : undefined,
    overtimeWorkIncludeTime,
    overtimeWorkIncludeMinutes: overtimeWorkIncludeTime
      ? timeStringToMinute(overtimeWorkIncludeTime)
      : undefined,
    overtimeWorkExcludeTime,
    overtimeWorkExcludeMinutes: overtimeWorkExcludeTime
      ? timeStringToMinute(overtimeWorkExcludeTime)
      : undefined,
    overtimeDeemedTime,
    overtimeDeemedMinutes: overtimeDeemedTime ? timeStringToMinute(overtimeDeemedTime) : undefined,
    leavePaidTime,
    leavePaidMinutes: leavePaidTime ? timeStringToMinute(leavePaidTime) : undefined,
    leaveUnpaidTime,
    leaveUnpaidMinutes: leaveUnpaidTime ? timeStringToMinute(leaveUnpaidTime) : undefined,
    nightWorkingTime,
    nightWorkingMinutes: nightWorkingTime ? timeStringToMinute(nightWorkingTime) : undefined,
    dayOffWorkingTime,
    dayOffWorkingMinutes: dayOffWorkingTime ? timeStringToMinute(dayOffWorkingTime) : undefined,
  };
};

// FIXME: rename
export type ReportSummary = ReturnType<typeof getMonthlyAttendanceSummary>;
