import type { GameStatus, Guess } from "../types";
import { todayKey } from "./daily";

interface SavedState {
  guesses: Guess[];
  status: GameStatus;
}

const PREFIX = "metafunga-";

export function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(PREFIX + todayKey());
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

export function saveState(state: SavedState): void {
  try {
    localStorage.setItem(PREFIX + todayKey(), JSON.stringify(state));
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
