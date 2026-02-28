import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Coins, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, payments: 0, revenue: 0, credits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profilesRes, paymentsRes] = await Promise.all([
        supabase.from('profiles').select('credits', { count: 'exact' }),
        supabase.from('payments').select('amount, status', { count: 'exact' }),
      ]);

      const totalCredits = (profilesRes.data || []).reduce((s, p) => s + (p.credits || 0), 0);
      const completedPayments = (paymentsRes.data || []).filter(p => p.status === 'completed');
      const revenue = completedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

      setStats({
        users: profilesRes.count || 0,
        payments: completedPayments.length,
        revenue,
        credits: totalCredits,
      });
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
    </div>
  );
}
