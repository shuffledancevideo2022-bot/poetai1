import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-sky to-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl pt-24">
        <Link to="/blog">
          <Button variant="ghost" size="sm" className="mb-6 gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Назад к блогу
          </Button>
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        ) : error || !post ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">Статья не найдена</h2>
            <p className="text-muted-foreground mb-6">Возможно, она была удалена или ещё не опубликована.</p>
            <Link to="/blog">
              <Button>Перейти к блогу</Button>
            </Link>
          </div>
        ) : (
          <article>
            {post.cover_url && (
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-64 sm:h-80 object-cover rounded-xl mb-8"
              />
            )}

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>

            {post.published_at && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(post.published_at), "d MMMM yyyy", { locale: ru })}
              </div>
            )}

            <div
              className="prose prose-sm sm:prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        )}
      </div>
      <Footer />
    </div>
  );
}
