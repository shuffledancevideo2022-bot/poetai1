import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Sparkles, Crown, Zap, AlertTriangle, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const packages = [
  {
    name: '10 кредитов',
    credits: 10,
    price: 149,
    url: 'https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/7923cc60-eef1-44fa-bc63-2238394deb0a',
  },
  {
    name: '50 кредитов',
    credits: 50,
    price: 499,
    popular: true,
    url: 'https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/9b30b6b2-8876-4ae6-aefe-3ea6982e4b82',
  },
  {
    name: '100 кредитов',
    credits: 100,
    price: 799,
    url: 'https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/0f761d46-13ac-44b7-8949-53037e02510d',
  },
];

const subscriptions = [
  {
    name: '1 Месяц',
    description: 'БЕЗЛИМИТ! Подписка на 1 месяц',
    price: 999,
    period: 'мес',
    url: 'https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/82030969-26d5-49e6-9d1f-aef767998b43',
  },
  {
    name: '1 Год',
    description: 'БЕЗЛИМИТ! Подписка на 1 год',
    price: 15499,
    period: 'год',
    popular: true,
    url: 'https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/c73457a3-6cbf-4663-a440-cb1157cf7a74',
  },
];

export function PurchaseModal({ open, onOpenChange }: PurchaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-accent" />
            Купить кредиты
          </DialogTitle>
          <DialogDescription>
            Выберите пакет кредитов или безлимитную подписку
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="packages">Пакеты</TabsTrigger>
            <TabsTrigger value="subscriptions">
              <Crown className="h-4 w-4 mr-1" />
              Подписки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-3 pt-4">
            {packages.map((product) => (
              <a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'relative block p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5',
                  product.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                {product.popular && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Популярный
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {product.credits} генераций
                    </p>
                  </div>
                  <div className="text-xl font-bold">
                    {product.price} ₽
                  </div>
                </div>
              </a>
            ))}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-3 pt-4">
            {subscriptions.map((product) => (
              <a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'relative block p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5',
                  product.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                {product.popular && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Выгодно
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold flex items-center gap-1">
                      <Zap className="h-4 w-4 text-accent" />
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  <div className="text-xl font-bold">
                    {product.price} ₽<span className="text-sm font-normal text-muted-foreground">/{product.period}</span>
                  </div>
                </div>
              </a>
            ))}
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Оплата через Lava.top · Безопасная оплата картой и другими способами
        </p>
      </DialogContent>
    </Dialog>
  );
}
