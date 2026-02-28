import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Coins, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface DayData {
  date: string;
  registrations: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, payments: 0, revenue: 0, credits: 0 });
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profilesRes, paymentsRes] = await Promise.all([
        supabase.from('profiles').select('credits, created_at', { count: 'exact' }),
        supabase.from('payments').select('amount, status, created_at, completed_at', { count: 'exact' }),
      ]);

      const profiles = profilesRes.data || [];
      const payments = paymentsRes.data || [];
      const totalCredits = profiles.reduce((s, p) => s + (p.credits || 0), 0);
      const completedPayments = payments.filter(p => p.status === 'completed');
      const revenue = completedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

      setStats({
        users: profilesRes.count || 0,
        payments: completedPayments.length,
        revenue,
        credits: totalCredits,
      });

      // Build chart data for last 30 days
      const days: Record<string, DayData> = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days[key] = { date: key, registrations: 0, revenue: 0 };
      }

      profiles.forEach(p => {
        const key = p.created_at?.slice(0, 10);
        if (key && days[key]) days[key].registrations++;
      });

      completedPayments.forEach(p => {
        const key = (p.completed_at || p.created_at)?.slice(0, 10);
        if (key && days[key]) days[key].revenue += Number(p.amount || 0);
      });

      setChartData(Object.values(days));
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { title: 'Пользователи', value: stats.users, icon: Users, color: 'text-blue-500' },
    { title: 'Платежей', value: stats.payments, icon: CreditCard, color: 'text-green-500' },
    { title: 'Доход (₽)', value: stats.revenue.toLocaleString(), icon: TrendingUp, color: 'text-yellow-500' },
    { title: 'Кредитов в обороте', value: stats.credits, icon: Coins, color: 'text-purple-500' },
  ];

  const chartConfig = {
    registrations: { label: 'Регистрации', color: 'hsl(var(--primary))' },
    revenue: { label: 'Доход (₽)', color: 'hsl(142 76% 36%)' },
  };

  const formatDate = (val: string) => {
    const d = new Date(val);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Дашборд</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Регистрации за 30 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => new Date(v).toLocaleDateString('ru')} />} />
                <Bar dataKey="registrations" fill="var(--color-registrations)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Доход за 30 дней (₽)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => new Date(v).toLocaleDateString('ru')} />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}