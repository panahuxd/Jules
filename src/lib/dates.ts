import { format, startOfMonth, addMonths, subMonths } from 'date-fns-jalali';
import { Timestamp } from 'firebase/firestore';

export const getCurrentJalaliMonth = () => {
  return new Date();
};

export const getJalaliMonthName = (date: Date) => {
  return format(date, 'MMMM yyyy'); // e.g., "مرداد ۱۴۰۵"
};

export const getPreviousJalaliMonth = (date: Date) => {
  return subMonths(date, 1);
};

export const getNextJalaliMonth = (date: Date) => {
  return addMonths(date, 1);
};

export const getJalaliMonthBoundaries = (date: Date) => {
  return {
    start: startOfMonth(date),
    end: startOfMonth(addMonths(date, 1)),
  };
};

export const formatJalaliDate = (timestamp: Timestamp | Date | null | undefined): string => {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return format(date, 'yyyy/MM/dd'); // e.g. "1403/05/12"
};

export const formatJalaliTime = (timestamp: Timestamp | Date | null | undefined): string => {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return format(date, 'HH:mm');
};
