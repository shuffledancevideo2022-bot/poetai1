import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-sky to-background p-4 pt-16">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-glow border border-destructive/20 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Оплата не прошла</h1>
            <p className="text-muted-foreground">К сожалению, платёж был отклонён или отменён</p>
          </div>
          {paymentId && (
            <div className="bg-destructive/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">ID платежа</p>
              <p className="font-mono text-sm">{paymentId}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться на главную
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Link to="/">
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentFailed;
