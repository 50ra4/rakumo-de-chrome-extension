import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { AttendanceRecord } from '../document';

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
