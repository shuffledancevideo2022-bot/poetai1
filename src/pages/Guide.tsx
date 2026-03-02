import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Sparkles, Music, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

export default function Guide() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-sky to-background">
      <div className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Вернуться на главную</span>
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Мастерская поэта
          </h1>
          <p className="text-xl text-muted-foreground">
            Изучайте искусство стихосложения и вдохновляйтесь
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-primary" />
                Основы стихосложения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ритм</h3>
                <p className="text-muted-foreground">
                  Ритм — это чередование ударных и безударных слогов, создающее музыкальность стиха.
                  Правильный ритм делает стихотворение легким для чтения и запоминания.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Рифма</h3>
                <p className="text-muted-foreground">
                  Рифма — это созвучие окончаний стихотворных строк. Существуют разные типы рифм:
                  точные (любовь — вновь), неточные (день — тень), мужские (конец на ударный слог)
                  и женские (конец на безударный слог).
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Размер</h3>
                <p className="text-muted-foreground">
                  Стихотворный размер определяется чередованием ударных и безударных слогов:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li><strong>Ямб:</strong> безударный-ударный (та-ТА)</li>
                  <li><strong>Хорей:</strong> ударный-безударный (ТА-та)</li>
                  <li><strong>Дактиль:</strong> ударный-безударный-безударный (ТА-та-та)</li>
                  <li><strong>Амфибрахий:</strong> безударный-ударный-безударный (та-ТА-та)</li>
                  <li><strong>Анапест:</strong> безударный-безударный-ударный (та-та-ТА)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-secondary" />
                Схемы рифмовки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Смежная (AABB)</h3>
                  <p className="text-sm text-muted-foreground">Рифмуются соседние строки</p>
                  <div className="text-xs mt-2 p-3 bg-muted/50 rounded whitespace-pre-wrap break-words">
{`День сменяет ночь (A)
И уходит прочь (A)
Звёзды в небе светят (B)
Люди их приветят (B)`}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Перекрёстная (ABAB)</h3>
                  <p className="text-sm text-muted-foreground">Рифмуются через строку</p>
                  <div className="text-xs mt-2 p-3 bg-muted/50 rounded whitespace-pre-wrap break-words">
{`Люблю грозу в начале мая (A)
Когда весенний первый гром (B)
Как бы резвяся и играя (A)
Грохочет в небе голубом (B)`}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Опоясывающая (ABBA)</h3>
                  <p className="text-sm text-muted-foreground">Внешние строки рифмуются с внешними</p>
                  <div className="text-xs mt-2 p-3 bg-muted/50 rounded whitespace-pre-wrap break-words">
{`Мороз и солнце день чудесный (A)
Ещё ты дремлешь друг прелестный (A)
Пора красавица проснись (B)
Открой сомкнуты негой взоры (B)`}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Холостая (ABCB)</h3>
                  <p className="text-sm text-muted-foreground">Рифмуются только 2 и 4 строки</p>
                  <div className="text-xs mt-2 p-3 bg-muted/50 rounded whitespace-pre-wrap break-words">
{`Белеет парус одинокий (A)
В тумане моря голубом (B)
Что ищет он в стране далёкой (C)
Что кинул он в краю родном (B)`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Music className="h-6 w-6 text-accent" />
                Советы по написанию песен
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Структура песни</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Куплет:</strong> Рассказывает историю, развивает сюжет</li>
                  <li>• <strong>Припев:</strong> Главная мысль песни, запоминающаяся часть</li>
                  <li>• <strong>Бридж:</strong> Переходная часть, добавляющая разнообразие</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Ритм для музыки</h3>
                <p className="text-muted-foreground">
                  Песенный текст должен легко ложиться на мелодию. Считайте слоги и следите
                  за акцентами. Припев часто делают короче куплета для лучшего запоминания.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Эмоциональность</h3>
                <p className="text-muted-foreground">
                  Песни должны вызывать чувства. Используйте яркие образы, личные истории
                  и искренние эмоции, чтобы слушатели могли узнать себя в ваших словах.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="h-6 w-6 text-rose" />
                Популярные рифмы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Любовь</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">вновь, кровь, бровь, морковь, любовь, кровь, вновь, готовь</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Мечта</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">красота, высота, пустота, темнота, мечта, простота</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Душа</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">хороша, малыша, не спеша, чуть дыша, душа, крыша</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Сердце</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">дверце, оконце, солнце, деревце, сердце</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Небо</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">где бы, хлеба, слепо, небо, требо</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Свет</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">нет, лет, поэт, букет, привет, ответ, рассвет</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
