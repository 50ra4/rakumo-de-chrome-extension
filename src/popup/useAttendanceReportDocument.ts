import { useCallback, useRef, useState } from 'react';
import { AttendanceReportDocument } from '../document';
import { sendMessage } from '../sendMessage';

export const useAttendanceReportDocument = () => {
  const isFetching = useRef(false);
  const [{ data, updatedAt }, setState] = useState<{
    data: AttendanceReportDocument | Error | null;
    updatedAt: Date;
  }>({
    data: null,
    updatedAt: new Date(),
  });

  const fetch = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;

    sendMessage<AttendanceReportDocument>(
      { name: 'FETCH_ATTENDANCE_REPORT_DOCUMENT' },
      (response) => {
        setState({
          data: response.status !== 'success' ? response.error : response.data,
          updatedAt: new Date(),
        });
        isFetching.current = false;
      },
    );
  }, []);

  return {
    fetchAttendanceReportDocument: fetch,
    attendanceReportDocument: data instanceof Error ? undefined : data,
    error: data instanceof Error ? data : undefined,
    updatedAt,
  } as const;
};
