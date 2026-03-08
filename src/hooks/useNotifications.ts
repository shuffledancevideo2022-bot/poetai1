import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  user_id: string | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Get personal notifications
    const { data: personal } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get broadcast notifications
    const { data: broadcasts } = await supabase
      .from("notifications")
      .select("*")
      .is("user_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get read broadcast IDs
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id);

    const readIds = new Set((reads ?? []).map((r: any) => r.notification_id));

    const allNotifications = [
      ...(personal ?? []),
      ...(broadcasts ?? []).map((b: any) => ({
        ...b,
        is_read: readIds.has(b.id),
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, 50);

    setNotifications(allNotifications);
    setUnreadCount(allNotifications.filter((n) => !n.is_read).length);
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification || notification.is_read) return;

    if (notification.user_id) {
      // Personal notification
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
    } else {
      // Broadcast — insert read record
      await supabase
        .from("notification_reads")
        .insert({ notification_id: notificationId, user_id: user.id });
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const unread = notifications.filter((n) => !n.is_read);
    const personal = unread.filter((n) => n.user_id);
    const broadcasts = unread.filter((n) => !n.user_id);

    if (personal.length > 0) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    }

    if (broadcasts.length > 0) {
      const inserts = broadcasts.map((n) => ({
        notification_id: n.id,
        user_id: user.id,
      }));
      await supabase.from("notification_reads").upsert(inserts, {
        onConflict: "notification_id,user_id",
      });
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
