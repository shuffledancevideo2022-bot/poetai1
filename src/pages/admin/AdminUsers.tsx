import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  credits: number;
  created_at: string;
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addCredits = async (userId: string) => {
    const amount = parseInt(creditInputs[userId] || '0');
    if (!amount) return;
    
    const { error } = await supabase.rpc('add_credits', {
      _user_id: userId,
      _amount: amount,
      _transaction_type: 'admin_add',
      _description: `Начислено админом: ${amount} кредитов`,
    });

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Готово', description: `${amount} кредитов начислено` });
      setCreditInputs(prev => ({ ...prev, [userId]: '' }));
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Пользователи</h2>
      <Card>
        <CardHeader>
          <CardTitle>Все пользователи ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Кредиты</TableHead>
                <TableHead>Дата рег.</TableHead>
                <TableHead>Начислить</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Загрузка...</TableCell></TableRow>
              ) : profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.email || '—'}</TableCell>
                  <TableCell>{p.display_name || '—'}</TableCell>
                  <TableCell className="font-bold">{p.credits}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString('ru')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-20"
                        value={creditInputs[p.user_id] || ''}
                        onChange={(e) => setCreditInputs(prev => ({ ...prev, [p.user_id]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => addCredits(p.user_id)}>+</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
