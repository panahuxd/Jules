const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const normalizeDigits = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (w) => persianDigits.indexOf(w).toString())
    .replace(/[٠-٩]/g, (w) => arabicDigits.indexOf(w).toString());
};

export const formatToman = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return '';

  // Ensure it's a number, drop decimals
  const num = typeof amount === 'string' ? parseInt(normalizeDigits(amount.replace(/,/g, '')), 10) : Math.floor(amount);

  if (isNaN(num)) return '';

  // Format with commas and Persian locales
  return new Intl.NumberFormat('fa-IR').format(num) + ' تومان';
};

export const parseAmount = (amountStr: string): number => {
  const normalized = normalizeDigits(amountStr).replace(/[,٬]/g, '');
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 0 : parsed;
};