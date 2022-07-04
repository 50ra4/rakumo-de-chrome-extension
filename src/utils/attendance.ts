import { getDay, getDate } from 'date-fns';
import { dateStringToDate, isMatchDateFormat, timeStringToMinute } from './date';
import { AttendanceReportDocument } from './document';

// NOTE: getAttendanceReportDocument で同時に行ったら、参照エラーになったので、popup側で呼び出すように修正した
export const toAttendanceRecords = (document: AttendanceReportDocument) => {
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

export type AttendanceRecord = ReturnType<typeof toAttendanceRecords>[number];
