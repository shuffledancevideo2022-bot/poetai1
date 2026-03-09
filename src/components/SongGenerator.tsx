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
import { Loader2, Music, Copy, Share2, Sparkles, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { incrementPoemsCount } from "@/components/SocialProof";

export const SongGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("pop");
  const [mood, setMood] = useState("энергичная");
  const [structure, setStructure] = useState("standard");
  const [language, setLanguage] = useState("russian");
  const [length, setLength] = useState("medium");
  const [template, setTemplate] = useState("free");
  const [artistStyle, setArtistStyle] = useState("free");
  const [vocalType, setVocalType] = useState("mixed");
  const [tempo, setTempo] = useState("medium");
  const [productionStyle, setProductionStyle] = useState("clean");
  const [generatedSong, setGeneratedSong] = useState("");
  const [songStyle, setSongStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const rateLimit = useRateLimit();

  const templates = [
    { value: "free", label: "🎤 Свободная тема" },
    { value: "love", label: "💕 Песня о любви", prompt: "Романтическая песня о глубоких чувствах и любви, о том как сердце бьётся рядом с любимым человеком" },
    { value: "summer", label: "☀️ Летняя песня", prompt: "Песня о лете, солнце, море, пляже и беззаботных днях каникул" },
    { value: "nostalgia", label: "📷 Ностальгия", prompt: "Песня о воспоминаниях детства, о прошлом и ностальгии по ушедшим временам" },
    { value: "motivation", label: "💪 Мотивация", prompt: "Мотивирующая песня о преодолении трудностей, вере в себя и достижении целей" },
    { value: "friendship", label: "🤝 Дружба", prompt: "Песня о настоящей дружбе, верных друзьях и поддержке в трудные времена" },
    { value: "city", label: "🌃 Ночной город", prompt: "Песня о городской жизни, ночных улицах, неоновых огнях и приключениях" },
    { value: "freedom", label: "🦅 Свобода", prompt: "Песня о свободе, мечтах, полёте и желании жить по своим правилам" },
    { value: "party", label: "🎉 Вечеринка", prompt: "Танцевальная песня для вечеринки, о веселье, танцах и незабываемой ночи" },
    { value: "heartbreak", label: "💔 Разбитое сердце", prompt: "Грустная песня о расставании, разбитом сердце и боли потери любви" },
    { value: "dreams", label: "✨ Мечты", prompt: "Песня о мечтах, надеждах и вере в то, что всё возможно" },
  ];

  const artistStyles = [
    { value: "free", label: "🎵 Без особого стиля", era: "" },
    // Дискотека 80-90х
    { value: "laskoviy-may", label: "Ласковый Май", era: "80-е" },
    { value: "komissar", label: "Комиссар", era: "90-е" },
    { value: "mirazh", label: "Мираж", era: "80-е" },
    { value: "na-na", label: "На-На", era: "90-е" },
    { value: "teknologiya", label: "Технология", era: "90-е" },
    // Eurodance 90-х
    { value: "diskoteka-avariya", label: "Дискотека Авария", era: "2000-е" },
    { value: "ivanushki", label: "Иванушки International", era: "90-е" },
    { value: "ruki-vverh", label: "Руки Вверх", era: "90-е" },
    // Русский рок
    { value: "kino", label: "Кино", era: "80-е" },
    { value: "ddt", label: "ДДТ", era: "80-е" },
    { value: "nautilus", label: "Nautilus Pompilius", era: "80-е" },
    { value: "alisa", label: "Алиса", era: "80-е" },
    { value: "akvarium", label: "Аквариум", era: "80-е" },
    { value: "mashina-vremeni", label: "Машина Времени", era: "70-80-е" },
    { value: "chai-f", label: "Чайф", era: "80-е" },
    { value: "sekret", label: "Секрет", era: "80-е" },
    // Альтернатива 90-2000х
    { value: "splin", label: "Сплин", era: "90-е" },
    { value: "zemfira", label: "Земфира", era: "2000-е" },
    { value: "bi-2", label: "Би-2", era: "2000-е" },
    { value: "mumiy-troll", label: "Мумий Тролль", era: "90-е" },
    { value: "agata-kristi", label: "Агата Кристи", era: "90-е" },
    // Особые стили
    { value: "leningrad", label: "Ленинград", era: "2000-е" },
    { value: "lyube", label: "Любэ", era: "90-е" },
    { value: "slot", label: "Слот", era: "2000-е" },
  ];

  const genres = [
    { value: "pop", label: "🎵 Pop" },
    { value: "rock", label: "🎸 Rock" },
    { value: "hip-hop", label: "🎤 Hip-Hop" },
    { value: "electronic", label: "🎹 Electronic" },
    { value: "indie", label: "🌿 Indie" },
    { value: "folk", label: "🪕 Folk" },
    { value: "jazz", label: "🎷 Jazz" },
    { value: "rnb", label: "💜 R&B" },
    { value: "disco", label: "🪩 Disco" },
    { value: "synthwave", label: "🌆 Synthwave" },
    { value: "ballad", label: "🎼 Ballad" },
    { value: "country", label: "🤠 Country" },
    { value: "blues", label: "🎺 Blues" },
  ];

  const moods = [
    { value: "энергичная", label: "⚡ Энергичная" },
    { value: "меланхоличная", label: "🌧️ Меланхоличная" },
    { value: "романтичная", label: "💕 Романтичная" },
    { value: "веселая", label: "😄 Весёлая" },
    { value: "драматичная", label: "🎭 Драматичная" },
    { value: "мечтательная", label: "💭 Мечтательная" },
    { value: "мощная", label: "💪 Мощная" },
    { value: "спокойная", label: "🧘 Спокойная" },
    { value: "ностальгическая", label: "📷 Ностальгическая" },
  ];

  const vocalTypes = [
    { value: "male", label: "👨 Мужской вокал" },
    { value: "female", label: "👩 Женский вокал" },
    { value: "mixed", label: "👫 Дуэт / Смешанный" },
    { value: "choir", label: "🎭 Хор / Группа" },
    { value: "whisper", label: "🤫 Шёпот" },
    { value: "raspy", label: "🔥 Хриплый" },
    { value: "falsetto", label: "✨ Фальцет" },
  ];

  const tempos = [
    { value: "slow", label: "🐢 Медленный (70-90 BPM)" },
    { value: "medium", label: "🚶 Средний (100-120 BPM)" },
    { value: "fast", label: "🏃 Быстрый (130-150 BPM)" },
    { value: "very-fast", label: "🚀 Очень быстрый (160+ BPM)" },
  ];

  const productionStyles = [
    { value: "clean", label: "✨ Чистый студийный" },
    { value: "lo-fi", label: "📻 Lo-Fi / Винил" },
    { value: "live", label: "🎤 Живое звучание" },
    { value: "retro", label: "📼 Ретро 80-х" },
    { value: "modern", label: "🔊 Современный" },
    { value: "raw", label: "🎸 Сырой / Гаражный" },
  ];

  const structures = [
    { value: "standard", label: "📝 Стандартная" },
    { value: "extended", label: "📜 Расширенная" },
    { value: "minimal", label: "✂️ Минимальная" },
    { value: "epic", label: "🏔️ Эпическая" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Введите запрос",
        description: "Пожалуйста, опишите, о чём должна быть песня",
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-song`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ 
            prompt, 
            genre, 
            mood, 
            structure, 
            language, 
            length, 
            artistStyle,
            vocalType,
            tempo,
            productionStyle
          }),
        }
      );

      rateLimit.updateFromHeaders(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка генерации");
      }

      const data = await response.json();
      setSongStyle(data.style);
      setGeneratedSong(data.song);
      
      // Increment counter and dispatch event
      incrementPoemsCount();
      window.dispatchEvent(new CustomEvent('poem-generated'));
      
      toast({
        title: "Песня создана! 🎵",
        description: "Готово для Suno AI",
      });
    } catch (error: any) {
      console.error('Error generating song:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать песню. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyStyle = () => {
    navigator.clipboard.writeText(songStyle);
    toast({
      title: "Скопировано!",
      description: "Стиль скопирован в буфер обмена",
    });
  };

  const copySongText = () => {
    navigator.clipboard.writeText(generatedSong);
    toast({
      title: "Скопировано!",
      description: "Текст песни скопирован в буфер обмена",
    });
  };

  const copyAll = () => {
    const fullText = `Style of Music:\n${songStyle}\n\nLyrics:\n${generatedSong}`;
    navigator.clipboard.writeText(fullText);
    toast({
      title: "Всё скопировано!",
      description: "Стиль и текст скопированы для Suno AI",
    });
  };

  const shareSong = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Моя песня от PoetAI для Suno AI',
        text: `Стиль: ${songStyle}\n\n${generatedSong}`,
      });
    } else {
      copyAll();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-primary/10">
        <div className="space-y-6">
          {/* Шаблон темы */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-lg font-medium">
              📝 Шаблон темы
            </Label>
            <Select 
              value={template} 
              onValueChange={(value) => {
                setTemplate(value);
                const selectedTemplate = templates.find(t => t.value === value);
                if (selectedTemplate?.prompt) {
                  setPrompt(selectedTemplate.prompt);
                }
              }}
            >
              <SelectTrigger id="template" className="border-primary/20">
                <SelectValue placeholder="Выберите шаблон или введите свою тему" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Описание песни */}
          <div className="space-y-2">
            <Label htmlFor="song-prompt" className="text-lg font-medium">
              О чём должна быть песня?
            </Label>
            <Textarea
              id="song-prompt"
              placeholder="Например: Песня о летней ночи, когда мы танцевали под звёздами на берегу моря..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none border-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Основные настройки */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">🎸 Жанр</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="song-mood">🎶 Настроение</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="song-mood" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vocal-type">🎤 Тип вокала</Label>
              <Select value={vocalType} onValueChange={setVocalType}>
                <SelectTrigger id="vocal-type" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vocalTypes.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo">⏱️ Темп</Label>
              <Select value={tempo} onValueChange={setTempo}>
                <SelectTrigger id="tempo" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tempos.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">🌐 Язык песни</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="russian">🇷🇺 Русский</SelectItem>
                  <SelectItem value="english">🇬🇧 English</SelectItem>
                  <SelectItem value="mixed">🌍 Смешанный (RU/EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">📏 Длина песни</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger id="length" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">⚡ Короткая (1-2 мин)</SelectItem>
                  <SelectItem value="medium">📀 Средняя (2-3 мин)</SelectItem>
                  <SelectItem value="long">💿 Длинная (3-4 мин)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Стиль исполнителя */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="artist-style" className="text-lg font-medium">
                🎤 Стиль исполнителя
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Выберите стиль известной группы 80-х, 90-х или 2000-х. Нейросеть будет имитировать характерные черты их текстов и мелодий.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={artistStyle} onValueChange={setArtistStyle}>
              <SelectTrigger id="artist-style" className="border-primary/20">
                <SelectValue placeholder="Выберите стиль группы" />
              </SelectTrigger>
              <SelectContent>
                {artistStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label} {style.era && <span className="text-muted-foreground ml-1">({style.era})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Расширенные настройки */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between border border-dashed border-primary/20 hover:bg-primary/5">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Расширенные настройки SUNO AI
                </span>
                <span className="text-xs text-muted-foreground">
                  {showAdvanced ? "Скрыть" : "Показать"}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border border-primary/10">
                <div className="space-y-2">
                  <Label htmlFor="structure">🎼 Структура песни</Label>
                  <Select value={structure} onValueChange={setStructure}>
                    <SelectTrigger id="structure" className="border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {structures.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production-style">🎛️ Стиль продакшена</Label>
                  <Select value={productionStyle} onValueChange={setProductionStyle}>
                    <SelectTrigger id="production-style" className="border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productionStyles.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 p-3 bg-primary/5 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Подсказка по SUNO AI тегам
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Генератор автоматически добавляет мета-теги для SUNO AI: [Intro], [Verse], [Chorus], [Bridge], [Drop], [Fade Out] и другие.
                    Также добавляются теги вокала [Male Vocals], [Female Vocals], [Whisper] и эффектов [Reverb Heavy], [Building Intensity].
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
                Создаю песню для Suno AI...
              </>
            ) : (
              <>
                <Music className="mr-2 h-5 w-5" />
                Создать песню
              </>
            )}
          </Button>
        </div>
      </div>

      {generatedSong && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Style Block */}
          <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-6 shadow-glow border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  🎵 Style of Music (для SUNO AI)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Скопируйте и вставьте в поле "Style of Music" в SUNO
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyStyle}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="font-mono text-base text-foreground leading-relaxed">
                {songStyle}
              </p>
            </div>
          </div>

          {/* Song Text Block */}
          <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-6 shadow-glow border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  📝 Lyrics (для SUNO AI)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Скопируйте и вставьте в поле "Lyrics" в SUNO
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copySongText}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareSong}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={generatedSong}
              onChange={(e) => setGeneratedSong(e.target.value)}
              className="min-h-[400px] font-mono text-sm leading-relaxed border-primary/20 focus:border-primary transition-colors bg-muted/30"
              placeholder="Текст песни появится здесь..."
            />
          </div>

          {/* Copy All Button */}
          <Button 
            onClick={copyAll}
            variant="outline"
            className="w-full h-12 border-primary/30 hover:bg-primary/10"
          >
            <Copy className="mr-2 h-4 w-4" />
            Скопировать всё для SUNO AI
          </Button>
        </div>
      )}
    </div>
  );
};
