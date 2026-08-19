import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { updateExpense, getActiveCategories } from '@/lib/firestore';
import { formatToman, parseAmount } from '@/lib/numbers';
import { type Expense, type Category } from '@/types/index';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const editExpenseSchema = z.object({
  title: z.string().min(1, 'عنوان هزینه الزامی است'),
  amountInput: z.string().min(1, 'مبلغ الزامی است'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  description: z.string().optional(),
});

type EditExpenseFormValues = z.infer<typeof editExpenseSchema>;

interface EditExpenseProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditExpense({ expense, open, onOpenChange, onSuccess }: EditExpenseProps) {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditExpenseFormValues>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      title: expense.title,
      amountInput: expense.amountToman.toString(),
      categoryId: expense.categoryId,
      description: expense.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: expense.title,
        amountInput: formatToman(expense.amountToman).replace(' تومان', ''),
        categoryId: expense.categoryId,
        description: expense.description || '',
      });

      const fetchCategories = async () => {
        try {
          const cats = await getActiveCategories();
          setCategories(cats);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchCategories();
    }
  }, [open, expense, form]);

  const onSubmit = async (data: EditExpenseFormValues) => {
    if (!currentUser || !expense.id) return;

    const amountToman = parseAmount(data.amountInput);

    if (amountToman <= 0) {
      form.setError('amountInput', { message: 'مبلغ باید بیشتر از صفر باشد' });
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedCategory = categories.find(c => c.id === data.categoryId);

      await updateExpense(currentUser.uid, expense.id, {
        title: data.title,
        amountToman,
        categoryId: data.categoryId,
        categoryNameSnapshot: selectedCategory ? selectedCategory.nameFa : expense.categoryNameSnapshot,
        description: data.description || null,
      });

      toast.success('هزینه با موفقیت بروزرسانی شد.');
      onOpenChange(false);
      onSuccess();

    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('خطا در بروزرسانی هزینه. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const parsed = parseAmount(e.target.value);
    if (parsed > 0) {
      onChange(formatToman(parsed).replace(' تومان', ''));
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">ویرایش هزینه</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان هزینه</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      dir="ltr"
                      className="text-right"
                      {...field}
                      onChange={(e) => {
                        handleAmountChange(e, field.onChange);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دسته‌بندی</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="انتخاب دسته‌بندی" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id!}>
                          {category.nameFa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ثبت...' : 'ذخیره تغییرات'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                انصراف
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}