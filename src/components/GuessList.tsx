import type { Guess } from "../types";
import { matchDepth, matchDescription } from "../utils/phylogeny";

interface Props {
  guesses: Guess[];
  targetId: string;
}

const DEPTH_COLORS: Record<number, string> = {
  0: "bg-stone-100 text-stone-600",
  1: "bg-amber-100 text-amber-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-lime-100 text-lime-800",
  4: "bg-green-100 text-green-800",
  5: "bg-teal-100 text-teal-800",
  6: "bg-myco-100 text-myco-800",
};

export function GuessList({ guesses, targetId }: Props) {
  if (guesses.length === 0) return null;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-1.5">
      {[...guesses].reverse().map((guess, i) => {
        const isCorrect = guess.fungusId === targetId;
        const depth = matchDepth(guess.deepestMatchRank);
        const colorClass = isCorrect
          ? "bg-myco-500 text-white"
          : DEPTH_COLORS[depth] ?? DEPTH_COLORS[0];

        return (
          <div
            key={`${guess.fungusId}-${i}`}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${colorClass}`}
          >
            <div>
              <span className="font-medium">{guess.commonName}</span>
              <span className="ml-2 italic text-xs opacity-75">
                {guess.scientificName}
              </span>
            </div>
            <span className="ml-2 flex-shrink-0 text-xs font-semibold">
              {isCorrect ? "✓ Correct!" : matchDescription(guess.deepestMatchRank)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
