import { MonthlyAttendanceSummary } from '../document';
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
  summary: MonthlyAttendanceSummary;
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
