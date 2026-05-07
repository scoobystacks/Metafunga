import { useState } from "react";
import type { Fungus } from "../types";
import { useGame } from "../hooks/useGame";
import { FungusImage } from "./FungusImage";
import { PhylogenyTree } from "./PhylogenyTree";
import { GuessInput } from "./GuessInput";
import { GuessList } from "./GuessList";
import { ResultModal } from "./ResultModal";
import { Header } from "./Header";

interface Props {
  target: Fungus;
  dayNumber: number;
  onHelp: () => void;
}

export function GameBoard({ target, dayNumber, onHelp }: Props) {
  const { state, submitGuess, maxGuesses } = useGame(target, dayNumber);
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

  return (
    <>
      <Header
        dayNumber={dayNumber}
        guessCount={state.guesses.length}
        maxGuesses={maxGuesses}
        onHelp={onHelp}
      />

      <main className="flex flex-col items-center gap-5 px-4 py-5 pb-28 sm:pb-8 max-w-md mx-auto w-full">
        {/* Image */}
        <FungusImage
          fungus={target}
          guessCount={state.guesses.length}
          revealed={gameOver}
        />

        {/* Phylogeny tree */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-spore-100 p-4">
          <p className="text-xs font-semibold text-spore-400 uppercase tracking-wide mb-3">
            Phylogeny Tree
          </p>
          <PhylogenyTree target={target} revealedRanks={state.revealedRanks} />
        </div>

        {/* Guess history */}
        <GuessList guesses={state.guesses} targetId={target.id} />
      </main>

      {/* Guess input — fixed at bottom on mobile, inline on desktop */}
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
        />
      )}
    </>
  );
}
