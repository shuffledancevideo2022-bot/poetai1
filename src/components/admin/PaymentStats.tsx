import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PaymentStat {
  date: string;
  amount: number;
  count: number;
}

interface StatusCount {
  status: string;
  count: number;
  amount: number;
}

const statusColors = {
  completed: '#22c55e',
  pending: '#eab308',
  failed: '#ef4444',
  expired: '#6b7280'
};

export function PaymentStats() {
  const [dailyStats, setDailyStats] = useState<PaymentStat[]>([]);
  const [statusStats, setStatusStats] = useState<StatusCount[]>([]);
  const [totals, setTotals] = useState({
    total_amount: 0,
    total_count: 0,
    avg_amount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch daily payment stats for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: payments } = await supabase
          .from('payments')
          .select('amount, status, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (payments) {
          // Group by date
          const dailyGroups: Record<string, { amount: number; count: number }> = {};
          const statusGroups: Record<string, { count: number; amount: number }> = {};
          
          let totalAmount = 0;
          let totalCount = payments.length;

          payments.forEach(payment => {
            const date = new Date(payment.created_at).toISOString().split('T')[0];
            
            if (!dailyGroups[date]) {
              dailyGroups[date] = { amount: 0, count: 0 };
            }
            
            dailyGroups[date].amount += Number(payment.amount);
            dailyGroups[date].count += 1;
            
            if (!statusGroups[payment.status]) {
              statusGroups[payment.status] = { count: 0, amount: 0 };
            }
            
            statusGroups[payment.status].count += 1;
            statusGroups[payment.status].amount += Number(payment.amount);
            
            if (payment.status === 'completed') {
              totalAmount += Number(payment.amount);
            }
          });

          // Convert to arrays
          const dailyData = Object.entries(dailyGroups).map(([date, stats]) => ({
            date,
            amount: stats.amount,
            count: stats.count
          })).sort((a, b) => a.date.localeCompare(b.date));

          const statusData = Object.entries(statusGroups).map(([status, stats]) => ({
            status,
            count: stats.count,
            amount: stats.amount
          }));

          setDailyStats(dailyData);
          setStatusStats(statusData);
          setTotals({
            total_amount: totalAmount,
            total_count: totalCount,
            avg_amount: totalCount > 0 ? totalAmount / totalCount : 0
          });
        }
      } catch (error) {
        console.error('Error fetching payment stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-muted-foreground">Загрузка статистики...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.total_amount.toLocaleString('ru')} ₽
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего платежей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.total_count}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.avg_amount.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Выручка по дням (последние 30 дней)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('ru')}
                />
                <YAxis tickFormatter={(value) => `${value} ₽`} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('ru')}
                  formatter={(value: number) => [`${value.toLocaleString('ru')} ₽`, 'Выручка']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение по статусам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {statusStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={statusColors[entry.status as keyof typeof statusColors] || '#6b7280'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-4">
              <h4 className="font-medium mb-4">Детали по статусам</h4>
              <div className="space-y-2">
                {statusStats.map((stat) => (
                  <div key={stat.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusColors[stat.status as keyof typeof statusColors] || '#6b7280' }}
                      />
                      <span className="capitalize">{stat.status}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>{stat.count} платежей</div>
                      <div className="text-muted-foreground">
                        {stat.amount.toLocaleString('ru')} ₽
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}