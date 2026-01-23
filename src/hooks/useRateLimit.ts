import { useState, useCallback, useEffect, useRef } from "react";

export interface RateLimitState {
  remaining: number | null;
  resetIn: number | null;
  isLimited: boolean;
  retryAfter: number | null;
}

const MAX_REQUESTS = 10;

export function useRateLimit() {
  const [state, setState] = useState<RateLimitState>({
    remaining: null,
    resetIn: null,
    isLimited: false,
    retryAfter: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer when limited
  useEffect(() => {
    if (state.isLimited && state.retryAfter && state.retryAfter > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newRetry = (prev.retryAfter ?? 0) - 1;
          if (newRetry <= 0) {
            return {
              remaining: MAX_REQUESTS,
              resetIn: null,
              isLimited: false,
              retryAfter: null,
            };
          }
          return { ...prev, retryAfter: newRetry };
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [state.isLimited, state.retryAfter]);

  const updateFromHeaders = useCallback((response: Response) => {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const resetIn = response.headers.get("X-RateLimit-Reset");
    const retryAfter = response.headers.get("Retry-After");

    if (response.status === 429) {
      const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      setState({
        remaining: 0,
        resetIn: retrySeconds,
        isLimited: true,
        retryAfter: retrySeconds,
      });
    } else if (remaining !== null) {
      setState({
        remaining: parseInt(remaining, 10),
        resetIn: resetIn ? parseInt(resetIn, 10) : null,
        isLimited: false,
        retryAfter: null,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      remaining: null,
      resetIn: null,
      isLimited: false,
      retryAfter: null,
    });
  }, []);

  return {
    ...state,
    maxRequests: MAX_REQUESTS,
    updateFromHeaders,
    reset,
  };
}
