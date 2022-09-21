import { AttendanceRecord, MonthlyAttendanceSummary } from '../document';
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
  records,
}: {
  dailyWorkingMinutes: number;
  summary: MonthlyAttendanceSummary;
  records: AttendanceRecord[];
}) => {
  const holidaysInPast = records.filter(({ isHoliday, isFuture }) => isHoliday && !isFuture).length;

  /** [予測]残実労働時間 = 残りの労働日数 * 1日の勤務時間 */
  const expectedRemainingActualWorkingMinutes =
    (prescribedWorkingDays - actualWorkingDays - holidaysInPast) * dailyWorkingMinutes;

  /** [予測]実労働時間 = [予測]残実労働時間 + 実労働時間 */
  const expectedActualWorkingMinutes = expectedRemainingActualWorkingMinutes + actualWorkingMinutes;

  /** [予測]時間外勤務時間 = A.[予測]実労働時間 - (C.所定労働時間 - B.有給取得時間) */
  const expectedOvertimeWorkingMinutes =
    expectedActualWorkingMinutes - (prescribedWorkingMinutes - leavePaidMinutes);

  return {
    /** [予測]残りの実労働時間（分） */
    expectedRemainingActualWorkingMinutes,
    /** [予測]時間外勤務時間（分） */
    expectedOvertimeWorkingMinutes,
    /** [予測]実労働時間（分） */
    expectedActualWorkingMinutes,
  };
};
