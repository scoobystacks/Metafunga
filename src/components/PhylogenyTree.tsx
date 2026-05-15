import { useState } from "react";
import type { Fungus, Guess, Rank } from "../types";
import { RANKS } from "../types";
import { deepestRevealedRank, wikipediaUrl, computeGuessClusters, rankLabel } from "../utils/phylogeny";
import type { GuessCluster } from "../utils/phylogeny";
import { WikipediaPreview } from "./WikipediaPreview";
import { FUNGI_MAP } from "../data/fungi";

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

const INDENT = 10; // px indent per rank level

export function PhylogenyTree({ target, revealedRanks, hintRevealedRanks, guesses, showAll = false }: Props) {
  const [expandedRank, setExpandedRank] = useState<Rank | null>(null);

  const effectiveRevealed = showAll ? new Set(RANKS) : revealedRanks;
  const deepest = deepestRevealedRank(effectiveRevealed);
  const deepestIndex = RANKS.indexOf(deepest);

  // Compute dead-end cluster branches for wrong guesses
  const clusters = computeGuessClusters(guesses, target, FUNGI_MAP);
  const clusteredIds = new Set(clusters.flatMap((c) => c.guessFungusIds));

  // Map rank → non-clustered guesses whose deepest match is exactly that rank
  const guessesByRank = new Map<Rank | "none", Guess[]>();
  guessesByRank.set("none", []);
  for (const rank of RANKS) guessesByRank.set(rank, []);
  for (const guess of guesses) {
    if (clusteredIds.has(guess.fungusId)) continue;
    guessesByRank.get(guess.deepestMatchRank ?? "none")!.push(guess);
  }

  // Map attachRank → clusters
  const clustersByAttachRank = new Map<Rank, GuessCluster[]>();
  for (const cluster of clusters) {
    if (!clustersByAttachRank.has(cluster.attachRank)) {
      clustersByAttachRank.set(cluster.attachRank, []);
    }
    clustersByAttachRank.get(cluster.attachRank)!.push(cluster);
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
        const clustersHere = clustersByAttachRank.get(rank) ?? [];

        return (
          <div key={rank}>
            {/* L-connector: vertical at parent's x, horizontal kick to child's x */}
            {renderIndex > 0 && (
              <div
                className="border-l-2 border-b-2 border-spore-200"
                style={{
                  marginLeft: (rankIndex - 1) * INDENT,
                  width: INDENT,
                  height: 20,
                }}
              />
            )}

            {/* Node row */}
            <div className="flex items-start gap-1.5" style={{ marginLeft: indentPx }}>
              {/* Main node */}
              {isRevealed ? (
                <button
                  onClick={() => setExpandedRank(isExpanded ? null : rank)}
                  className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none w-fit min-w-[90px] text-left ${
                    isDeepest
                      ? "bg-amber-200 border-amber-400 text-amber-900 ring-1 ring-amber-400 ring-offset-1"
                      : "bg-amber-100 border-amber-300 text-amber-900"
                  } hover:brightness-95`}
                >
                  <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500 leading-none mb-0.5">
                    {rankLabel(rank)}{isHintRevealed ? " 💡" : ""}
                  </span>
                  <span className="text-[10px] font-bold leading-tight italic">
                    {value}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-start px-2.5 py-1.5 rounded-xl border border-spore-200 bg-spore-100 w-fit min-w-[90px]">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-spore-400 leading-none mb-0.5">
                    {rankLabel(rank)}
                  </span>
                  <span className="text-sm font-bold text-spore-300">???</span>
                </div>
              )}

              {/* Side branches: individual guesses + dead-end clusters, stacked vertically */}
              {(guessesHere.length > 0 || (isRevealed && clustersHere.length > 0)) && (
                <div className="flex flex-col gap-2 pt-1">
                  {/* Non-clustered guess bubbles */}
                  {guessesHere.length > 0 && (
                    <div className="flex items-start gap-1">
                      <div className="w-3 h-px bg-spore-200 flex-shrink-0 mt-[14px]" />
                      <div className="flex flex-col gap-1">
                        {guessesHere.map((guess) => (
                          <GuessBubble key={guess.fungusId} guess={guess} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dead-end cluster branches */}
                  {isRevealed && clustersHere.map((cluster) => (
                    <div key={`${cluster.rank}:${cluster.value}`} className="flex items-start gap-1">
                      <div className="w-3 h-px bg-stone-300 flex-shrink-0 mt-[14px]" />
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-col items-start px-2 py-1 rounded-lg border border-dashed border-stone-400 bg-stone-100 text-stone-700 w-fit min-w-[80px]">
                          <span className="text-[7px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5">
                            {rankLabel(cluster.rank)}
                          </span>
                          <span className="text-[9px] font-semibold italic leading-tight">
                            {cluster.value}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 ml-1">
                          {cluster.guessFungusIds.map((id) => {
                            const g = guesses.find((gg) => gg.fungusId === id);
                            return g ? <GuessBubble key={id} guess={g} /> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
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

  return (
    <div
      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-lg border leading-tight whitespace-nowrap ${colorClass}`}
      title={`${guess.commonName} (${guess.scientificName})`}
    >
      {guess.commonName}
    </div>
  );
}
