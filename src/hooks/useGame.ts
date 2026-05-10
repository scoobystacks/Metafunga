import { useCallback, useEffect, useState } from "react";
import type { Fungus, GameState, GameStatus, Guess, Rank } from "../types";
import { FUNGI_MAP } from "../data/fungi";
import {
  deepestSharedRank,
  mergeRevealedRanks,
  nextHintableRank,
  ranksRevealedByMatch,
} from "../utils/phylogeny";
import { loadState, saveState } from "../utils/storage";

const MAX_GUESSES = 20;

function initialRevealedRanks(): Set<Rank> {
  return new Set(["kingdom"] as Rank[]);
}

function effectiveGuessCount(guessCount: number, hintsUsed: number): number {
  return guessCount + hintsUsed * 3;
}

export function useGame(target: Fungus, dayNumber: number, storageKey?: string) {
  // storageKey: undefined = use today's daily key; "" = no persistence (practice)
  const [state, setState] = useState<GameState>(() => {
    const saved = storageKey === "" ? null : loadState(storageKey);
    if (saved) {
      const hintRevealedRanks = new Set(saved.hintRevealedRanksList as Rank[]);
      const guessRevealedRanks = revealedRanksFromGuesses(saved.guesses, target);
      return {
        targetId: target.id,
        guesses: saved.guesses,
        revealedRanks: mergeRevealedRanks(guessRevealedRanks, hintRevealedRanks),
        hintRevealedRanks,
        hintsUsed: saved.hintsUsed,
        status: saved.status,
        dayNumber,
      };
    }
    return {
      targetId: target.id,
      guesses: [],
      revealedRanks: initialRevealedRanks(),
      hintRevealedRanks: new Set<Rank>(),
      hintsUsed: 0,
      status: "playing" as GameStatus,
      dayNumber,
    };
  });

  useEffect(() => {
    if (storageKey === "") return; // practice mode — no persistence
    saveState({
      guesses: state.guesses,
      status: state.status,
      hintsUsed: state.hintsUsed,
      hintRevealedRanksList: [...state.hintRevealedRanks],
    }, storageKey);
  }, [state.guesses, state.status, state.hintsUsed, state.hintRevealedRanks, storageKey]);

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
        const effective = effectiveGuessCount(guesses.length, prev.hintsUsed);
        const isLost = !isWin && effective >= MAX_GUESSES;
        const status: GameStatus = isWin ? "won" : isLost ? "lost" : "playing";
        const revealedRanks = mergeRevealedRanks(prev.revealedRanks, newRevealed);

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

  const useHint = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "playing") return prev;
      const nextRank = nextHintableRank(prev.revealedRanks);
      if (!nextRank) return prev;
      // Ensure using a hint won't go over the limit
      const newHintsUsed = prev.hintsUsed + 1;
      if (effectiveGuessCount(prev.guesses.length, newHintsUsed) > MAX_GUESSES) return prev;

      const newRevealedRanks = new Set([...prev.revealedRanks, nextRank]);
      const newHintRevealedRanks = new Set([...prev.hintRevealedRanks, nextRank]);

      const effective = effectiveGuessCount(prev.guesses.length, newHintsUsed);
      const isLost = effective >= MAX_GUESSES;
      const status: GameStatus = isLost ? "lost" : "playing";

      if (status === "lost") {
        return {
          ...prev,
          hintsUsed: newHintsUsed,
          hintRevealedRanks: newHintRevealedRanks,
          revealedRanks: new Set(["kingdom", "phylum", "class", "order", "family", "genus", "species"] as Rank[]),
          status,
        };
      }

      return {
        ...prev,
        hintsUsed: newHintsUsed,
        hintRevealedRanks: newHintRevealedRanks,
        revealedRanks: newRevealedRanks,
      };
    });
  }, []);

  const hintDisabled =
    state.status !== "playing" ||
    !nextHintableRank(state.revealedRanks) ||
    effectiveGuessCount(state.guesses.length, state.hintsUsed + 1) > MAX_GUESSES;

  return { state, submitGuess, useHint, hintDisabled, maxGuesses: MAX_GUESSES };
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
