import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { isDisposableEmail, isValidEmailFormat } from '@/lib/disposable-emails';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useReferral } from '@/hooks/useReferral';
import { Loader2, Gift } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { processReferral } = useReferral();
  const { toast } = useToast();

  // Check for referral code in URL
  const refCode = new URLSearchParams(window.location.search).get('ref');

  // Process pending referral after email confirmation (user becomes available)
  useEffect(() => {
    if (!user) return;
    const pendingRef = localStorage.getItem('pending_referral');
    if (!pendingRef) return;

    // Small delay to ensure profile trigger has fired
    const timer = setTimeout(async () => {
      const success = await processReferral(pendingRef);
      localStorage.removeItem('pending_referral');
      if (success) {
        toast({
          title: '🎉 Реферальный бонус!',
          description: 'Ваш друг получил 10 бесплатных кредитов!',
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSubmit = async (mode: 'signin' | 'signup') => {
    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const trimmedEmail = email.trim().toLowerCase();
        if (!isValidEmailFormat(trimmedEmail)) {
          toast({ title: 'Ошибка', description: 'Введите корректный email адрес', variant: 'destructive' });
          setLoading(false);
          return;
        }
        if (isDisposableEmail(trimmedEmail)) {
          toast({ title: 'Ошибка', description: 'Временные почтовые адреса не допускаются. Используйте постоянный email.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { data, error } = await signUp(trimmedEmail, password);
        if (error) throw error;

        // Referral code is already saved in localStorage by App.tsx

        toast({
          title: 'Проверьте почту!',
          description: 'Мы отправили письмо для подтверждения на ' + trimmedEmail + '. Подтвердите email, чтобы войти.',
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: 'Добро пожаловать!',
          description: 'Вы успешно вошли в систему',
        });
      }
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Что-то пошло не так',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PoetAI
          </DialogTitle>
          <DialogDescription>
            Войдите или создайте аккаунт для сохранения кредитов
          </DialogDescription>
        </DialogHeader>

        {refCode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
            <Gift className="h-4 w-4 text-accent shrink-0" />
            <span>Вас пригласил друг! Зарегистрируйтесь — он получит бонус.</span>
          </div>
        )}

        <Tabs defaultValue={refCode ? "signup" : "signin"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Вход</TabsTrigger>
            <TabsTrigger value="signup">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Пароль</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleSubmit('signin')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Войти'}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Пароль</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleSubmit('signup')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать аккаунт'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              При регистрации вы получаете 5 бесплатных кредитов
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
