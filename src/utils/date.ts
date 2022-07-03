import { parse, isMatch, hoursToMinutes } from 'date-fns';
import ja from 'date-fns/locale/ja';

const RAKUMO_DATE_FORMAT = ['M/d (EEEEE)', 'd (EEEEE)', 'H:mm'] as const;

type DateFormat = typeof RAKUMO_DATE_FORMAT[number];

const REF_DATE = new Date();

export const dateStringToDate = (str: string, dateFormat: DateFormat) =>
  parse(str, dateFormat, REF_DATE, { locale: ja });

export const timeStringToMinute = (str: string): number => {
  const parsed = str.split(':').map((v) => +v);
  if (parsed.length !== 2 || parsed.some((v) => Number.isNaN(v))) {
    console.warn(`${str} is not timeString format`);
    return 0;
  }
  const [hour, minute] = parsed;
  return hoursToMinutes(hour) + minute;
};

export const isMatchDateFormat = (str: string, dateFormat: DateFormat): boolean => {
  try {
    return isMatch(str, dateFormat, { locale: ja });
  } catch (error) {
    return false;
  }
};
