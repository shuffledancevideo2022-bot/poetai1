import { useEffect, useState } from "react";
import { Sparkles, Users, Star, TrendingUp } from "lucide-react";

const stats = [
  { icon: Sparkles, value: 12500, suffix: "+", label: "Стихов создано", color: "text-primary" },
  { icon: Users, value: 3200, suffix: "+", label: "Пользователей", color: "text-secondary" },
  { icon: Star, value: 4.8, suffix: "", label: "Средняя оценка", color: "text-accent" },
  { icon: TrendingUp, value: 98, suffix: "%", label: "Довольных клиентов", color: "text-primary" },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(step >= steps ? target : Math.round(increment * step * 10) / 10);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  const display = Number.isInteger(target) ? Math.round(current).toLocaleString('ru-RU') : current.toFixed(1);
  return <>{display}{suffix}</>;
}

export function SocialProof() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <stat.icon className={`h-6 w-6 mx-auto ${stat.color}`} />
              <div className="text-3xl md:text-4xl font-bold">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
