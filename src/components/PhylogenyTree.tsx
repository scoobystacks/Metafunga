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

// Colour scale: deeper match = warmer/greener
const MATCH_COLORS: Record<number, string> = {
  0: "bg-stone-100 text-stone-600 border-stone-200",
  1: "bg-amber-100 text-amber-800 border-amber-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-lime-100 text-lime-800 border-lime-200",
  4: "bg-green-100 text-green-800 border-green-200",
  5: "bg-teal-100 text-teal-800 border-teal-200",
  6: "bg-myco-100 text-myco-800 border-myco-200",
};

const INDENT = 14; // px indent per rank level

export function PhylogenyTree({ target, revealedRanks, hintRevealedRanks, guesses, showAll = false }: Props) {
  const [expandedRank, setExpandedRank] = useState<Rank | null>(null);

  const effectiveRevealed = showAll ? new Set(RANKS) : revealedRanks;
  const deepest = deepestRevealedRank(effectiveRevealed);
  const deepestIndex = RANKS.indexOf(deepest);

  // Map rank → guesses whose deepest match is exactly that rank
  const guessesByRank = new Map<Rank | "none", Guess[]>();
  guessesByRank.set("none", []);
  for (const rank of RANKS) guessesByRank.set(rank, []);
  for (const guess of guesses) {
    guessesByRank.get(guess.deepestMatchRank ?? "none")!.push(guess);
  }

  // Revealed ranks + the single next-unrevealed rank (shows "???")
  const ranksToRender = RANKS.filter((rank, index) => {
    if (effectiveRevealed.has(rank)) return true;
    if (index === deepestIndex + 1) return true;
    return false;
  });

  return (
    <div className="w-full py-1 overflow-x-hidden">
      {ranksToRender.map((rank, renderIndex) => {
        const rankIndex = RANKS.indexOf(rank);
        const isRevealed = effectiveRevealed.has(rank);
        const isHintRevealed = hintRevealedRanks.has(rank) && !showAll;
        const value = isRevealed ? target.taxonomy[rank] : null;
        const guessesHere = guessesByRank.get(rank) ?? [];
        const isDeepest = rank === deepest && isRevealed;
        const isExpanded = expandedRank === rank;
        const indentPx = rankIndex * INDENT;

        return (
          <div key={rank}>
            {/* L-shaped connector from parent above */}
            {renderIndex > 0 && (
              <div
                className="flex items-stretch"
                style={{ marginLeft: (rankIndex - 1) * INDENT, height: 14 }}
              >
                {/* vertical portion of the L */}
                <div className="border-l-2 border-spore-200" style={{ width: 10 }} />
                {/* horizontal elbow of the L */}
                <div className="border-b-2 border-spore-200 self-end" style={{ width: INDENT }} />
              </div>
            )}

            {/* Node row */}
            <div className="flex items-start gap-1.5" style={{ marginLeft: indentPx }}>
              {/* Main node */}
              {isRevealed ? (
                <button
                  onClick={() => setExpandedRank(isExpanded ? null : rank)}
                  className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none flex-shrink-0 min-w-[108px] max-w-[140px] text-left ${
                    isDeepest
                      ? "bg-amber-200 border-amber-400 text-amber-900 ring-1 ring-amber-400 ring-offset-1"
                      : "bg-amber-100 border-amber-300 text-amber-900"
                  } hover:brightness-95`}
                >
                  <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500 leading-none mb-0.5">
                    {rankLabel(rank)}{isHintRevealed ? " 💡" : ""}
                  </span>
                  <span className="text-[11px] font-bold leading-tight italic">
                    {value}
                  </span>
                  <span className="text-[8px] text-amber-400 mt-0.5 leading-none">tap to learn ↗</span>
                </button>
              ) : (
                <div className="flex flex-col items-start px-2.5 py-1.5 rounded-xl border border-spore-200 bg-spore-100 flex-shrink-0 min-w-[108px]">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-spore-400 leading-none mb-0.5">
                    {rankLabel(rank)}
                  </span>
                  <span className="text-sm font-bold text-spore-300">???</span>
                </div>
              )}

              {/* Guesses branching right */}
              {guessesHere.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  <div className="w-3 h-px bg-spore-200 flex-shrink-0 mt-3" />
                  <div className="flex flex-wrap gap-1">
                    {guessesHere.map((guess) => (
                      <GuessBubble key={guess.fungusId} guess={guess} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wikipedia inline preview */}
            {isRevealed && isExpanded && value && (
              <div className="mt-1.5 mb-1" style={{ marginLeft: indentPx }}>
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
