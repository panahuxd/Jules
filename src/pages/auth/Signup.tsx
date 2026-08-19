import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const signupSchema = z
  .object({
    email: z.string().email('ایمیل معتبر نیست'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await sendEmailVerification(userCredential.user);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('این ایمیل قبلاً ثبت شده است.');
      } else if (err.code === 'auth/weak-password') {
        setError('رمز عبور باید حداقل شرایط امنیتی را داشته باشد.');
      } else {
        setError('خطایی رخ داد. اتصال اینترنت را بررسی کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">ثبت‌نام موفق</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>حساب کاربری شما با موفقیت ایجاد شد.</p>
            <p className="mt-2 text-muted-foreground">لطفاً ایمیل خود را برای تایید بررسی کنید.</p>
            <p className="mt-4 text-sm">در حال انتقال...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ثبت‌نام در مستر اکسپنسر</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input placeholder="ایمیل خود را وارد کنید" type="email" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input placeholder="رمز عبور" type="password" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تکرار رمز عبور</FormLabel>
                    <FormControl>
                      <Input placeholder="تکرار رمز عبور" type="password" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'در حال ثبت‌نام...' : 'ایجاد حساب کاربری'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <div>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              وارد شوید
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}