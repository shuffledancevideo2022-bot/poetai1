import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id');
  const { refreshCredits } = useCredits();

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-sky to-background p-4 pt-16">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-glow border border-primary/20 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Оплата прошла успешно!</h1>
            <p className="text-muted-foreground">Кредиты добавлены на ваш аккаунт</p>
          </div>
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">ID платежа</p>
            <p className="font-mono text-sm">{paymentId || 'N/A'}</p>
          </div>
          <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Link to="/">
              <Sparkles className="h-4 w-4 mr-2" />
              Создать стих
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
