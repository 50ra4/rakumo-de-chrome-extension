import { MonthlyAttendanceSummary } from '../document';
import { calcExpectedReportSummary, isValidWorkingMinutesFormat } from './attendance';

const createMonthlyAttendanceSummary = ({
  prescribedWorkingDays = 0,
  prescribedWorkingMinutes = 0,
  actualWorkingDays = 0,
  actualWorkingMinutes = 0,
  leavePaidMinutes = 0,
}: Partial<
  Pick<
    MonthlyAttendanceSummary,
    | 'prescribedWorkingDays'
    | 'prescribedWorkingMinutes'
    | 'actualWorkingDays'
    | 'actualWorkingMinutes'
    | 'leavePaidMinutes'
  >
>): MonthlyAttendanceSummary => {
  return {
    prescribedWorkingDays,
    prescribedWorkingMinutes,
    actualWorkingDays,
    actualWorkingMinutes,
    leavePaidMinutes,
  } as MonthlyAttendanceSummary;
};

describe('attendance', () => {
  describe('calcExpectedReportSummary', () => {
    describe('[予測]残りの実労働時間', () => {
      it('所定労働日数から実労働日数を引いた日数分の労働時間を返却する', () => {
        expect(
          calcExpectedReportSummary({
            dailyWorkingMinutes: 60,
            holidaysInPast: 0,
            summary: createMonthlyAttendanceSummary({
              prescribedWorkingDays: 10,
              actualWorkingDays: 9,
            }),
          }),
        ).toHaveProperty('expectedRemainingActualWorkingMinutes', 60);
      });
      it('所定労働日数から実労働日数と休暇日数を引いた日数分の労働時間を返却する', () => {
        expect(
          calcExpectedReportSummary({
            dailyWorkingMinutes: 60,
            holidaysInPast: 1,
            summary: createMonthlyAttendanceSummary({
              prescribedWorkingDays: 10,
              actualWorkingDays: 8,
            }),
          }),
        ).toHaveProperty('expectedRemainingActualWorkingMinutes', 60);
      });
    });

    describe('[予測]時間外勤務時間', () => {
      it('[予測]実労働時間から所定労働時間と有給取得時間を引いた時間を返却する', () => {
        expect(
          calcExpectedReportSummary({
            dailyWorkingMinutes: 60,
            holidaysInPast: 0,
            summary: createMonthlyAttendanceSummary({
              prescribedWorkingDays: 10,
              actualWorkingDays: 9,
              prescribedWorkingMinutes: 70,
              leavePaidMinutes: 0,
            }),
          }),
        ).toHaveProperty('expectedOvertimeWorkingMinutes', -10);
        expect(
          calcExpectedReportSummary({
            dailyWorkingMinutes: 60,
            holidaysInPast: 0,
            summary: createMonthlyAttendanceSummary({
              prescribedWorkingDays: 10,
              actualWorkingDays: 9,
              prescribedWorkingMinutes: 70,
              leavePaidMinutes: 10,
            }),
          }),
        ).toHaveProperty('expectedOvertimeWorkingMinutes', 0);
      });
    });
  });

  describe('isValidWorkingMinutesFormat', () => {
    it('H:mmのフォーマットを満たすとき、trueを返却', () => {
      expect(isValidWorkingMinutesFormat('5:30')).toBe(true);
    });
    it('時刻がnumberでない、または分がnumberでない場合、falseを返却', () => {
      expect(isValidWorkingMinutesFormat('x:30')).toBe(false);
      expect(isValidWorkingMinutesFormat('2:x')).toBe(false);
    });
    it('分が60以上の場合、falseを返却', () => {
      // TODO:
      expect(isValidWorkingMinutesFormat('2:00')).toBe(true);
      expect(isValidWorkingMinutesFormat('2:59')).toBe(true);
      expect(isValidWorkingMinutesFormat('2:60')).toBe(false);
    });
    it('時刻が24より大きい場合、trueを返却', () => {
      expect(isValidWorkingMinutesFormat('23:59')).toBe(true);
      expect(isValidWorkingMinutesFormat('24:00')).toBe(true);
      expect(isValidWorkingMinutesFormat('25:00')).toBe(true);
    });
  });
});
