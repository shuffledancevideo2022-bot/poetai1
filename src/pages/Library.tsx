import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

interface Book {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  external_url: string | null;
}

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("library_books")
      .select("id, title, description, cover_url, external_url")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setBooks((data as Book[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-sky to-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-6xl pt-24">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📖 Библиотека
          </h1>
          <p className="text-xl text-muted-foreground">
            Новая книга каждый месяц. Подпишитесь, чтобы не пропустить выход.
          </p>
          <Button asChild variant="outline" className="mt-6 border-primary/30 hover:bg-primary/10">
            <a href="https://t.me/master_suno" target="_blank" rel="noopener noreferrer">
              Следить за новостями →
            </a>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <a
                key={book.id}
                href={book.external_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full border-primary/10 shadow-soft hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <CardContent className="flex gap-5 p-5">
                    {book.cover_url && (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        {book.title}
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </h3>
                      {book.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
