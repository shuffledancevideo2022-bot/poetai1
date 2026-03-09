import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, User, Mail, Shield } from "lucide-react";

const profileSchema = z.object({
  display_name: z.string().min(1, "Имя обязательно").max(50, "Имя не должно превышать 50 символов"),
  email: z.string().email("Введите корректный email"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  credits: number;
  referral_code: string;
  created_at: string;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      form.setValue('display_name', data.display_name || '');
      form.setValue('email', data.email || user.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные профиля",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          email: data.email,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Профиль обновлён",
      });

      // Refresh profile data
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Настройки профиля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Настройки профиля
          </CardTitle>
          <CardDescription>
            Обновите информацию о своем профиле
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отображаемое имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ваше имя" {...field} />
                    </FormControl>
                    <FormDescription>
                      Это имя будет отображаться в системе
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Контактный email для уведомлений
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Информация об аккаунте
          </CardTitle>
          <CardDescription>
            Основная информация и статистика
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID пользователя</Label>
              <p className="text-sm font-mono bg-muted/50 p-2 rounded mt-1 break-all">
                {user?.id}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Дата регистрации</Label>
              <p className="text-sm bg-muted/50 p-2 rounded mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : 'Не определена'}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Реферальный код</Label>
              <p className="text-sm font-mono bg-muted/50 p-2 rounded mt-1">
                {profile?.referral_code || 'Не определён'}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Баланс кредитов</Label>
              <p className="text-sm bg-muted/50 p-2 rounded mt-1 font-medium text-primary">
                {profile?.credits || 0} кредитов
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}