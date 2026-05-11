import type { GameStatus, Guess, Rank } from "../types";
import { todayKey } from "./daily";

interface SavedState {
  guesses: Guess[];
  status: GameStatus;
  hintsUsed: number;
  hintRevealedRanksList: string[];
}

const PREFIX = "metafunga-";

export function loadState(key?: string): SavedState | null {
  try {
    const raw = localStorage.getItem(PREFIX + (key ?? todayKey()));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    return {
      guesses: parsed.guesses ?? [],
      status: parsed.status ?? "playing",
      hintsUsed: parsed.hintsUsed ?? 0,
      hintRevealedRanksList: parsed.hintRevealedRanksList ?? [],
    };
  } catch {
    return null;
  }
}

export function saveState(state: SavedState, key?: string): void {
  try {
    localStorage.setItem(PREFIX + (key ?? todayKey()), JSON.stringify(state));
  } catch {
    // storage quota exceeded — fail silently
  }
}

export function clearOldKeys(): void {
  try {
    const today = PREFIX + todayKey();
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX) && key !== today) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

export function clearState(key?: string): void {
  try {
    localStorage.removeItem(PREFIX + (key ?? todayKey()));
  } catch {
    // ignore
  }
}

export type { SavedState };
export type { Rank };
