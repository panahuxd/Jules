import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

export default function Admin() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!currentUser) return;
      try {
        const tokenResult = await currentUser.getIdTokenResult();
        if (tokenResult.claims.admin) {
          setIsAdmin(true);
          fetchUsers();
          fetchCategories();
        } else {
          toast.error('شما دسترسی مدیریت ندارید.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setVerifying(false);
      }
    };
    if (!authLoading) verifyAdmin();
  }, [currentUser, authLoading]);

  const fetchUsers = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      toast.error('خطا در دریافت لیست کاربران');
    }
  };

  const fetchCategories = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      toast.error('خطا در دریافت لیست دسته‌بندی‌ها');
    }
  };

  if (authLoading || verifying) {
    return <div className="p-8 text-center">در حال بررسی دسترسی...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">پنل مدیریت</h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">کاربران</TabsTrigger>
          <TabsTrigger value="categories">دسته‌بندی‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت کاربران</CardTitle>
              <CardDescription>لیست تمامی کاربرانی که در سیستم ثبت نام کرده‌اند.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">ایمیل</TableHead>
                      <TableHead className="text-right">UID</TableHead>
                      <TableHead className="text-right">وضعیت تایید ایمیل</TableHead>
                      <TableHead className="text-right">تاریخ عضویت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium text-left" dir="ltr">{user.email}</TableCell>
                        <TableCell className="text-xs font-mono">{user.uid}</TableCell>
                        <TableCell>{user.emailVerified ? 'تایید شده' : 'تایید نشده'}</TableCell>
                        <TableCell>{new Date(user.metadata.creationTime).toLocaleDateString('fa-IR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
              <CardDescription>افزودن، ویرایش و غیرفعال کردن دسته‌بندی‌های سیستم.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground mb-4">برای جلوگیری از پیچیدگی این بخش فقط نمایش دسته‌بندی‌های فعلی است.</p>
               <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">نام (فارسی)</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">ترتیب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.nameFa}</TableCell>
                        <TableCell>{cat.isActive ? 'فعال' : 'غیرفعال'}</TableCell>
                        <TableCell>{cat.sortOrder}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}