import { useState } from "react";
import { Gift, Users, Copy, Check, Coins, ArrowRight, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useReferral } from "@/hooks/useReferral";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const steps = [
  { icon: Share2, title: "Поделитесь ссылкой", description: "Скопируйте свою уникальную реферальную ссылку и отправьте другу" },
  { icon: Users, title: "Друг регистрируется", description: "Ваш друг переходит по ссылке и создаёт аккаунт в PoetAI" },
  { icon: Coins, title: "Вы получаете 10 кредитов", description: "Как только друг зарегистрируется, на ваш баланс зачислится бонус" },
];

export default function Referral() {
  const { user } = useAuth();
  const { referralCode, referralCount, getReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleCopy = async () => {
    const link = getReferralLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch referral history
  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get profile id first
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();
      if (!profile) return [];

      const { data } = await supabase
        .from("referrals")
        .select("id, credits_awarded, created_at")
        .eq("referrer_id", profile.id)
        .order("created_at", { ascending: false });

      return data ?? [];
    },
  });

  const totalEarned = referrals.reduce((sum, r) => sum + r.credits_awarded, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-accent/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-sm">
            <Gift className="h-4 w-4" />
            Реферальная программа
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Пригласи друга —{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              получи 10 кредитов
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Делитесь PoetAI с друзьями и получайте бесплатные кредиты за каждого приглашённого. 
            Нет ограничений — приглашайте сколько угодно!
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <Card key={i} className="text-center border-primary/10">
                <CardContent className="pt-8 pb-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Шаг {i + 1}</div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Referral link / CTA */}
      <section className="py-16 bg-gradient-to-b from-background to-sky">
        <div className="container mx-auto px-4 max-w-2xl">
          {user ? (
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Ваша реферальная ссылка
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input readOnly value={getReferralLink()} className="text-sm bg-background" />
                  <Button onClick={handleCopy} variant="outline" className="shrink-0 border-accent/30 gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Скопировано" : "Копировать"}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 rounded-xl bg-background border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{referralCount}</div>
                    <div className="text-xs text-muted-foreground">Приглашено</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background border border-primary/10">
                    <div className="text-2xl font-bold text-accent">{totalEarned}</div>
                    <div className="text-xs text-muted-foreground">Заработано кредитов</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background border border-primary/10">
                    <div className="text-2xl font-bold text-secondary">∞</div>
                    <div className="text-xs text-muted-foreground">Без ограничений</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 text-center">
              <CardContent className="py-10 space-y-4">
                <Gift className="h-12 w-12 mx-auto text-accent" />
                <h3 className="text-xl font-bold">Создайте аккаунт, чтобы начать приглашать</h3>
                <p className="text-muted-foreground">
                  Зарегистрируйтесь и получите свою уникальную реферальную ссылку
                </p>
                <Button onClick={() => setAuthOpen(true)} size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Создать аккаунт бесплатно
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Referral history table */}
      {user && referrals.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">История приглашений</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Бонус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        {format(new Date(r.created_at), "d MMMM yyyy, HH:mm", { locale: ru })}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-accent">
                        +{r.credits_awarded} кредитов
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>
      )}

      <div className="flex-1" />
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
