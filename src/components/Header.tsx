import { useState } from "react";

interface Props {
  dayNumber: number;
  guessCount: number;
  maxGuesses: number;
  onHelp: () => void;
  mode: "daily" | "practice";
  onSwitchMode: () => void;
  onReset?: () => void;
}

export function Header({ dayNumber, guessCount, maxGuesses, onHelp, mode, onSwitchMode, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetClick = () => {
    if (!onReset) return;
    if (guessCount === 0) {
      onReset();
    } else if (confirmReset) {
      setConfirmReset(false);
      onReset();
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-spore-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <button
        onClick={onHelp}
        className="w-8 h-8 flex items-center justify-center rounded-full text-spore-500 hover:bg-spore-100 transition-colors text-lg font-bold"
        aria-label="How to play"
      >
        ?
      </button>

      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-spore-900">
          Metafunga
        </h1>
        <p className="text-xs text-spore-500">
          {mode === "practice" ? "Practice" : `#${dayNumber}`} · {guessCount}/{maxGuesses} guesses
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {onReset && mode === "daily" && (
          confirmReset ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetClick}
                className="text-xs px-2 py-1 rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Reset?
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-xs px-1.5 py-1 rounded-lg text-spore-400 hover:bg-spore-100 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={handleResetClick}
              className="w-8 h-8 flex items-center justify-center rounded-full text-spore-400 hover:bg-spore-100 transition-colors text-base"
              title="Reset daily game"
              aria-label="Reset daily game"
            >
              ↺
            </button>
          )
        )}
        <button
          onClick={onSwitchMode}
          className="text-xs px-2 py-1 rounded-lg border border-spore-200 text-spore-500 hover:bg-spore-100 transition-colors"
          title={mode === "daily" ? "Play a practice game" : "Switch to today's game"}
        >
          {mode === "daily" ? "Practice" : "Daily"}
        </button>
      </div>
    </header>
  );
}
