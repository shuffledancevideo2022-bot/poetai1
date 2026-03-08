import { useState } from 'react';
import { Coins, LogOut, User, Gift, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useReferral } from '@/hooks/useReferral';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CreditDisplayProps {
  onBuyClick: () => void;
  onLoginClick: () => void;
}

export function CreditDisplay({ onBuyClick, onLoginClick }: CreditDisplayProps) {
  const { user, signOut } = useAuth();
  const { credits, loading } = useCredits();
  const { getReferralLink, referralCount } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = async () => {
    const link = getReferralLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <Button
        onClick={onLoginClick}
        variant="outline"
        className="border-primary/30 hover:bg-primary/10"
      >
        <User className="h-4 w-4 mr-2" />
        Войти
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onBuyClick}
        variant="outline"
        className="border-primary/30 hover:bg-primary/10"
      >
        <Coins className="h-4 w-4 mr-2 text-accent" />
        <span className="font-medium">
          {loading ? '...' : credits ?? 0} кредитов
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="text-muted-foreground">
            {user.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onBuyClick}>
            <Coins className="h-4 w-4 mr-2" />
            Купить кредиты
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}