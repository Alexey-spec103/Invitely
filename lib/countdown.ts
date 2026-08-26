const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;

export interface CountdownParts {
  reached: boolean;
  past: boolean;
  weeks: number;
  /** Days remaining within the current week (0-6) -- pairs with `weeks`,
   * not a running total. Use `totalDays` for a plain day count. */
  days: number;
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Shared by every Countdown variant that shows a weeks+days breakdown
 * (SimpleDigits, CircularRings) -- MinimalInline deliberately keeps its own
 * simpler days-only calculation, since a 5th unit would work against its
 * whole point (a single compact line). */
export function getCountdownParts(eventDateTime: string): CountdownParts {
  const target = new Date(eventDateTime).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    reached: diff <= 0,
    // "Today's the day!" only holds for the first 24h after the target --
    // past that, a guest checking back a week/month/year later (nothing in
    // the app prompts unpublishing an old site) shouldn't see stale
    // "today" copy forever.
    past: now - target > ONE_DAY_MS,
    weeks: Math.floor(diff / ONE_WEEK_MS),
    days: Math.floor((diff % ONE_WEEK_MS) / ONE_DAY_MS),
    totalDays: Math.floor(diff / ONE_DAY_MS),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
