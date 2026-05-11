import { useCallback, useMemo, useState } from "react";
import { useDailyFungus } from "./hooks/useDailyFungus";
import { GameBoard } from "./components/GameBoard";
import { HowToPlay } from "./components/HowToPlay";
import { clearOldKeys } from "./utils/storage";
import { ACTIVE_FUNGI, FUNGI } from "./data/fungi";
import type { Difficulty } from "./types";

clearOldKeys();

type PracticeDifficulty = Difficulty | "any";

function pickPracticeFungus(
  excludeId: string,
  difficulty: PracticeDifficulty
): { fungus: typeof FUNGI[0]; seed: number } {
  // "insane" draws from the full 136-entry database; other tiers use the active top-50.
  const base = difficulty === "insane" ? FUNGI : ACTIVE_FUNGI;
  const pool = base.filter(
    (f) => f.id !== excludeId && (difficulty === "any" || f.difficulty === difficulty)
  );
  const candidates = pool.length > 0 ? pool : base.filter((f) => f.id !== excludeId);
  const seed = Date.now();
  const s = (seed * 1664525 + 1013904223) & 0xffffffff;
  const idx = Math.abs(s) % candidates.length;
  return { fungus: candidates[idx], seed };
}

const DIFFICULTY_OPTS: { value: PracticeDifficulty; label: string; desc: string }[] = [
  { value: "easy",   label: "Easy",   desc: "Famous & common fungi" },
  { value: "medium", label: "Medium", desc: "Moderately well-known" },
  { value: "hard",   label: "Hard",   desc: "Obscure specialists" },
  { value: "insane", label: "Insane", desc: "Full database — expert only" },
  { value: "any",    label: "Any",    desc: "Random from active set" },
];

export default function App() {
  const { fungus: dailyFungus, dayNumber } = useDailyFungus();
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [showHelp, setShowHelp] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);

  const [practiceState, setPracticeState] = useState<{
    fungus: typeof FUNGI[0];
    seed: number;
  } | null>(null);

  const startPractice = useCallback(
    (difficulty: PracticeDifficulty) => {
      setPracticeState(pickPracticeFungus(dailyFungus.id, difficulty));
      setMode("practice");
      setShowDifficultyPicker(false);
    },
    [dailyFungus.id]
  );

  const handleSwitchMode = useCallback(() => {
    if (mode === "daily") {
      setShowDifficultyPicker(true);
    } else {
      setMode("daily");
      setShowDifficultyPicker(false);
    }
  }, [mode]);

  const target = mode === "practice" && practiceState
    ? practiceState.fungus
    : dailyFungus;

  const effectiveDayNumber = useMemo(() => {
    if (mode === "practice" && practiceState) {
      return Math.abs(practiceState.seed % 10000);
    }
    return dayNumber;
  }, [mode, practiceState, dayNumber]);

  return (
    <div className="min-h-screen bg-spore-50 flex flex-col">
      <GameBoard
        key={mode === "practice" ? practiceState?.seed ?? "practice" : "daily"}
        target={target}
        dayNumber={effectiveDayNumber}
        mode={mode}
        onHelp={() => setShowHelp(true)}
        onSwitchMode={handleSwitchMode}
      />
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}

      {/* Difficulty picker overlay */}
      {showDifficultyPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          onClick={() => setShowDifficultyPicker(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-spore-200" />
            </div>
            <div>
              <p className="font-bold text-spore-900 text-lg">Choose difficulty</p>
              <p className="text-spore-500 text-sm">Pick a practice game tier</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTY_OPTS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => startPractice(value)}
                  className={`flex flex-col items-start gap-0.5 p-3 rounded-xl border transition-colors text-left ${
                    value === "insane"
                      ? "border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                      : "border-spore-200 hover:border-myco-400 hover:bg-myco-50"
                  }`}
                >
                  <span className={`font-semibold text-sm ${value === "insane" ? "text-purple-900" : "text-spore-900"}`}>
                    {label}
                  </span>
                  <span className="text-xs text-spore-500">{desc}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDifficultyPicker(false)}
              className="w-full py-2.5 rounded-xl border border-spore-200 text-spore-600 text-sm hover:bg-spore-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
