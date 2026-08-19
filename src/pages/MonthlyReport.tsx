import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMonthlyExpenses, getActiveCategories } from '@/lib/firestore';
import {
  getCurrentJalaliMonth,
  getJalaliMonthName,
  getPreviousJalaliMonth,
  getNextJalaliMonth,
  getJalaliMonthBoundaries,
  formatJalaliDate,
  formatJalaliTime
} from '@/lib/dates';
import { formatToman } from '@/lib/numbers';
import { type Expense, type Category } from '@/types/index';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Search, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CategoryChart from '@/components/reports/CategoryChart';

export default function MonthlyReport() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(getCurrentJalaliMonth());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getActiveCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const { start, end } = getJalaliMonthBoundaries(currentDate);
        const data = await getMonthlyExpenses(currentUser.uid, start, end);
        setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [currentDate, currentUser]);

  const handlePrevMonth = () => setCurrentDate(getPreviousJalaliMonth(currentDate));
  const handleNextMonth = () => setCurrentDate(getNextJalaliMonth(currentDate));

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesCategory = selectedCategory === 'all' || expense.categoryId === selectedCategory;
      const matchesSearch = searchTerm === '' ||
        expense.title.includes(searchTerm) ||
        (expense.description && expense.description.includes(searchTerm));

      return matchesCategory && matchesSearch;
    });
  }, [expenses, selectedCategory, searchTerm]);

  // Summaries
  const totalAmount = useMemo(() => filteredExpenses.reduce((sum, exp) => sum + exp.amountToman, 0), [filteredExpenses]);
  const totalCount = filteredExpenses.length;

  const categoryData = useMemo(() => {
    const map = new Map<string, { count: number, amount: number }>();
    filteredExpenses.forEach(exp => {
      const catName = exp.categoryNameSnapshot || 'سایر';
      const current = map.get(catName) || { count: 0, amount: 0 };
      map.set(catName, { count: current.count + 1, amount: current.amount + exp.amountToman });
    });

    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      ...stats
    })).sort((a, b) => b.count - a.count);
  }, [filteredExpenses]);

  const topCategoryName = categoryData.length > 0 ? categoryData[0].category : '-';

  return (
    <div className="max-w-4xl mx-auto p-4 pt-6 space-y-6">

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-card border rounded-lg p-2 shadow-sm">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg select-none">
          {getJalaliMonthName(currentDate)}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">مجموع هزینه</p>
            <p className="font-bold text-lg text-primary">{formatToman(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">تعداد هزینه‌ها</p>
            <p className="font-bold text-lg">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">بیشترین دسته</p>
            <p className="font-bold text-lg truncate" title={topCategoryName}>{topCategoryName}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو در هزینه‌ها"
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px] flex gap-2">
          <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
            <SelectTrigger dir="rtl">
              <SelectValue placeholder="همه دسته‌ها" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id!}>{cat.nameFa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchTerm || selectedCategory !== 'all') && (
            <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-4">
            <p>هنوز هزینه‌ای در این ماه ثبت نشده است.</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>ثبت اولین هزینه</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">نمودار هزینه‌ها بر اساس دسته‌بندی</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart data={categoryData} />
            </CardContent>
          </Card>

          {/* Table */}
          <div className="border rounded-md overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] text-right">تاریخ</TableHead>
                    <TableHead className="min-w-[150px] text-right">عنوان</TableHead>
                    <TableHead className="text-right">دسته‌بندی</TableHead>
                    <TableHead className="text-right">مبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{formatJalaliDate(expense.createdAt)}</span>
                          <span className="text-xs opacity-70">{formatJalaliTime(expense.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate">{expense.title}</div>
                        {expense.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {expense.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary">
                          {expense.categoryNameSnapshot}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-primary whitespace-nowrap">
                        {formatToman(expense.amountToman)}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        هیچ هزینه‌ای با این فیلترها یافت نشد.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}