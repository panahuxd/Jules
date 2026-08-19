import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { addExpense, getActiveCategories } from '@/lib/firestore';
import { formatToman, parseAmount } from '@/lib/numbers';
import { type Category } from '@/types/index';
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
import VoiceRecorder from '@/components/expenses/VoiceRecorder';
import { type GeminiExpense } from '@/types/index';

const expenseFormSchema = z.object({
  title: z.string().min(1, 'عنوان هزینه الزامی است'),
  amountInput: z.string().min(1, 'مبلغ الزامی است'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  description: z.string().optional(),
  source: z.enum(['manual', 'voice']).default('manual'),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function AddExpense() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amountInput: '',
      categoryId: '',
      description: '',
      source: 'manual',
    },
  });

  const categoriesContext = JSON.stringify(
    categories.map(c => ({ id: c.id, nameFa: c.nameFa }))
  );

  const handleVoiceResult = (result: GeminiExpense) => {
    if (result.title) form.setValue('title', result.title);
    if (result.amountToman) {
      form.setValue('amountInput', formatToman(result.amountToman).replace(' تومان', ''));
    } else {
       toast.error('نتوانستم مبلغ هزینه را تشخیص دهم. لطفاً آن را وارد کنید.');
    }
    if (result.categoryId) {
      form.setValue('categoryId', result.categoryId);
    } else {
      const otherCat = categories.find(c => c.nameFa === 'سایر');
      if (otherCat && otherCat.id) {
         form.setValue('categoryId', otherCat.id);
      }
    }
    if (result.description) form.setValue('description', result.description);

    form.setValue('source', 'voice');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getActiveCategories();
        if (cats.length === 0) {
          setCategories([
            { id: '1', nameFa: 'خوراک', isActive: true, sortOrder: 1, createdAt: null as any, updatedAt: null as any },
            { id: '2', nameFa: 'حمل‌ونقل', isActive: true, sortOrder: 2, createdAt: null as any, updatedAt: null as any },
            { id: '3', nameFa: 'خرید', isActive: true, sortOrder: 3, createdAt: null as any, updatedAt: null as any },
            { id: '4', nameFa: 'سایر', isActive: true, sortOrder: 4, createdAt: null as any, updatedAt: null as any }
          ]);
        } else {
          setCategories(cats);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!currentUser) return;

    const amountToman = parseAmount(data.amountInput);

    if (amountToman <= 0) {
      form.setError('amountInput', { message: 'مبلغ باید بیشتر از صفر باشد' });
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedCategory = categories.find(c => c.id === data.categoryId) || categories[0];

      await addExpense(currentUser.uid, {
        title: data.title,
        amountToman,
        categoryId: selectedCategory.id!,
        categoryNameSnapshot: selectedCategory.nameFa,
        description: data.description || null,
        source: data.source || 'manual',
      });

      toast.success('هزینه با موفقیت ثبت شد.');

      form.reset();

    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('خطا در ثبت هزینه. لطفاً دوباره تلاش کنید.');
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
    <div className="max-w-md mx-auto p-4 pt-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">ثبت هزینه جدید</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان هزینه</FormLabel>
                <FormControl>
                  <Input placeholder="مثلاً خرید قهوه" {...field} />
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
                    placeholder="مبلغ به تومان"
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
                <FormLabel>توضیحات (اختیاری)</FormLabel>
                <FormControl>
                  <Textarea placeholder="توضیحات تکمیلی..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2 flex flex-col gap-3">
            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'ثبت هزینه'}
            </Button>
            <VoiceRecorder
              categoriesContext={categoriesContext}
              onResult={handleVoiceResult}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
