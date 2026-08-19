import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const UserSchema = z.object({
  email: z.string().email(),
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp, 'Must be a Firestore Timestamp'),
  updatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp, 'Must be a Firestore Timestamp'),
});
export type User = z.infer<typeof UserSchema>;

export const ExpenseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'عنوان الزامی است'),
  amountToman: z.number().int().positive('مبلغ باید بیشتر از صفر باشد'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  categoryNameSnapshot: z.string(),
  description: z.string().nullable(),
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp, 'Must be a Firestore Timestamp'),
  updatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp, 'Must be a Firestore Timestamp'),
  source: z.enum(['manual', 'voice']),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const CategorySchema = z.object({
  id: z.string().optional(),
  nameFa: z.string().min(1, 'نام دسته‌بندی الزامی است'),
  icon: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp, 'Must be a Firestore Timestamp'),
  updatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp, 'Must be a Firestore Timestamp'),
});
export type Category = z.infer<typeof CategorySchema>;

export const GeminiExpenseSchema = z.object({
  title: z.string().nullable(),
  amountToman: z.number().int().nullable(),
  categoryId: z.string().nullable(),
  description: z.string().nullable(),
  uncertainFields: z.array(z.string()),
  interpretationNote: z.string().nullable()
});
export type GeminiExpense = z.infer<typeof GeminiExpenseSchema>;