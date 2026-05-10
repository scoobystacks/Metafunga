interface Props {
  dayNumber: number;
  guessCount: number;
  maxGuesses: number;
  onHelp: () => void;
  mode: "daily" | "practice";
  onSwitchMode: () => void;
}

export function Header({ dayNumber, guessCount, maxGuesses, onHelp, mode, onSwitchMode }: Props) {
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

      <button
        onClick={onSwitchMode}
        className="text-xs px-2 py-1 rounded-lg border border-spore-200 text-spore-500 hover:bg-spore-100 transition-colors"
        title={mode === "daily" ? "Play a practice game" : "Switch to today's game"}
      >
        {mode === "daily" ? "Practice" : "Daily"}
      </button>
    </header>
  );
}
