import type { Fungus, Rank } from "../types";
import { RANKS, } from "../types";
import { rankLabel } from "../utils/phylogeny";

interface Props {
  target: Fungus;
  revealedRanks: Set<Rank>;
  showAll?: boolean;
}

const RANK_COLORS: Record<Rank, string> = {
  kingdom: "bg-stone-400",
  phylum: "bg-amber-600",
  class: "bg-yellow-600",
  order: "bg-lime-600",
  family: "bg-green-600",
  genus: "bg-teal-600",
  species: "bg-myco-600",
};

export function PhylogenyTree({ target, revealedRanks, showAll }: Props) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {RANKS.map((rank, i) => {
        const revealed = showAll || revealedRanks.has(rank);
        const value = target.taxonomy[rank];
        const indent = i * 8;

        return (
          <div
            key={rank}
            className="flex items-center gap-2 py-1"
            style={{ paddingLeft: `${indent}px` }}
          >
            {/* connector line */}
            {i > 0 && (
              <span className="text-spore-300 text-xs select-none">└</span>
            )}
            {/* dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-500 ${
                revealed ? RANK_COLORS[rank] : "bg-spore-200"
              }`}
            />
            <span className="text-xs text-spore-500 w-16 flex-shrink-0">
              {rankLabel(rank)}
            </span>
            <span
              className={`text-sm font-medium transition-all duration-500 ${
                revealed ? "text-spore-900 italic" : "text-spore-200"
              }`}
            >
              {revealed ? value : "———"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
