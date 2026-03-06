import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

interface Product {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_rub: number;
  product_type: string;
  periodicity: string | null;
}

export default function Pricing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("credit_products")
      .select("id, name, description, credits, price_rub, product_type, periodicity")
      .eq("is_active", true)
      .order("price_rub")
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  const oneTime = products.filter((p) => p.product_type === "package");
  const subscriptions = products.filter((p) => p.product_type === "subscription");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-sky to-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-5xl pt-24">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            💎 Тарифы
          </h1>
          <p className="text-xl text-muted-foreground">
            Выберите подходящий тариф для создания стихов и песен
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
                <h2 className="text-2xl font-bold mb-6 text-center">Подписки</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptions.map((p) => (
                    <Card key={p.id} className="border-primary/20 hover:border-primary/40 transition-all">
                      <CardHeader className="text-center">
                        <CardTitle>{p.name}</CardTitle>
                        {p.periodicity && <Badge variant="secondary" className="w-fit mx-auto">{p.periodicity}</Badge>}
                        <CardDescription>{p.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        <div className="text-3xl font-bold text-primary">{p.price_rub} ₽</div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary" />
                          {p.credits} кредитов
                        </div>
                        <Button className="w-full bg-gradient-to-r from-primary to-secondary">Выбрать</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {oneTime.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Разовые пакеты</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {oneTime.map((p) => (
                    <Card key={p.id} className="border-primary/10 hover:border-primary/30 transition-all">
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
                        <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">Купить</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
