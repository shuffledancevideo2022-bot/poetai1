import { useState } from 'react';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useReferral } from '@/hooks/useReferral';
import { useAuth } from '@/hooks/useAuth';

interface ReferralWidgetProps {
  onLoginClick?: () => void;
}

export function ReferralWidget({ onLoginClick }: ReferralWidgetProps) {
  const { user } = useAuth();
  const { referralCode, referralCount, getReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = getReferralLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-6 text-center space-y-3">
          <Gift className="h-10 w-10 mx-auto text-accent" />
          <h3 className="text-lg font-bold">Пригласи друга — получи 10 кредитов!</h3>
          <p className="text-sm text-muted-foreground">
            Зарегистрируйтесь, чтобы получить реферальную ссылку и приглашать друзей
          </p>
          <Button onClick={onLoginClick} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Создать аккаунт
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-accent" />
          Пригласи друга — получи 10 кредитов!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Поделитесь ссылкой с друзьями. Когда они зарегистрируются, вы получите 10 бесплатных кредитов!
        </p>
        
        <div className="flex gap-2">
          <Input
            readOnly
            value={getReferralLink()}
            className="text-xs bg-background"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="shrink-0 border-accent/30"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Приглашено друзей: <strong className="text-foreground">{referralCount}</strong></span>
          <span className="text-accent font-medium ml-auto">+{referralCount * 10} кредитов</span>
        </div>
      </CardContent>
    </Card>
  );
}
