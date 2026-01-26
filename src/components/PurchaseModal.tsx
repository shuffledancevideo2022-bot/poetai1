import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Coins, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditProduct {
  id: string;
  name: string;
  credits: number;
  price_rub: number;
  price_usd: number | null;
  price_eur: number | null;
  description: string | null;
  product_type: string;
  periodicity: string | null;
}

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Currency = 'RUB' | 'USD' | 'EUR';

export function PurchaseModal({ open, onOpenChange }: PurchaseModalProps) {
  const [products, setProducts] = useState<CreditProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('RUB');
  const [email, setEmail] = useState('');
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('credit_products')
      .select('*')
      .eq('is_active', true)
      .order('credits', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
      if (data && data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0].id);
      }
    }
    setLoading(false);
  };

  const getPrice = (product: CreditProduct) => {
    switch (currency) {
      case 'USD':
        return product.price_usd || Math.round(product.price_rub / 100);
      case 'EUR':
        return product.price_eur || Math.round(product.price_rub / 110);
      default:
        return product.price_rub;
    }
  };

  const formatPrice = (price: number) => {
    switch (currency) {
      case 'USD':
        return `$${price}`;
      case 'EUR':
        return `€${price}`;
      default:
        return `${price} ₽`;
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) {
      toast({
        title: 'Выберите пакет',
        variant: 'destructive',
      });
      return;
    }

    if (!email) {
      toast({
        title: 'Введите email',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            productId: selectedProduct,
            email,
            currency,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      // Redirect to payment page
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать платёж',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const packages = products.filter(p => p.product_type === 'package');
  const subscriptions = products.filter(p => p.product_type === 'subscription');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-accent" />
            Купить кредиты
          </DialogTitle>
          <DialogDescription>
            Выберите пакет кредитов для генерации стихов и песен
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет доступных продуктов
          </div>
        ) : (
          <div className="space-y-6">
            {/* Currency selector */}
            <div className="flex justify-center gap-2">
              {(['RUB', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <Button
                  key={cur}
                  variant={currency === cur ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrency(cur)}
                  className={cn(
                    currency === cur && 'bg-gradient-to-r from-primary to-secondary'
                  )}
                >
                  {cur === 'RUB' ? '₽ RUB' : cur === 'USD' ? '$ USD' : '€ EUR'}
                </Button>
              ))}
            </div>

            <Tabs defaultValue="packages" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="packages">Пакеты</TabsTrigger>
                <TabsTrigger value="subscriptions">Подписки</TabsTrigger>
              </TabsList>

              <TabsContent value="packages" className="space-y-3 pt-4">
                {packages.length === 0 ? (
                  <p className="text-center text-muted-foreground">Нет доступных пакетов</p>
                ) : (
                  packages.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                        selectedProduct === product.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {selectedProduct === product.id && (
                        <div className="absolute top-3 right-3">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {product.credits} кредитов
                          </p>
                        </div>
                        <div className="text-xl font-bold">
                          {formatPrice(getPrice(product))}
                        </div>
                      </div>
                      {product.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-3 pt-4">
                {subscriptions.length === 0 ? (
                  <p className="text-center text-muted-foreground">Нет доступных подписок</p>
                ) : (
                  subscriptions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                        selectedProduct === product.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {selectedProduct === product.id && (
                        <div className="absolute top-3 right-3">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {product.credits} кредитов / {product.periodicity === 'monthly' ? 'месяц' : 'год'}
                          </p>
                        </div>
                        <div className="text-xl font-bold">
                          {formatPrice(getPrice(product))}/{product.periodicity === 'monthly' ? 'мес' : 'год'}
                        </div>
                      </div>
                      {product.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {/* Email input for non-authenticated users */}
            {!user && (
              <div className="space-y-2">
                <Label htmlFor="purchase-email">Email для получения кредитов</Label>
                <Input
                  id="purchase-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Создайте аккаунт с этим email для использования кредитов
                </p>
              </div>
            )}

            <Button
              onClick={handlePurchase}
              disabled={purchasing || !selectedProduct}
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {purchasing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Coins className="h-5 w-5 mr-2" />
                  Оплатить
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}