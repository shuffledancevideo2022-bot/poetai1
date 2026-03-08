import { useEffect, useState } from "react";
import { Check, Crown, Zap, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PricingFAQ } from "@/components/PricingFAQ";
import { AuthModal } from "@/components/AuthModal";
import { PurchaseModal } from "@/components/PurchaseModal";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_rub: number;
  product_type: string;
  periodicity: string | null;
  lava_offer_id: string | null;
}

// Hardcoded Lava links as fallback (from PurchaseModal)
const lavaLinks: Record<string, string> = {
  // packages by price
  "99": "https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/7923cc60-eef1-44fa-bc63-2238394deb0a",
  "249": "https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/9b30b6b2-8876-4ae6-aefe-3ea6982e4b82",
  "699": "https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/0f761d46-13ac-44b7-8949-53037e02510d",
  // subscriptions
  "199": "https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/82030969-26d5-49e6-9d1f-aef767998b43",
  "449": "https://app.lava.top/products/daeba6d4-2072-42d0-bcae-d591280ac6b9/c73457a3-6cbf-4663-a440-cb1157cf7a74",
};

function getLavaUrl(product: Product): string {
  if (product.lava_offer_id) {
    return `https://app.lava.top/products/${product.lava_offer_id}`;
  }
  return lavaLinks[Math.round(product.price_rub).toString()] || "#";
}

export default function Pricing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from("credit_products")
      .select("id, name, description, credits, price_rub, product_type, periodicity, lava_offer_id")
      .eq("is_active", true)
      .order("price_rub")
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  const oneTime = products.filter((p) => p.product_type === "package");
  const subscriptions = products.filter((p) => p.product_type === "subscription");

  const handleBuy = (product: Product) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const url = getLavaUrl(product);
    if (url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Find the "popular" item (middle price)
  const getPopularId = (items: Product[]) => {
    if (items.length < 2) return null;
    return items[Math.floor(items.length / 2)]?.id;
  };

  const popularSubId = getPopularId(subscriptions);
  const popularPkgId = getPopularId(oneTime);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-sky to-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-5xl pt-24">

        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            💎 Тарифы
          </h1>
          <p className="text-xl text-muted-foreground">
            Выберите подходящий тариф для создания стихов и песен
          </p>
        </div>

        {/* Free tier banner */}
        <div className="max-w-lg mx-auto mb-12 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <div className="flex items-center justify-center gap-2 font-semibold text-primary mb-1">
            <Sparkles className="h-5 w-5" />
            Начните бесплатно!
          </div>
          <p className="text-sm text-muted-foreground">
            Зарегистрируйтесь и получите <strong>5 бесплатных кредитов</strong> для создания стихов и песен
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Тарифы скоро появятся</div>
        ) : (
          <>
            {subscriptions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6 text-accent" />
                  Подписки
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptions.map((p) => {
                    const isPopular = p.id === popularSubId;
                    return (
                      <Card
                        key={p.id}
                        className={`relative transition-all ${
                          isPopular
                            ? "border-primary shadow-glow scale-[1.02]"
                            : "border-primary/20 hover:border-primary/40"
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3">
                              Выгодно
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="text-center">
                          <CardTitle className="flex items-center justify-center gap-2">
                            <Zap className="h-5 w-5 text-accent" />
                            {p.name}
                          </CardTitle>
                          {p.periodicity && (
                            <Badge variant="secondary" className="w-fit mx-auto">{p.periodicity}</Badge>
                          )}
                          <CardDescription>{p.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                          <div className="text-3xl font-bold text-primary">{p.price_rub} ₽</div>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary" />
                            Безлимитные генерации
                          </div>
                          <Button
                            onClick={() => handleBuy(p)}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                          >
                            Оформить подписку
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {oneTime.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Разовые пакеты</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {oneTime.map((p) => {
                    const isPopular = p.id === popularPkgId;
                    return (
                      <Card
                        key={p.id}
                        className={`relative transition-all ${
                          isPopular
                            ? "border-primary/40 shadow-soft"
                            : "border-primary/10 hover:border-primary/30"
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge variant="secondary" className="px-3">Популярный</Badge>
                          </div>
                        )}
                        <CardHeader className="text-center">
                          <CardTitle>{p.name}</CardTitle>
                          <CardDescription>{p.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                          <div className="text-3xl font-bold">{p.price_rub} ₽</div>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary" />
                            {p.credits} кредитов
                          </div>
                          <Button
                            onClick={() => handleBuy(p)}
                            variant="outline"
                            className="w-full border-primary/30 hover:bg-primary/10"
                          >
                            Купить
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <PricingFAQ />

        <div className="text-center mt-12 text-xs text-muted-foreground">
          Оплата через Lava.top · Безопасная оплата картой и другими способами
        </div>
      </div>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
