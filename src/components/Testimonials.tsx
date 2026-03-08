import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Анна М.",
    role: "Поэт-любитель",
    text: "Невероятно! За минуту создала стих на годовщину свадьбы. Муж был в восторге, думал я писала его неделю.",
    stars: 5,
  },
  {
    name: "Дмитрий К.",
    role: "Музыкант",
    text: "Использую для текстов песен в Suno AI. Качество промптов на уровне — мои треки набирают тысячи прослушиваний.",
    stars: 5,
  },
  {
    name: "Елена В.",
    role: "SMM-специалист",
    text: "PoetAI — находка для контента. Создаю уникальные стихи для постов клиентов, экономлю часы работы каждый день.",
    stars: 5,
  },
  {
    name: "Игорь С.",
    role: "Блогер",
    text: "Поздравления, тосты, подписи к фото — всё делаю здесь. Подписка окупилась в первый же день!",
    stars: 5,
  },
  {
    name: "Мария Т.",
    role: "Учитель литературы",
    text: "Показываю ученикам разные стили поэзии. Отличный инструмент для обучения — дети в восторге от технологий.",
    stars: 4,
  },
  {
    name: "Алексей Р.",
    role: "Предприниматель",
    text: "Написал корпоративный гимн для компании за 5 минут. Коллеги до сих пор не верят, что это нейросеть.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            💬 Отзывы пользователей
          </h2>
          <p className="text-muted-foreground text-lg">
            Что говорят наши пользователи о PoetAI
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-primary/10 hover:border-primary/20 transition-all bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${j < t.stars ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
                <div className="pt-2 border-t border-primary/10">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
