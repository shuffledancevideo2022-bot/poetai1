import { useState } from "react";
import { PoemGenerator } from "@/components/PoemGenerator";
import { SongGenerator } from "@/components/SongGenerator";
import { Examples } from "@/components/Examples";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"poem" | "song">("poem");
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(252, 250, 255, 0.9), rgba(229, 222, 255, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4 text-center space-y-8">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              PoetAI
            </h1>
            <p className="text-2xl md:text-3xl font-medium text-foreground/80">
              Твоя Муза в мире слов
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Создай стих, песню или признание — за одно мгновение.<br />
              Выбери тему, стиль и вдохновение — нейросеть создаст твоё произведение искусства.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Button 
              asChild
              size="lg"
              className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-glow"
            >
              <a href="#generator">
                <Sparkles className="mr-2 h-5 w-5" />
                Создать стих
              </a>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="h-14 px-8 text-lg border-primary/30 hover:bg-primary/10"
            >
              <Link to="/guide">
                <BookOpen className="mr-2 h-5 w-5" />
                Мастерская поэта
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Generator Section with Tabs */}
      <section id="generator" className="py-20 bg-gradient-to-b from-sky to-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="poem" className="w-full" onValueChange={(value) => setActiveTab(value as "poem" | "song")}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12">
              <TabsTrigger value="poem" className="text-base font-medium">
                ✍️ Создать стих
              </TabsTrigger>
              <TabsTrigger value="song" className="text-base font-medium">
                🎵 Создать песню
              </TabsTrigger>
            </TabsList>
            <TabsContent value="poem">
              <PoemGenerator />
            </TabsContent>
            <TabsContent value="song">
              <SongGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 bg-gradient-to-b from-background to-sky">
        <div className="container mx-auto px-4">
          <Examples type={activeTab} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-lg font-medium">
            PoetAI — Искусство слова, рождённое нейросетью
          </p>
          <p className="text-sm text-muted-foreground">
            Создавайте прекрасные стихи, песни и поздравления с помощью искусственного интеллекта
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
