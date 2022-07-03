import { getDay, getDate } from 'date-fns';
import { dateStringToDate, isMatchDateFormat, timeStringToMinute } from './date';

type HTMLElementOrNull = HTMLElement | null;

export const getCellsFromDocument = () => {
  const element = document.querySelector('div.list-content');
  if (!element) return;

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

export type ContentCells = ReturnType<typeof getCellsFromDocument>;

// NOTE: getCellsFromDocument で同時に行ったら、参照エラーになったので、popup側で呼び出すように修正した
export const toAttendanceRecords = (params: ContentCells) => {
  if (!params) return [];

  return params.map(
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
      // FIXME: month is different
      const date = dateStringToDate(dateStr, isFirstDay ? 'M/d (EEEEE)' : 'd (EEEEE)');
      const dayOfWeek = getDay(new Date());
      const dayOfMonth = getDate(new Date());
      const checkIn = checkInStr ? dateStringToDate(checkInStr, 'H:mm') : undefined;
      const checkOut = checkOutStr ? dateStringToDate(checkOutStr, 'H:mm') : undefined;
      const breakTimeMinute = breakTime ? timeStringToMinute(breakTime) : undefined;
      const workingTimeMinute = workingTime ? timeStringToMinute(workingTime) : undefined;
      return {
        ...rest,
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
  );
};

export type AttendanceRecords = ReturnType<typeof toAttendanceRecords>;
