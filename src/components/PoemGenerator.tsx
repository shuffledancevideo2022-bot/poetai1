import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/useRateLimit";
import { RateLimitIndicator } from "@/components/RateLimitIndicator";
import { Loader2, Sparkles, Copy, Share2 } from "lucide-react";
import { incrementPoemsCount } from "@/components/SocialProof";

export const PoemGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("лирика");
  const [mood, setMood] = useState("вдохновение");
  const [theme, setTheme] = useState("любовь");
  const [quatrainCount, setQuatrainCount] = useState("4");
  const [poetStyle, setPoetStyle] = useState("none");
  const [artistStyle, setArtistStyle] = useState("none");
  const [generatedPoem, setGeneratedPoem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const rateLimit = useRateLimit();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Введите запрос",
        description: "Пожалуйста, опишите, о чём должно быть стихотворение",
        variant: "destructive",
      });
      return;
    }

    if (rateLimit.isLimited) {
      toast({
        title: "Лимит исчерпан",
        description: `Подождите ${rateLimit.retryAfter} секунд`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-poem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ 
            prompt, 
            style, 
            mood, 
            theme, 
            quatrainCount: parseInt(quatrainCount),
            poetStyle: poetStyle !== "none" ? poetStyle : null,
            artistStyle: artistStyle !== "none" ? artistStyle : null
          }),
        }
      );

      rateLimit.updateFromHeaders(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка генерации");
      }

      const data = await response.json();
      setGeneratedPoem(data.poem);
      toast({
        title: "Стихотворение создано! ✨",
        description: "Ваше произведение готово",
      });
    } catch (error: any) {
      console.error('Error generating poem:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать стихотворение. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPoem);
    toast({
      title: "Скопировано!",
      description: "Стихотворение скопировано в буфер обмена",
    });
  };

  const sharePoem = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Моё стихотворение от PoetAI',
        text: generatedPoem,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-primary/10">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-lg font-medium">
              О чём должно быть стихотворение?
            </Label>
            <Textarea
              id="prompt"
              placeholder="Например: Стих о первой любви под звёздным небом..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none border-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">🎭 Стиль</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="лирика">Лирика</SelectItem>
                  <SelectItem value="рэп">Рэп</SelectItem>
                  <SelectItem value="шансон">Шансон</SelectItem>
                  <SelectItem value="классика">Классика</SelectItem>
                  <SelectItem value="баллада">Баллада</SelectItem>
                  <SelectItem value="хайку">Хайку</SelectItem>
                  <SelectItem value="юмор">Юмор</SelectItem>
                  <SelectItem value="философия">Философия</SelectItem>
                  <SelectItem value="поздравление">Поздравление</SelectItem>
                  <SelectItem value="романс">Романс</SelectItem>
                  <SelectItem value="сонет">Сонет</SelectItem>
                  <SelectItem value="ода">Ода</SelectItem>
                  <SelectItem value="элегия">Элегия</SelectItem>
                  <SelectItem value="басня">Басня</SelectItem>
                  <SelectItem value="эпиграмма">Эпиграмма</SelectItem>
                  <SelectItem value="частушка">Частушка</SelectItem>
                  <SelectItem value="рок-текст">Рок-текст</SelectItem>
                  <SelectItem value="поп-текст">Поп-текст</SelectItem>
                  <SelectItem value="фолк">Фолк</SelectItem>
                  <SelectItem value="акростих">Акростих</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">🎶 Настроение</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="радость">Радость</SelectItem>
                  <SelectItem value="грусть">Грусть</SelectItem>
                  <SelectItem value="ностальгия">Ностальгия</SelectItem>
                  <SelectItem value="страсть">Страсть</SelectItem>
                  <SelectItem value="вдохновение">Вдохновение</SelectItem>
                  <SelectItem value="мечтательность">Мечтательность</SelectItem>
                  <SelectItem value="меланхолия">Меланхолия</SelectItem>
                  <SelectItem value="тревога">Тревога</SelectItem>
                  <SelectItem value="надежда">Надежда</SelectItem>
                  <SelectItem value="умиротворение">Умиротворение</SelectItem>
                  <SelectItem value="дерзость">Дерзость</SelectItem>
                  <SelectItem value="нежность">Нежность</SelectItem>
                  <SelectItem value="торжество">Торжество</SelectItem>
                  <SelectItem value="отчаяние">Отчаяние</SelectItem>
                  <SelectItem value="восторг">Восторг</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">💌 Тема</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="любовь">Любовь</SelectItem>
                  <SelectItem value="разлука">Разлука</SelectItem>
                  <SelectItem value="мечты">Мечты</SelectItem>
                  <SelectItem value="природа">Природа</SelectItem>
                  <SelectItem value="судьба">Судьба</SelectItem>
                  <SelectItem value="воспоминания">Воспоминания</SelectItem>
                  <SelectItem value="дружба">Дружба</SelectItem>
                  <SelectItem value="жизнь">Жизнь</SelectItem>
                  <SelectItem value="одиночество">Одиночество</SelectItem>
                  <SelectItem value="время">Время</SelectItem>
                  <SelectItem value="свобода">Свобода</SelectItem>
                  <SelectItem value="родина">Родина</SelectItem>
                  <SelectItem value="странствия">Странствия</SelectItem>
                  <SelectItem value="вечность">Вечность</SelectItem>
                  <SelectItem value="творчество">Творчество</SelectItem>
                  <SelectItem value="детство">Детство</SelectItem>
                  <SelectItem value="семья">Семья</SelectItem>
                  <SelectItem value="ночь">Ночь</SelectItem>
                  <SelectItem value="море">Море</SelectItem>
                  <SelectItem value="город">Город</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quatrainCount">📝 Четверостиший</Label>
              <Select value={quatrainCount} onValueChange={setQuatrainCount}>
                <SelectTrigger id="quatrainCount" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poetStyle">✍️ Стиль поэта</Label>
              <Select value={poetStyle} onValueChange={setPoetStyle}>
                <SelectTrigger id="poetStyle" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без стиля поэта</SelectItem>
                  <SelectItem value="pushkin">Александр Пушкин</SelectItem>
                  <SelectItem value="lermontov">Михаил Лермонтов</SelectItem>
                  <SelectItem value="esenin">Сергей Есенин</SelectItem>
                  <SelectItem value="mayakovsky">Владимир Маяковский</SelectItem>
                  <SelectItem value="akhmatova">Анна Ахматова</SelectItem>
                  <SelectItem value="tsvetaeva">Марина Цветаева</SelectItem>
                  <SelectItem value="pasternak">Борис Пастернак</SelectItem>
                  <SelectItem value="mandelstam">Осип Мандельштам</SelectItem>
                  <SelectItem value="brodsky">Иосиф Бродский</SelectItem>
                  <SelectItem value="vysotsky">Владимир Высоцкий</SelectItem>
                  <SelectItem value="okudzhava">Булат Окуджава</SelectItem>
                  <SelectItem value="akhmadulina">Белла Ахмадулина</SelectItem>
                  <SelectItem value="evtushenko">Евгений Евтушенко</SelectItem>
                  <SelectItem value="rozhdestvensky">Роберт Рождественский</SelectItem>
                  <SelectItem value="asadov">Эдуард Асадов</SelectItem>
                  <SelectItem value="severyanin">Игорь Северянин</SelectItem>
                  <SelectItem value="blok">Александр Блок</SelectItem>
                  <SelectItem value="fet">Афанасий Фет</SelectItem>
                  <SelectItem value="tyutchev">Фёдор Тютчев</SelectItem>
                  <SelectItem value="rubtsov">Николай Рубцов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistStyle">🎤 Стиль исполнителя</Label>
              <Select value={artistStyle} onValueChange={setArtistStyle}>
                <SelectTrigger id="artistStyle" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без стиля исполнителя</SelectItem>
                  <SelectItem value="laskovymay">Ласковый Май</SelectItem>
                  <SelectItem value="kino">Кино</SelectItem>
                  <SelectItem value="nautilus">Наутилус Помпилиус</SelectItem>
                  <SelectItem value="aria">Ария</SelectItem>
                  <SelectItem value="alisa">Алиса</SelectItem>
                  <SelectItem value="ddt">ДДТ</SelectItem>
                  <SelectItem value="mirazh">Мираж</SelectItem>
                  <SelectItem value="komissar">Комиссар</SelectItem>
                  <SelectItem value="rukivverh">Руки Вверх</SelectItem>
                  <SelectItem value="ivanushki">Иванушки International</SelectItem>
                  <SelectItem value="zemfira">Земфира</SelectItem>
                  <SelectItem value="splin">Сплин</SelectItem>
                  <SelectItem value="bi2">Би-2</SelectItem>
                  <SelectItem value="mumiytroll">Мумий Тролль</SelectItem>
                  <SelectItem value="lyube">Любэ</SelectItem>
                  <SelectItem value="mashinavremeni">Машина времени</SelectItem>
                  <SelectItem value="agatakristy">Агата Кристи</SelectItem>
                  <SelectItem value="tehnologiya">Технология</SelectItem>
                  <SelectItem value="sekret">Секрет</SelectItem>
                  <SelectItem value="fabrika">Фабрика</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <RateLimitIndicator
            remaining={rateLimit.remaining}
            maxRequests={rateLimit.maxRequests}
            isLimited={rateLimit.isLimited}
            retryAfter={rateLimit.retryAfter}
            resetIn={rateLimit.resetIn}
          />

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || rateLimit.isLimited} 
            className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Создаю ваше произведение...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Создать стих
              </>
            )}
          </Button>
        </div>
      </div>

      {generatedPoem && (
        <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-8 shadow-glow border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ваше стихотворение
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={sharePoem}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground">
              {generatedPoem}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
