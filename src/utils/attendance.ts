import { getDay, getDate, getMonth, format, compareAsc } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { dateStringToDate, isMatchDateFormat, timeStringToMinute } from './date';
import { AttendanceReportDocument } from '../document';

export const toAttendanceRecordMonth = (monthStr: string) =>
  dateStringToDate(monthStr, 'yyyy年 M月度');

// NOTE: getAttendanceReportDocument で同時に行ったら、参照エラーになったので、popup側で呼び出すように修正した
export const toAttendanceRecords = (document: AttendanceReportDocument) => {
  const displayedMonth = toAttendanceRecordMonth(document.displayedMonth);
  const month = getMonth(displayedMonth) + 1;

  return document.listContent
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
};

export type AttendanceRecord = ReturnType<typeof toAttendanceRecords>[number];

const daysStringToDays = (str: string) => {
  const parsed = parseInt(str.trim().replace('日', ''), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const toReportSummary = ({
  reportSummary: {
    prescribedWorkingDays,
    prescribedWorkingTime,
    actualWorkingDays,
    actualWorkingTime,
    overtimeWorkTime,
    overtimeWorkIncludeTime,
    overtimeWorkExcludeTime,
    overtimeDeemedTime,
    leavePaidTime,
    leaveUnpaidTime,
    nightWorkingTime,
    dayOffWorkingTime,
  },
}: AttendanceReportDocument) => ({
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
});

export type ReportSummary = ReturnType<typeof toReportSummary>;

export const isValidWorkingMinutesFormat = (x: unknown): x is string =>
  typeof x === 'string' && isMatchDateFormat(x, 'H:mm');

export const toWorkingMinutes = (workingTimeStr: string) => {
  if (!isValidWorkingMinutesFormat(workingTimeStr)) {
    throw Error('WORKING TIME FORMAT IS INVALID');
  }
  return timeStringToMinute(workingTimeStr);
};

export const calcExpectedReportSummary = ({
  dailyWorkingMinutes,
  summary: {
    prescribedWorkingDays = 0,
    prescribedWorkingMinutes = 0,
    actualWorkingDays = 0,
    actualWorkingMinutes = 0,
    leavePaidMinutes = 0,
  },
}: {
  dailyWorkingMinutes: number;
  summary: ReportSummary;
}) => {
  /** 予想の残実労働時間 = 残りの労働日数 * 1日の勤務時間 */
  const expectedRemainingActualWorkingMinutes =
    // FIXME: 休暇日数を除外する
    (prescribedWorkingDays - actualWorkingDays) * dailyWorkingMinutes;

  /** 予想の実労働時間 */
  const expectedActualWorkingMinutes = expectedRemainingActualWorkingMinutes + actualWorkingMinutes;

  /** 予想の時間外勤務時間 = 予想の実労働時間 - 所定労働時間 - 有給取得時間 */
  const expectedOvertimeWorkingMinutes =
    expectedActualWorkingMinutes - prescribedWorkingMinutes - leavePaidMinutes;

  return {
    expectedRemainingActualWorkingMinutes,
    expectedOvertimeWorkingMinutes,
    expectedActualWorkingMinutes,
  };
};

const formatHoursText = ({ start, end }: { start?: Date; end?: Date }) =>
  `${start ? format(start, 'HH:mm') : 'N/A'}-${end ? format(end, 'HH:mm') : 'N/A'}`;

const formatWorkingHoursText = ({
  checkIn,
  checkOut,
  isDayOff,
  isHoliday,
  holidayText,
}: {
  checkIn?: Date;
  checkOut?: Date;
  isDayOff: boolean;
  isHoliday: boolean;
  holidayText: string;
}) => {
  if (isDayOff && !checkIn && !checkOut) {
    return '休日';
  }
  if (isHoliday) {
    return holidayText;
  }
  if (!checkIn && !checkOut) {
    return 'N/A';
  }
  return formatHoursText({ start: checkIn, end: checkOut });
};

const toWorkingHour = ({
  date,
  checkIn,
  checkOut,
  isDayOff,
  isHoliday,
  holidayText,
  dayOfWeek,
}: AttendanceRecord) => ({
  date: format(date, 'MM/dd(EEEEE)', { locale: ja }),
  workingHours: formatWorkingHoursText({ checkIn, checkOut, isDayOff, isHoliday, holidayText }),
  dayOfWeek,
});

export const generateCsv = (records: AttendanceRecord[]) => {
  const headers = ['日付', '勤務時間'];
  const monthlyWorkingHours = records
    .map(toWorkingHour)
    .map(({ date, workingHours }) => [date, workingHours]);
  const data = [headers, ...monthlyWorkingHours]
    .map((arr) => arr.map((v) => `"${v}"`).join(','))
    .join('\n');
  return new Blob([data], { type: 'text/csv' });
};

export const generateTextPlain = (records: AttendanceRecord[]) => {
  const lines: string[] = [];

  lines.push('【稼働詳細】');
  records.map(toWorkingHour).forEach(({ date, workingHours, dayOfWeek }) => {
    lines.push(`${date} ${workingHours}`);
    if (dayOfWeek !== 0) return;
    lines.push('');
  });

  return new Blob([lines.join('\n')], { type: 'text/plain' });
};

export const createAttendanceRecordFilename = (month: Date, extension: string) => {
  const dateStr = format(month, 'yyyy-MM');
  return `${dateStr}_report.${extension}`;
};
