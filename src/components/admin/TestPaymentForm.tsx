import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TestPaymentForm() {
  const [loading, setLoading] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    amount: '149',
    credits_amount: '10',
    currency: 'RUB',
    status: 'pending',
    payment_method: 'test'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_test_payment', {
        _email: formData.email,
        _amount: Number(formData.amount),
        _credits_amount: Number(formData.credits_amount),
        _currency: formData.currency,
        _status: formData.status,
        _payment_method: formData.payment_method
      });

      if (error) {
        throw error;
      }

      setLastPaymentId(data);
      toast.success(`Тестовый платеж создан! ID: ${data}`);
      
      // Reset form for next test
      setFormData(prev => ({
        ...prev,
        email: '',
      }));
      
    } catch (error) {
      console.error('Error creating test payment:', error);
      toast.error('Ошибка создания тестового платежа: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const presetPayments = [
    { name: '10 кредитов', amount: 149, credits: 10 },
    { name: '50 кредитов', amount: 499, credits: 50 },
    { name: '100 кредитов', amount: 799, credits: 100 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Создание тестового платежа</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Тестовые платежи помечаются специальными метаданными и используют префикс "test_" в invoice ID.
              {formData.status === 'completed' && ' При статусе "completed" кредиты будут автоматически начислены пользователю (если найден).'}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presetPayments.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  className="h-auto p-4 flex flex-col"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      amount: preset.amount.toString(),
                      credits_amount: preset.credits.toString()
                    }));
                  }}
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-sm text-muted-foreground">{preset.amount} ₽</div>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email покупателя *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Валюта</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB (₽)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Сумма</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits_amount">Количество кредитов</Label>
                <Input
                  id="credits_amount"
                  type="number"
                  min="1"
                  value={formData.credits_amount}
                  onChange={(e) => handleInputChange('credits_amount', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Статус платежа</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending (В ожидании)</SelectItem>
                    <SelectItem value="completed">Completed (Завершен)</SelectItem>
                    <SelectItem value="failed">Failed (Неудачный)</SelectItem>
                    <SelectItem value="expired">Expired (Истек)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Метод оплаты</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test (Тестовый)</SelectItem>
                    <SelectItem value="card">Card (Карта)</SelectItem>
                    <SelectItem value="qiwi">Qiwi</SelectItem>
                    <SelectItem value="yoomoney">YooMoney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Создать тестовый платеж
                </>
              )}
            </Button>
          </form>

          {lastPaymentId && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Платеж создан успешно!</strong></div>
                  <div className="font-mono text-sm">ID: {lastPaymentId}</div>
                  <div className="text-sm text-muted-foreground">
                    Обновите вкладки "Платежи", "Webhook" и "Статистика" для просмотра данных.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}