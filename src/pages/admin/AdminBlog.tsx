import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

type View = "list" | "edit";

export default function AdminBlog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "");

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverUrl("");
    setEditingPost(null);
  };

  const openNew = () => {
    resetForm();
    setView("edit");
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setCoverUrl(post.cover_url || "");
    setView("edit");
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Заполните название и slug");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content,
        cover_url: coverUrl.trim() || null,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : editingPost?.published_at || null,
        author_id: user!.id,
      };

      if (editingPost) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingPost.id);
        if (error) throw error;
        toast.success("Статья обновлена");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast.success(publish ? "Статья опубликована" : "Черновик сохранён");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setView("list");
      resetForm();
    } catch (err: any) {
      toast.error("Ошибка: " + (err.message || "Неизвестная ошибка"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error("Ошибка удаления");
      return;
    }
    toast.success("Статья удалена");
    queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  };

  const togglePublish = async (post: BlogPost) => {
    const newState = !post.is_published;
    const { error } = await supabase
      .from("blog_posts")
      .update({
        is_published: newState,
        published_at: newState ? new Date().toISOString() : post.published_at,
      })
      .eq("id", post.id);
    if (error) {
      toast.error("Ошибка");
      return;
    }
    toast.success(newState ? "Опубликовано" : "Снято с публикации");
    queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  };

  if (view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setView("list"); resetForm(); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Назад
          </Button>
          <h1 className="text-2xl font-bold">{editingPost ? "Редактирование" : "Новая статья"}</h1>
        </div>

        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок</label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingPost) setSlug(generateSlug(e.target.value));
                }}
                placeholder="Название статьи"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Краткое описание</label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Краткое описание для превью..."
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Обложка (URL)</label>
            <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Содержание</label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Напишите статью..." />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              Сохранить черновик
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving ? "Сохранение..." : "Опубликовать"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Блог</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Новая статья
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Загрузка...</p>
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Нет статей</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Статья</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    </TableCell>
                    <TableCell>
                      {post.is_published ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Опубликовано</Badge>
                      ) : (
                        <Badge variant="outline">Черновик</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(post.created_at), "dd.MM.yyyy", { locale: ru })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => togglePublish(post)} title={post.is_published ? "Снять" : "Опубликовать"}>
                          {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
