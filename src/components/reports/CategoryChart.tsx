import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatToman } from '@/lib/numbers';

interface CategoryData {
  category: string;
  count: number;
  amount: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
        داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-md p-3 text-right" dir="rtl">
          <p className="font-bold text-foreground mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">{data.count} هزینه</p>
          <p className="text-sm font-medium text-primary mt-1">{formatToman(data.amount)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full mt-4" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barSize={40}
        >
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            hide={true}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar
            dataKey="count"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}