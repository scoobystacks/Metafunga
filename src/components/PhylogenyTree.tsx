import { useState } from "react";
import type { Fungus, Guess, Rank } from "../types";
import { RANKS } from "../types";
import { deepestRevealedRank, wikipediaUrl } from "../utils/phylogeny";
import { WikipediaPreview } from "./WikipediaPreview";

function rankLabel(rank: Rank): string {
  const labels: Record<Rank, string> = {
    kingdom: "Kingdom", phylum: "Phylum", class: "Class",
    order: "Order", family: "Family", genus: "Genus", species: "Species",
  };
  return labels[rank];
}

interface Props {
  target: Fungus;
  revealedRanks: Set<Rank>;
  hintRevealedRanks: Set<Rank>;
  guesses: Guess[];
  showAll?: boolean;
}

const MATCH_COLORS: Record<number, string> = {
  0: "bg-stone-100 text-stone-600 border-stone-200",
  1: "bg-amber-100 text-amber-800 border-amber-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-lime-100 text-lime-800 border-lime-200",
  4: "bg-green-100 text-green-800 border-green-200",
  5: "bg-teal-100 text-teal-800 border-teal-200",
  6: "bg-myco-100 text-myco-800 border-myco-200",
};

export function PhylogenyTree({ target, revealedRanks, hintRevealedRanks, guesses, showAll = false }: Props) {
  const [expandedRank, setExpandedRank] = useState<Rank | null>(null);

  const effectiveRevealed = showAll ? new Set(RANKS) : revealedRanks;
  const deepest = deepestRevealedRank(effectiveRevealed);
  const deepestIndex = RANKS.indexOf(deepest);

  // Map rank -> guesses that deepest-matched at exactly that rank
  const guessesByRank = new Map<Rank | "none", Guess[]>();
  guessesByRank.set("none", []);
  for (const rank of RANKS) guessesByRank.set(rank, []);
  for (const guess of guesses) {
    const key = guess.deepestMatchRank ?? "none";
    guessesByRank.get(key)!.push(guess);
  }

  // Ranks to render: all revealed + first unrevealed
  const ranksToRender = RANKS.filter((rank, index) => {
    if (effectiveRevealed.has(rank)) return true;
    if (index === deepestIndex + 1) return true;
    return false;
  });

  return (
    <div className="w-full flex flex-col items-center gap-0 py-2">
      {ranksToRender.map((rank, renderIndex) => {
        const isRevealed = effectiveRevealed.has(rank);
        const isHintRevealed = hintRevealedRanks.has(rank) && !showAll;
        const value = isRevealed ? target.taxonomy[rank] : null;
        const guessesHere = guessesByRank.get(rank) ?? [];
        const isDeepest = rank === deepest && isRevealed;
        const isExpanded = expandedRank === rank;
        const leftGuesses = guessesHere.filter((_, i) => i % 2 === 0);
        const rightGuesses = guessesHere.filter((_, i) => i % 2 === 1);

        return (
          <div key={rank} className="w-full flex flex-col items-center">
            {/* Vertical connector from above */}
            {renderIndex > 0 && (
              <div className="w-0.5 h-4 bg-spore-200 flex-shrink-0" />
            )}

            <div className="w-full flex items-center justify-center gap-0">
              {/* Left branch */}
              <div className="flex-1 flex justify-end items-center min-h-[40px]">
                {leftGuesses.length > 0 && (
                  <>
                    <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
                      {leftGuesses.map((guess) => (
                        <GuessBubble key={guess.fungusId} guess={guess} />
                      ))}
                    </div>
                    <div className="w-4 h-0.5 bg-spore-200 flex-shrink-0" />
                  </>
                )}
              </div>

              {/* Center node */}
              <div className="flex flex-col items-center flex-shrink-0 w-36">
                {isRevealed ? (
                  <button
                    onClick={() => setExpandedRank(isExpanded ? null : rank)}
                    className={`w-full flex flex-col items-center px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isHintRevealed
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-amber-100 border-amber-300 text-amber-900"
                    } ${isDeepest ? "ring-2 ring-myco-400 ring-offset-1" : ""} hover:brightness-95`}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-600 opacity-75 leading-none mb-0.5">
                      {rankLabel(rank)}{isHintRevealed ? " 💡" : ""}
                    </span>
                    <span className="text-xs font-bold leading-tight text-center break-words">
                      {value}
                    </span>
                    <span className="text-[9px] text-amber-500 mt-0.5 leading-none">tap to learn more</span>
                  </button>
                ) : (
                  <div className="w-full flex flex-col items-center px-3 py-1.5 rounded-xl border border-spore-200 bg-spore-100">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-spore-400 opacity-75 leading-none mb-0.5">
                      {rankLabel(rank)}
                    </span>
                    <span className="text-sm font-bold text-spore-300">???</span>
                  </div>
                )}
              </div>

              {/* Right branch */}
              <div className="flex-1 flex justify-start items-center min-h-[40px]">
                {rightGuesses.length > 0 && (
                  <>
                    <div className="w-4 h-0.5 bg-spore-200 flex-shrink-0" />
                    <div className="flex flex-wrap justify-start gap-1 max-w-[120px]">
                      {rightGuesses.map((guess) => (
                        <GuessBubble key={guess.fungusId} guess={guess} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Wikipedia inline preview (expanded) */}
            {isRevealed && isExpanded && value && (
              <div className="w-full max-w-xs mt-2 mb-1 px-2">
                <a
                  href={wikipediaUrl(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-myco-600 hover:underline font-semibold block mb-1"
                >
                  Wikipedia: {value} ↗
                </a>
                <WikipediaPreview title={value} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GuessBubble({ guess }: { guess: Guess }) {
  const depth = guess.deepestMatchRank === null ? 0 : RANKS.indexOf(guess.deepestMatchRank);
  const colorClass = MATCH_COLORS[depth] ?? MATCH_COLORS[0];
  const name = guess.commonName;
  const display = name.length > 11 ? name.slice(0, 10) + "…" : name;

  return (
    <div
      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-lg border text-center leading-tight whitespace-nowrap ${colorClass}`}
      title={`${guess.commonName} (${guess.scientificName})`}
    >
      {display}
    </div>
  );
}
