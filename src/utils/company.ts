const COMPANY_STANDARD_WORKING_HOUR = 8; // TODO: テキストボックスを追加する
const HOUR_MINUTE = 60;
const COMPANY_STANDARD_WORKING_MINUTE = COMPANY_STANDARD_WORKING_HOUR * HOUR_MINUTE;

export const calcCompanyWorkingTimes = ({
  prescribedWorkingDays = 0,
  actualWorkingMinutes = 0,
  overtimeDeemedMinutes = 0,
  holidays,
}: {
  prescribedWorkingDays?: number;
  actualWorkingMinutes?: number;
  overtimeDeemedMinutes?: number;
  holidays: number;
}) => {
  /** （社内）労働時間（分） */
  const companyPrescribedWorkingMinutes = prescribedWorkingDays * COMPANY_STANDARD_WORKING_MINUTE;

  /** （社内）有給取得時間 */
  const companyLeavePaidMinutes = holidays * COMPANY_STANDARD_WORKING_MINUTE;

  /** （社内）総労働時間 */
  const companyTotalWorkingMinutes = actualWorkingMinutes + companyLeavePaidMinutes;

  /** （社内）時間外労働時間 */
  const companyOvertimeWorkMinutes = companyTotalWorkingMinutes - companyPrescribedWorkingMinutes;

  /** （支払予定の）超過時間外勤務時間 */
  const companyPaidOvertimeWorkMinutes = companyOvertimeWorkMinutes - overtimeDeemedMinutes;

  return {
    companyPrescribedWorkingMinutes,
    companyTotalWorkingMinutes,
    companyLeavePaidMinutes,
    companyOvertimeWorkMinutes,
    companyPaidOvertimeWorkMinutes,
  };
};
