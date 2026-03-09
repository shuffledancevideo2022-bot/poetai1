import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookMonitor } from '@/components/admin/WebhookMonitor';
import { PaymentStats } from '@/components/admin/PaymentStats';
import { TestPaymentForm } from '@/components/admin/TestPaymentForm';

interface Payment {
  id: string;
  email: string;
  amount: number;
  currency: string;
  credits_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
  expired: 'outline',
};

function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        setPayments(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние 100 платежей</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Кредиты</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Метод</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Загрузка...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Нет платежей</TableCell></TableRow>
            ) : payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.email}</TableCell>
                <TableCell>{p.amount} {p.currency}</TableCell>
                <TableCell>{p.credits_amount}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[p.status] || 'outline'}>{p.status}</Badge>
                </TableCell>
                <TableCell>{p.payment_method || '—'}</TableCell>
                <TableCell>{new Date(p.created_at).toLocaleString('ru')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminPayments() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Управление платежами</h2>
      
      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments">
          <PaymentsList />
        </TabsContent>
        
        <TabsContent value="webhook">
          <WebhookMonitor />
        </TabsContent>
        
        <TabsContent value="stats">
          <PaymentStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
