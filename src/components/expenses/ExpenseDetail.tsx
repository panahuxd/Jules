import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { deleteExpense } from '@/lib/firestore';
import { type Expense } from '@/types/index';
import { formatToman } from '@/lib/numbers';
import { formatJalaliDate, formatJalaliTime } from '@/lib/dates';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import EditExpense from './EditExpense';

interface ExpenseDetailProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export default function ExpenseDetail({ expense, open, onOpenChange, onRefresh }: ExpenseDetailProps) {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!expense) return null;

  const handleDelete = async () => {
    if (!currentUser || !expense.id) return;

    try {
      setIsDeleting(true);
      await deleteExpense(currentUser.uid, expense.id);
      toast.success('هزینه با موفقیت حذف شد.');
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('خطا در حذف هزینه.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    onRefresh();
  };

  return (
    <>
      <Drawer open={open && !showEdit} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto w-full max-w-sm" dir="rtl">
            <DrawerHeader>
              <DrawerTitle className="text-right text-xl">{expense.title}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-0 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">مبلغ:</span>
                <span className="font-bold text-lg text-primary">{formatToman(expense.amountToman)}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">دسته‌بندی:</span>
                <span className="bg-secondary px-3 py-1 rounded-full text-sm">
                  {expense.categoryNameSnapshot}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">تاریخ و زمان:</span>
                <div className="text-left">
                  <div>{formatJalaliDate(expense.createdAt)}</div>
                  <div className="text-sm text-muted-foreground">{formatJalaliTime(expense.createdAt)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">نحوه ثبت:</span>
                <span className="text-sm">
                  {expense.source === 'voice' ? 'ثبت با صدا' : 'ثبت دستی'}
                </span>
              </div>

              {expense.description && (
                <div className="pb-4">
                  <span className="text-muted-foreground block mb-2">توضیحات:</span>
                  <p className="text-sm bg-muted/50 p-3 rounded-md leading-relaxed whitespace-pre-wrap">
                    {expense.description}
                  </p>
                </div>
              )}
            </div>

            <DrawerFooter className="flex-row gap-2 pt-6">
              <Button
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => setShowEdit(true)}
              >
                <Pencil className="w-4 h-4 ml-2" />
                ویرایش
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <EditExpense
        expense={expense}
        open={showEdit}
        onOpenChange={(isOpen) => {
          setShowEdit(isOpen);
          if (!isOpen) onOpenChange(false);
        }}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">حذف هزینه</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا مطمئن هستید که می‌خواهید این هزینه را حذف کنید؟ این عمل غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse justify-start sm:justify-start gap-2">
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'در حال حذف...' : 'حذف'}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}