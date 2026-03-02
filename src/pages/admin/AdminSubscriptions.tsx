import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  source: string;
  is_active: boolean;
  created_at: string;
}

interface RegisteredUser {
  id: string;
  email: string | null;
  created_at: string;
  credits: number;
}

export default function AdminSubscriptions() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [subsRes, usersRes] = await Promise.all([
        supabase.from('email_subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, email, created_at, credits').order('created_at', { ascending: false }),
      ]);
      setSubscribers((subsRes.data as Subscriber[]) || []);
      setUsers((usersRes.data as RegisteredUser[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Рассылки</h2>

      <Tabs defaultValue="subscribers">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Подписчики ({subscribers.length})
          </TabsTrigger>
          <TabsTrigger value="registered" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Зарегистрированные ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader><CardTitle>Подписчики рассылки</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата подписки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Загрузка...</TableCell></TableRow>
                  ) : subscribers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Нет подписчиков</TableCell></TableRow>
                  ) : subscribers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell>{s.source}</TableCell>
                      <TableCell>
                        <Badge variant={s.is_active ? 'default' : 'secondary'}>
                          {s.is_active ? 'Активен' : 'Отписан'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(s.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registered">
          <Card>
            <CardHeader><CardTitle>Зарегистрированные пользователи</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Кредиты</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Загрузка...</TableCell></TableRow>
                  ) : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email || '—'}</TableCell>
                      <TableCell>{u.credits}</TableCell>
                      <TableCell>{formatDate(u.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
