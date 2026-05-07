import { useCallback, useEffect, useState } from "react";
import type { Fungus, GameState, GameStatus, Guess, Rank } from "../types";
import { FUNGI_MAP } from "../data/fungi";
import {
  deepestSharedRank,
  mergeRevealedRanks,
  ranksRevealedByMatch,
} from "../utils/phylogeny";
import { loadState, saveState } from "../utils/storage";

const MAX_GUESSES = 20;

function initialRevealedRanks(): Set<Rank> {
  return new Set(["kingdom"] as Rank[]);
}

export function useGame(target: Fungus, dayNumber: number) {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadState();
    if (saved) {
      return {
        targetId: target.id,
        guesses: saved.guesses,
        revealedRanks: revealedRanksFromGuesses(saved.guesses, target),
        status: saved.status,
        dayNumber,
      };
    }
    return {
      targetId: target.id,
      guesses: [],
      revealedRanks: initialRevealedRanks(),
      status: "playing" as GameStatus,
      dayNumber,
    };
  });

  // Persist whenever guesses or status changes
  useEffect(() => {
    saveState({ guesses: state.guesses, status: state.status });
  }, [state.guesses, state.status]);

  const submitGuess = useCallback(
    (fungusId: string) => {
      if (state.status !== "playing") return;
      if (state.guesses.some((g) => g.fungusId === fungusId)) return;

      const guessedFungus = FUNGI_MAP.get(fungusId);
      if (!guessedFungus) return;

      const matchRank = deepestSharedRank(guessedFungus, target);
      const newRevealed = ranksRevealedByMatch(matchRank);

      const isWin = fungusId === target.id;
      const guess: Guess = {
        fungusId,
        scientificName: guessedFungus.scientificName,
        commonName: guessedFungus.commonName,
        deepestMatchRank: matchRank,
      };

      setState((prev) => {
        const guesses = [...prev.guesses, guess];
        const isLost = !isWin && guesses.length >= MAX_GUESSES;
        const status: GameStatus = isWin ? "won" : isLost ? "lost" : "playing";
        const revealedRanks = mergeRevealedRanks(prev.revealedRanks, newRevealed);

        // On win or loss, reveal everything
        if (status !== "playing") {
          return {
            ...prev,
            guesses,
            revealedRanks: new Set(["kingdom", "phylum", "class", "order", "family", "genus", "species"] as Rank[]),
            status,
          };
        }

        return { ...prev, guesses, revealedRanks, status };
      });
    },
    [state.status, state.guesses, target]
  );

  return { state, submitGuess, maxGuesses: MAX_GUESSES };
}

function revealedRanksFromGuesses(guesses: Guess[], target: Fungus): Set<Rank> {
  let revealed = initialRevealedRanks();
  for (const guess of guesses) {
    const gFungus = FUNGI_MAP.get(guess.fungusId);
    if (!gFungus) continue;
    const matchRank = deepestSharedRank(gFungus, target);
    revealed = mergeRevealedRanks(revealed, ranksRevealedByMatch(matchRank));
  }
  return revealed;
}
