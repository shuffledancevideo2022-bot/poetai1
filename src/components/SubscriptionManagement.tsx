import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Calendar, Zap, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  credits_per_period: number;
  cancelled_at: string | null;
  product_id: string;
  lava_subscription_id: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_rub: number;
  periodicity: string | null;
}

export function SubscriptionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch user subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch available products
      const { data: productsData, error: productsError } = await supabase
        .from('credit_products')
        .select('*')
        .eq('is_active', true)
        .eq('product_type', 'subscription')
        .order('price_rub', { ascending: true });

      if (productsError) throw productsError;

      setSubscriptions(subsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о подписках",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, cancelled_at: string | null) => {
    if (cancelled_at) {
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Отменена</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активна</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Просрочена</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="text-red-600 border-red-200">Отменена</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPeriodicity = (periodicity: string | null) => {
    switch (periodicity) {
      case 'monthly':
        return 'месяц';
      case 'yearly':
        return 'год';
      default:
        return 'период';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Управление подпиской
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(sub => 
    sub.status === 'active' && !sub.cancelled_at
  );

  return (
    <div className="space-y-6">
      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Активные подписки
          </CardTitle>
          <CardDescription>
            Ваши текущие подписки и их статус
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {activeSubscriptions.map((subscription) => (
                <div key={subscription.id} className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-medium">Безлимитная подписка</span>
                    </div>
                    {getStatusBadge(subscription.status, subscription.cancelled_at)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Кредитов за период:</span>
                      <div className="font-medium">{subscription.credits_per_period}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Следующее списание:</span>
                      <div className="font-medium">{formatDate(subscription.current_period_end)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Нет активных подписок</p>
              <p className="text-sm">Выберите подходящий тарифный план ниже</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              История подписок
            </CardTitle>
            <CardDescription>
              Все ваши предыдущие и текущие подписки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-3 border border-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Подписка #{subscription.id.slice(0, 8)}</span>
                      {getStatusBadge(subscription.status, subscription.cancelled_at)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(subscription.current_period_start)} — {formatDate(subscription.current_period_end)}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{subscription.credits_per_period} кредитов</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Доступные подписки
          </CardTitle>
          <CardDescription>
            Выберите подходящий тарифный план
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border border-primary/20 rounded-lg p-4 hover:bg-primary/5 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Кредиты:</span>
                        <span className="font-medium">{product.credits} / {formatPeriodicity(product.periodicity)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Цена:</span>
                        <span className="font-bold text-primary">{product.price_rub} ₽</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Переходим к оплате",
                          description: "Перенаправляем на страницу тарифов...",
                        });
                        window.location.href = '/pricing';
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Выбрать план
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Подписки временно недоступны</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}