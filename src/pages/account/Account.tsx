import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      toast.error('خروج از حساب کاربری با مشکل مواجه شد.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pt-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">حساب کاربری</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>اطلاعات حساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">ایمیل:</span>
            <span className="font-medium" dir="ltr">{currentUser?.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">وضعیت تایید ایمیل:</span>
            <span className="font-medium text-primary">
              {currentUser?.emailVerified ? 'تایید شده' : 'تایید نشده'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تنظیمات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">پوسته</span>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 ml-2" />
                حالت روشن
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 ml-2" />
                حالت تاریک
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full h-12" onClick={handleLogout}>
        <LogOut className="w-5 h-5 ml-2" />
        خروج از حساب
      </Button>
    </div>
  );
}