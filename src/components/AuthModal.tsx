import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

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
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({
          title: 'Регистрация успешна!',
          description: 'Добро пожаловать в PoetAI! Вы получили 5 бесплатных кредитов.',
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

        <Tabs defaultValue="signin" className="w-full">
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