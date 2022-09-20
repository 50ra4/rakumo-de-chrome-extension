import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { AttendanceRecord, ReportSummary } from '../document';
import { isMatchDateFormat, timeStringToMinute } from './date';

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
