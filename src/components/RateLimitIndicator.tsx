import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitIndicatorProps {
  remaining: number | null;
  maxRequests: number;
  isLimited: boolean;
  retryAfter: number | null;
  resetIn: number | null;
}

export function RateLimitIndicator({
  remaining,
  maxRequests,
  isLimited,
  retryAfter,
  resetIn,
}: RateLimitIndicatorProps) {
  // Don't show if no data yet or plenty of requests remaining
  if (remaining === null && !isLimited) return null;
  if (remaining !== null && remaining >= 7 && !isLimited) return null;

  const percentage = remaining !== null ? (remaining / maxRequests) * 100 : 0;
  const isWarning = remaining !== null && remaining <= 3 && remaining > 0;
  const isCritical = remaining === 0 || isLimited;

  return (
    <div
      className={cn(
        "rounded-lg p-3 border transition-all",
        isCritical && "bg-destructive/10 border-destructive/30",
        isWarning && "bg-yellow-500/10 border-yellow-500/30",
        !isCritical && !isWarning && "bg-primary/5 border-primary/20"
      )}
    >
      {isLimited ? (
        <div className="flex items-center gap-2 text-destructive">
          <Clock className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">
            Лимит исчерпан. Подождите {retryAfter ?? 0} сек...
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isWarning ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <Zap className="h-4 w-4 text-primary" />
              )}
              <span
                className={cn(
                  "font-medium",
                  isWarning && "text-yellow-600 dark:text-yellow-400"
                )}
              >
                Запросов: {remaining}/{maxRequests}
              </span>
            </div>
            {resetIn && (
              <span className="text-muted-foreground text-xs">
                Сброс через {resetIn} сек
              </span>
            )}
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-2",
              isWarning && "[&>div]:bg-yellow-500",
              isCritical && "[&>div]:bg-destructive"
            )}
          />
        </div>
      )}
    </div>
  );
}
