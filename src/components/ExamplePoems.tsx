import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
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

export const ExamplePoems = () => {
  const { toast } = useToast();

  const copyPoem = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Скопировано!",
      description: "Стихотворение скопировано в буфер обмена",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Примеры стихотворений
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {examplePoems.map((poem, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-glow transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{poem.title}</h3>
                  <p className="text-sm text-muted-foreground">{poem.style}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyPoem(poem.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground/80">
                {poem.content}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
