import { getDay, getDate, getMonth } from 'date-fns';
import { dateStringToDate, isMatchDateFormat, timeStringToMinute } from './date';
import { AttendanceReportDocument } from './document';

// NOTE: getAttendanceReportDocument で同時に行ったら、参照エラーになったので、popup側で呼び出すように修正した
export const toAttendanceRecords = (document: AttendanceReportDocument) => {
  const displayedMonth = dateStringToDate(document.displayedMonth, 'yyyy年 M月度');
  const month = getMonth(displayedMonth) + 1;

  return document.listContent.map(
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
  );
};

export type AttendanceRecord = ReturnType<typeof toAttendanceRecords>[number];
