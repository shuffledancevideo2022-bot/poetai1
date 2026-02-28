import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  credits: number;
  price_rub: number;
  price_usd: number | null;
  price_eur: number | null;
  product_type: string;
  periodicity: string | null;
  is_active: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('credit_products').select('*').order('created_at');
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('credit_products').update({ is_active: !current }).eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Продукты</h2>
      <Card>
        <CardHeader>
          <CardTitle>Пакеты и подписки</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Кредиты</TableHead>
                <TableHead>Цена (₽)</TableHead>
                <TableHead>Цена ($)</TableHead>
                <TableHead>Цена (€)</TableHead>
                <TableHead>Активен</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Загрузка...</TableCell></TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant={p.product_type === 'subscription' ? 'default' : 'secondary'}>
                      {p.product_type === 'subscription' ? 'Подписка' : 'Пакет'}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.credits}</TableCell>
                  <TableCell>{p.price_rub} ₽</TableCell>
                  <TableCell>{p.price_usd ? `$${p.price_usd}` : '—'}</TableCell>
                  <TableCell>{p.price_eur ? `€${p.price_eur}` : '—'}</TableCell>
                  <TableCell>
                    <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p.id, p.is_active)} />
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
