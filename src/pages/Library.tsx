import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Library as LibraryIcon, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const books = [
  {
    title: "1000+ Промптов для Suno AI",
    description: "Ультимативный справочник для создания хитов за 1 минуту. Перестаньте гадать — начните управлять звуком.",
    cover: "https://mastersuno.ru/wp-content/uploads/2026/01/chatgpt-image-21-yanv.-2026-g.-01_04_06-e1768950024613.png",
    url: "https://sunoprompt.ru/",
  },
  {
    title: "СЕКРЕТЫ РУССКОГО ХИТА",
    description: "Хватит гадать. Начни управлять. Уникальная технология создания промптов в SUNO AI.",
    cover: "https://sunoprompt.ru/books/2/1roman_ru_sunoprompt_ru_russionhitbook01022026.png",
    url: "https://sunoprompt.ru/books/2/",
  },
  {
    title: "ЭПИЧЕСКИЙ SOUND DESIGN",
    description: "Как создавать промпты в SUNO AI для эпического и игрового саунд-дизайна.",
    cover: "https://mastersuno.ru/wp-content/uploads/2026/02/epicbook.png",
    url: "https://suno5.ru/books/3/",
  },
  {
    title: "Jingle Master",
    description: "ИИ‑промпты для джинглов и аудиобрендинга. Создавайте фирменный звук бренда в Suno AI за минуты, а не недели.",
    cover: "https://suno5.ru/books/4/book-cover-Bv6qt_fg.png",
    url: "https://suno5.ru/books/4/",
  },
];

export default function Library() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sky to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Вернуться на главную</span>
        </Link>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((book) => (
            <a
              key={book.title}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <Card className="h-full border-primary/10 shadow-soft hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="flex gap-5 p-5">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-24 h-32 object-cover rounded-lg shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      {book.title}
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
    </div>
  );
}
