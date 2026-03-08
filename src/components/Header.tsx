import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Library, Newspaper, CreditCard, Menu, X } from "lucide-react";
import { CreditDisplay } from "@/components/CreditDisplay";
import { AuthModal } from "@/components/AuthModal";
import { PurchaseModal } from "@/components/PurchaseModal";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/guide", icon: BookOpen, label: "Мастерская поэта" },
  { to: "/library", icon: Library, label: "Библиотека" },
  { to: "/blog", icon: Newspaper, label: "Блог" },
  { to: "/pricing", icon: CreditCard, label: "Тарифы" },
];

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-primary/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PoetAI
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <CreditDisplay
              onBuyClick={() => setPurchaseModalOpen(true)}
              onLoginClick={() => setAuthModalOpen(true)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/10 bg-background/95 backdrop-blur-sm">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <PurchaseModal open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen} />
    </>
  );
}
