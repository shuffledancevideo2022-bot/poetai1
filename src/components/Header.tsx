import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Library, Newspaper, CreditCard } from "lucide-react";
import { CreditDisplay } from "@/components/CreditDisplay";
import { AuthModal } from "@/components/AuthModal";
import { PurchaseModal } from "@/components/PurchaseModal";

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-primary/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PoetAI
            </Link>
            <Link to="/guide" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Мастерская поэта
            </Link>
            <Link to="/library" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Library className="h-4 w-4" />
              Библиотека
            </Link>
            <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Newspaper className="h-4 w-4" />
              Блог
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Тарифы
            </Link>
          </div>
          <CreditDisplay
            onBuyClick={() => setPurchaseModalOpen(true)}
            onLoginClick={() => setAuthModalOpen(true)}
          />
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <PurchaseModal open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen} />
    </>
  );
}
