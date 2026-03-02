import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isDisposableEmail, isValidEmailFormat } from "@/lib/disposable-emails";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!isValidEmailFormat(trimmed)) {
      toast({ title: "Ошибка", description: "Введите корректный email адрес", variant: "destructive" });
      return;
    }
    if (isDisposableEmail(trimmed)) {
      toast({ title: "Ошибка", description: "Временные почтовые адреса не допускаются", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("email_subscriptions").insert({ email: trimmed, source: "footer" });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Вы уже подписаны!", description: "Этот email уже есть в нашей рассылке" });
        setSubscribed(true);
      } else {
        toast({ title: "Ошибка", description: "Не удалось подписаться. Попробуйте позже.", variant: "destructive" });
      }
      return;
    }

    setSubscribed(true);
    toast({ title: "Успешно!", description: "Вы подписались на рассылку" });
  };

  return (
    <footer className="border-t border-primary/10 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Subscription form */}
        <div className="max-w-md mx-auto mb-10">
          <div className="text-center mb-4">
            <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Подпишитесь на обновления</h3>
            <p className="text-sm text-muted-foreground">
              Новые стихи, функции и вдохновение — прямо на вашу почту
            </p>
          </div>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-primary py-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Вы подписаны!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Подписаться"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">
            PoetAI — Искусство слова, рождённое нейросетью
          </p>
          <p className="text-sm text-muted-foreground">
            Создавайте прекрасные стихи, песни и поздравления с помощью искусственного интеллекта
          </p>
          <p className="text-xs text-muted-foreground/70">
            Автор идеи Роман Синицын
          </p>
        </div>
      </div>
    </footer>
  );
}
