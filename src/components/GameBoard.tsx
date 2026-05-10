import { useState } from "react";
import type { Difficulty, Fungus } from "../types";

const DIFFICULTY_CLS: Record<Difficulty, string> = {
  easy:   "bg-myco-100 text-myco-800 border-myco-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  hard:   "bg-red-100 text-red-800 border-red-200",
  insane: "bg-purple-100 text-purple-900 border-purple-300",
};

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${DIFFICULTY_CLS[difficulty]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}
import { useGame } from "../hooks/useGame";
import { FungusImage } from "./FungusImage";
import { PhylogenyTree } from "./PhylogenyTree";
import { GuessInput } from "./GuessInput";
import { GuessList } from "./GuessList";
import { ResultModal } from "./ResultModal";
import { Header } from "./Header";
import { CladePreviews } from "./CladePreviews";

interface Props {
  target: Fungus;
  dayNumber: number;
  mode: "daily" | "practice";
  onHelp: () => void;
  onSwitchMode: () => void;
}

export function GameBoard({ target, dayNumber, mode, onHelp, onSwitchMode }: Props) {
  // Practice games are ephemeral (storageKey = ""), daily uses localStorage
  const storageKey = mode === "practice" ? "" : undefined;
  const { state, submitGuess, useHint, hintDisabled, maxGuesses } = useGame(target, dayNumber, storageKey);
  const [showResult, setShowResult] = useState(
    () => state.status !== "playing"
  );

  const gameOver = state.status !== "playing";
  const usedIds = new Set(state.guesses.map((g) => g.fungusId));

  const handleGuess = (id: string) => {
    submitGuess(id);
    if (state.guesses.length + 1 >= maxGuesses || id === target.id) {
      setTimeout(() => setShowResult(true), 600);
    }
  };

  const effectiveGuessCount = state.guesses.length + state.hintsUsed * 3;

  return (
    <>
      <Header
        dayNumber={dayNumber}
        guessCount={effectiveGuessCount}
        maxGuesses={maxGuesses}
        onHelp={onHelp}
        mode={mode}
        onSwitchMode={onSwitchMode}
      />

      <main className="flex flex-col items-center gap-5 px-4 py-5 pb-40 sm:pb-8 max-w-md mx-auto w-full">
        {mode === "practice" && (
          <div className="w-full text-center text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl py-1.5 px-3 font-medium">
            Practice mode — results won't be saved
          </div>
        )}

        {/* Rarity / fame / difficulty info */}
        <div className="flex gap-2 flex-wrap justify-center">
          <DifficultyBadge difficulty={target.difficulty} />
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-spore-100 text-spore-700">
            Rarity {target.rarity}/100
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-spore-100 text-spore-700">
            Fame {target.fame}/100
          </span>
        </div>

        {/* Image */}
        <FungusImage
          fungus={target}
          guessCount={state.guesses.length}
          revealed={gameOver}
        />

        {/* Phylogeny tree node-graph */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-spore-100 p-4">
          <p className="text-xs font-semibold text-spore-400 uppercase tracking-wide mb-1">
            Phylogeny Tree
          </p>
          <PhylogenyTree
            target={target}
            revealedRanks={state.revealedRanks}
            hintRevealedRanks={state.hintRevealedRanks}
            guesses={state.guesses}
          />

          {/* Hint section */}
          {!gameOver && (
            <div className="mt-3 pt-3 border-t border-spore-100 flex items-center justify-between gap-3">
              <p className="text-xs text-spore-500 flex-1">
                Need a hint? Exchange 3 guesses to reveal a rank!
              </p>
              <button
                onClick={useHint}
                disabled={hintDisabled}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Hint 💡
              </button>
            </div>
          )}
        </div>

        {/* Clade previews */}
        {!gameOver && (
          <div className="w-full bg-white rounded-2xl shadow-sm border border-spore-100 p-4">
            <CladePreviews
              target={target}
              revealedRanks={state.revealedRanks}
              dayNumber={dayNumber}
            />
          </div>
        )}

        {/* Guess history */}
        <GuessList guesses={state.guesses} targetId={target.id} />
      </main>

      {/* Guess input — fixed at bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-spore-100 px-4 py-3 z-30 sm:relative sm:border-0 sm:bg-transparent sm:pb-6 sm:max-w-md sm:mx-auto sm:w-full">
        <GuessInput
          onGuess={handleGuess}
          usedIds={usedIds}
          disabled={gameOver}
        />
        {gameOver && !showResult && (
          <button
            onClick={() => setShowResult(true)}
            className="mt-2 w-full bg-myco-500 hover:bg-myco-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            See results →
          </button>
        )}
      </div>

      {showResult && (
        <ResultModal
          target={target}
          status={state.status}
          guesses={state.guesses}
          dayNumber={dayNumber}
          onClose={() => setShowResult(false)}
          mode={mode}
          onPlayPractice={mode === "daily" ? onSwitchMode : undefined}
        />
      )}

      <p className="text-center text-[10px] text-spore-400/50 py-3 pb-44 sm:pb-4 select-none">
        Version {__BUILD_HASH__} · updated {__BUILD_DATE__}
      </p>
    </>
  );
}
