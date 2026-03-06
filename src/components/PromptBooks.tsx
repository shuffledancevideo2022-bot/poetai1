import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import book1000 from "@/assets/book-1000-prompts.png";
import bookRussianHit from "@/assets/book-russian-hit.png";
import bookEpicSound from "@/assets/book-epic-sound.png";

const books = [
  {
    title: "1000+ Промптов для Suno AI",
    description: "Ультимативный справочник для создания хитов за 1 минуту. Перестаньте гадать — начните управлять звуком.",
    cover: book1000,
    url: "https://sunoprompt.ru/",
  },
  {
    title: "Секреты Русского Хита",
    description: "Хватит гадать. Начни управлять. Уникальная технология создания промптов в SUNO AI.",
    cover: bookRussianHit,
    url: "https://sunoprompt.ru/books/2/",
  },
  {
    title: "Эпический Sound Design",
    description: "Как создавать промпты в SUNO AI для эпического и игрового саунд-дизайна.",
    cover: bookEpicSound,
    url: "https://suno5.ru/books/3/",
  },
];

export function PromptBooks() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        📚 Готовые промпты
      </h2>
      <p className="text-center text-muted-foreground mb-8">
        Книги с готовыми промптами для создания музыки и песен
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <a
            key={index}
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="h-full hover:shadow-glow transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {book.title}
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
