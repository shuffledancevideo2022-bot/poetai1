import { Coins, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";

interface UpsellBannerProps {
  onBuyClick: () => void;
  onLoginClick: () => void;
}

export function UpsellBanner({ onBuyClick, onLoginClick }: UpsellBannerProps) {
  const { user } = useAuth();
  const { credits } = useCredits();

  if (user && credits !== null && credits > 3) return null;

  return (
    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-center space-y-3">
      {!user ? (
        <>
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Понравилось? Получите 5 бесплатных кредитов!
          </div>
          <p className="text-sm text-muted-foreground">
            Зарегистрируйтесь и создавайте стихи и песни без ограничений
          </p>
          <Button onClick={onLoginClick} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Создать аккаунт бесплатно
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Coins className="h-5 w-5 text-accent" />
            {credits === 0 ? "Кредиты закончились!" : `Осталось ${credits} кредитов`}
          </div>
          <p className="text-sm text-muted-foreground">
            Пополните баланс, чтобы продолжить создавать шедевры
          </p>
          <Button onClick={onBuyClick} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Купить кредиты
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
