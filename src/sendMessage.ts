export type SendMessageResponse<T, E extends Error> =
  | {
      status: 'error';
      error: E;
    }
  | {
      status: 'success';
      data: T;
    };

export const SendMessageActionName = {
  reportExport: 'reportExport',
} as const;

export type AttendanceReportExportRequest = { name: typeof SendMessageActionName.reportExport };

export type SendMessageRequest = AttendanceReportExportRequest;
