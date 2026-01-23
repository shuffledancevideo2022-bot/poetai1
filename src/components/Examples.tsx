import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const examplePoems = [
  {
    title: "Первая встреча",
    style: "Лирика",
    content: `В тот вечер звёзды ярко так сияли,
Когда тебя я повстречал впервой.
Твои глаза меня околдовали,
И мир наполнился волшебной красотой.`,
  },
  {
    title: "Осенний вальс",
    style: "Романтика",
    content: `Кружит листва в осеннем вальсе нежном,
И ветер шепчет песню о любви.
В душе звучат аккорды безмятежно,
О чувствах, что навеки сберегли.`,
  },
  {
    title: "Мечты",
    style: "Философия",
    content: `Мечты как птицы в небе голубом,
Летят свободно к дальним горизонтам.
И сердце верит в чудо с каждым днём,
Что наше счастье там, за поворотом.`,
  },
];

const exampleSongs = [
  {
    title: "Летняя ночь",
    theme: "Pop | Романтика | Мечтательная",
    preview: `[Verse 1]
Под звёздным небом мы танцуем вдвоём
Летний ветер шепчет нам о том
Как прекрасен этот мир когда ты рядом
И сердце бьётся в унисон с твоим взглядом`,
    fullContent: `[Verse 1]
Под звёздным небом мы танцуем вдвоём
Летний ветер шепчет нам о том
Как прекрасен этот мир когда ты рядом
И сердце бьётся в унисон с твоим взглядом

[Chorus]
Эта ночь для нас двоих
Звёзды светят для двоих
В этом танце без конца
Наши бьются два сердца

[Verse 2]
Луна рисует серебром следы
На тёмной глади тихой воды
Мы растворяемся в ночной тиши
И время замирает в глубине души

[Chorus]
Эта ночь для нас двоих
Звёзды светят для двоих
В этом танце без конца
Наши бьются два сердца

[Bridge]
Пусть рассвет не наступает
Пусть мгновенье не растает
Этот миг мы сохраним
Навсегда в сердцах своих

[Chorus]
Эта ночь для нас двоих
Звёзды светят для двоих
В этом танце без конца
Наши бьются два сердца`,
  },
  {
    title: "Дорога",
    theme: "Rock | Энергичная | Мощная",
    preview: `[Verse 1]
Дорога зовёт меня вперёд
Не знаю куда она ведёт
Но сердце горит огнём внутри
И нет пути назад смотри`,
    fullContent: `[Verse 1]
Дорога зовёт меня вперёд
Не знаю куда она ведёт
Но сердце горит огнём внутри
И нет пути назад смотри

[Chorus]
Я иду по своему пути
Не страшны преграды на пути
Ветер в спину солнце впереди
Я свободен как никогда

[Verse 2]
Километры тают за спиной
Каждый шаг наполнен силой и мечтой
Города и лица все вдали
Только я и горизонт земли

[Chorus]
Я иду по своему пути
Не страшны преграды на пути
Ветер в спину солнце впереди
Я свободен как никогда

[Bridge]
Пусть говорят что я не прав
Я выбрал свой нелёгкий нрав
Моя судьба в моих руках
И страха больше нет в глазах

[Chorus]
Я иду по своему пути
Не страшны преграды на пути
Ветер в спину солнце впереди
Я свободен как никогда`,
  },
  {
    title: "Утро в городе",
    theme: "Indie | Спокойная | Меланхоличная",
    preview: `[Verse 1]
Город просыпается с рассветом
Тихо шепчет улицам приветы
Кофе горький и дымок из чашки
Новый день приносит нам букашки`,
    fullContent: `[Verse 1]
Город просыпается с рассветом
Тихо шепчет улицам приветы
Кофе горький и дымок из чашки
Новый день приносит нам букашки

[Chorus]
Утро в городе пахнет кофе
Люди спешат по своей дороге
Я сижу у окна и смотрю
На этот мир что я так люблю

[Verse 2]
Трамваи звенят своей мелодией
Голуби на площади в симфодии
Каждый день похож на предыдущий
Но в нём есть момент настоящий

[Chorus]
Утро в городе пахнет кофе
Люди спешат по своей дороге
Я сижу у окна и смотрю
На этот мир что я так люблю

[Bridge]
Может завтра всё изменится
Может счастье в дверь постучится
Но сегодня я просто живу
В этом утре что я берегу

[Outro]
Город засыпает с закатом
И я жду нового рассвета`,
  },
];

interface ExamplesProps {
  type: "poem" | "song";
}

export const Examples = ({ type }: ExamplesProps) => {
  const { toast } = useToast();
  const [expandedSongs, setExpandedSongs] = useState<number[]>([]);

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Скопировано!",
      description: type === "poem" 
        ? "Стихотворение скопировано в буфер обмена"
        : "Текст песни скопирован в буфер обмена",
    });
  };

  const toggleExpand = (index: number) => {
    setExpandedSongs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const examples = type === "poem" ? examplePoems : exampleSongs;
  const title = type === "poem" ? "Примеры стихотворений" : "Примеры песен";

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-glow transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{example.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type === "poem" ? example.style : (example as any).theme}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyContent(
                    type === "poem" ? example.content : (example as any).fullContent
                  )}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground/80">
                {type === "poem" ? (
                  example.content
                ) : (
                  <>
                    {expandedSongs.includes(index) 
                      ? (example as any).fullContent 
                      : (example as any).preview
                    }
                  </>
                )}
              </div>
              {type === "song" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpand(index)}
                  className="w-full border-primary/20 hover:bg-primary/10"
                >
                  {expandedSongs.includes(index) ? "Свернуть" : "Подробнее"}
                  <ChevronDown 
                    className={`ml-2 h-4 w-4 transition-transform ${
                      expandedSongs.includes(index) ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
