import { X, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm">
        <Zap className="h-4 w-4 shrink-0" />
        <span className="font-medium">
          🎁 Регистрируйтесь и получите <strong>5 бесплатных</strong> генераций!
        </span>
        <Link
          to="/pricing"
          className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
        >
          Смотреть тарифы →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 p-0.5 rounded hover:bg-primary-foreground/20 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
