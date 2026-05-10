import { ACTIVE_FUNGI } from "../data/fungi";

const EPOCH = new Date("2026-05-07T00:00:00Z");

// Pre-shuffled order (Fisher-Yates with seed 42) so the sequence isn't just indices.
// Generated once and baked in so it's deterministic across all clients.
function buildDailyOrder(): string[] {
  const ids = ACTIVE_FUNGI.map((f) => f.id);
  // Seeded LCG for reproducible shuffle
  let seed = 42;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const DAILY_ORDER: string[] = buildDailyOrder();

export function getDayIndex(date: Date = new Date()): number {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcEpoch = Date.UTC(
    EPOCH.getFullYear(),
    EPOCH.getMonth(),
    EPOCH.getDate()
  );
  return Math.floor((utcDate - utcEpoch) / 86_400_000);
}

export function getDailyFungusId(date?: Date): string {
  const idx = getDayIndex(date);
  return DAILY_ORDER[idx % DAILY_ORDER.length];
}

export function getDayNumber(date?: Date): number {
  return getDayIndex(date) + 1;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
