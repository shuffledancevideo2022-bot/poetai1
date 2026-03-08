import { useState } from "react";
import { Send, Users, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type TargetType = "all" | "specific";

export default function AdminNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [targetEmail, setTargetEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch sent notifications
  const { data: sentNotifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Заполните заголовок и текст уведомления");
      return;
    }

    if (targetType === "specific" && !targetEmail.trim()) {
      toast.error("Укажите email пользователя");
      return;
    }

    setSending(true);
    try {
      if (targetType === "all") {
        // Broadcast notification (user_id = null)
        const { error } = await supabase.from("notifications").insert({
          title: title.trim(),
          body: body.trim(),
          user_id: null,
          created_by: user!.id,
        });
        if (error) throw error;
        toast.success("Уведомление отправлено всем пользователям");
      } else {
        // Find user by email
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", targetEmail.trim())
          .single();

        if (profileError || !profile) {
          toast.error("Пользователь с таким email не найден");
          setSending(false);
          return;
        }

        const { error } = await supabase.from("notifications").insert({
          title: title.trim(),
          body: body.trim(),
          user_id: profile.user_id,
          created_by: user!.id,
        });
        if (error) throw error;
        toast.success(`Уведомление отправлено пользователю ${targetEmail}`);
      }

      setTitle("");
      setBody("");
      setTargetEmail("");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch (err: any) {
      toast.error("Ошибка отправки: " + (err.message || "Неизвестная ошибка"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Рассылка уведомлений</h1>

      {/* Compose form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5" />
            Новое уведомление
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Получатели</label>
            <Select
              value={targetType}
              onValueChange={(v) => setTargetType(v as TargetType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Все пользователи
                  </span>
                </SelectItem>
                <SelectItem value="specific">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Конкретный пользователь
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === "specific" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Email пользователя</label>
              <Input
                placeholder="user@example.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              placeholder="Заголовок уведомления"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Текст сообщения</label>
            <Textarea
              placeholder="Текст уведомления..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {body.length}/2000
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Отправка..." : "Отправить уведомление"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">История отправок</CardTitle>
        </CardHeader>
        <CardContent>
          {sentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Ещё нет отправленных уведомлений
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Тип</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentNotifications.map((n: any) => (
                  <TableRow key={n.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(n.created_at), "dd.MM.yyyy HH:mm", { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {n.user_id ? (
                        <Badge variant="outline" className="gap-1">
                          <User className="h-3 w-3" />
                          Личное
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                          <Globe className="h-3 w-3" />
                          Все
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
