import { useCallback } from "react";
import type { Fungus, GameStatus, Guess } from "../types";
import { PhylogenyTree } from "./PhylogenyTree";
import { RANKS } from "../types";
import { matchDepth } from "../utils/phylogeny";

interface Props {
  target: Fungus;
  status: GameStatus;
  guesses: Guess[];
  dayNumber: number;
  onClose: () => void;
}

const EDIBILITY_BADGE: Record<string, { label: string; cls: string }> = {
  choice: { label: "Choice Edible", cls: "bg-myco-500 text-white" },
  edible: { label: "Edible", cls: "bg-myco-300 text-myco-900" },
  inedible: { label: "Inedible", cls: "bg-spore-200 text-spore-700" },
  toxic: { label: "Toxic", cls: "bg-orange-400 text-white" },
  deadly: { label: "Deadly Toxic", cls: "bg-red-600 text-white" },
  psychoactive: { label: "Psychoactive", cls: "bg-purple-500 text-white" },
};

const ECOLOGY_ICON: Record<string, string> = {
  mycorrhizal: "🌲",
  saprotrophic: "🍂",
  parasitic: "⚠️",
};

function buildShareText(
  guesses: Guess[],
  targetId: string,
  dayNumber: number,
  status: GameStatus
): string {
  const EMOJIS: Record<number, string> = {
    0: "⬜",
    1: "🟫",
    2: "🟡",
    3: "🟡",
    4: "🟢",
    5: "🟢",
    6: "✅",
  };

  const rows = guesses.map((g) => {
    const isCorrect = g.fungusId === targetId;
    if (isCorrect) return RANKS.map(() => "🟩").join("");
    const depth = matchDepth(g.deepestMatchRank);
    return RANKS.map((_, i) => (i <= depth ? EMOJIS[depth] : "⬜")).join("");
  });

  const outcome = status === "won" ? `${guesses.length}/20` : "X/20";
  return [`Metafunga #${dayNumber} ${outcome}`, ...rows].join("\n");
}

export function ResultModal({ target, status, guesses, dayNumber, onClose }: Props) {
  const edibility = EDIBILITY_BADGE[target.edibility] ?? EDIBILITY_BADGE.inedible;
  const shareText = buildShareText(guesses, target.id, dayNumber, status);
  const allRanks = new Set(RANKS);

  const copyShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // fallback: show alert
      window.prompt("Copy this:", shareText);
    }
  }, [shareText]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar for mobile sheet */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-spore-200" />
        </div>

        <div className="p-5 space-y-4">
          {/* Outcome banner */}
          <div className="text-center">
            <p className="text-2xl font-bold">
              {status === "won" ? "🎉 Well done!" : "😔 Better luck tomorrow"}
            </p>
            <p className="text-spore-500 text-sm mt-0.5">
              {status === "won"
                ? `Found in ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}!`
                : "The fungus was:"}
            </p>
          </div>

          {/* Fungus name & image */}
          <div className="text-center">
            <img
              src={target.imageUrl}
              alt={target.commonName}
              className="w-40 h-40 object-cover rounded-xl mx-auto shadow-md mb-3"
            />
            <p className="text-xl font-bold text-spore-900">{target.commonName}</p>
            <p className="italic text-spore-600 text-sm">{target.scientificName}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${edibility.cls}`}>
              {edibility.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-spore-100 text-spore-700">
              {ECOLOGY_ICON[target.ecology]} {target.ecology.charAt(0).toUpperCase() + target.ecology.slice(1)}
            </span>
          </div>

          {/* Full taxonomy tree */}
          <div className="bg-spore-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-spore-500 mb-2 uppercase tracking-wide">Phylogeny</p>
            <PhylogenyTree target={target} revealedRanks={allRanks} showAll />
          </div>

          {/* Habitat & range */}
          <div className="space-y-2 text-sm text-spore-700">
            <p><span className="font-semibold text-spore-900">Habitat:</span> {target.habitat}</p>
            <p><span className="font-semibold text-spore-900">North American range:</span> {target.naRange}</p>
          </div>

          {/* Morphology */}
          <div className="bg-spore-50 rounded-xl p-4 text-sm text-spore-700 space-y-1">
            <p className="text-xs font-semibold text-spore-500 uppercase tracking-wide mb-2">Morphology</p>
            <p><span className="font-semibold text-spore-900">Cap:</span> {target.morphology.capShape}</p>
            <p><span className="font-semibold text-spore-900">Gills/surface:</span> {target.morphology.gillAttachment}</p>
            <p><span className="font-semibold text-spore-900">Spore print:</span> {target.morphology.sporeColor}</p>
            <div className="flex gap-3 mt-1">
              {target.morphology.hasRing && (
                <span className="text-xs bg-spore-200 text-spore-700 px-2 py-0.5 rounded-full">Has ring</span>
              )}
              {target.morphology.hasVolva && (
                <span className="text-xs bg-spore-200 text-spore-700 px-2 py-0.5 rounded-full">Has volva</span>
              )}
            </div>
          </div>

          {/* Fun fact */}
          <div className="bg-myco-50 border border-myco-200 rounded-xl p-4 text-sm text-myco-800">
            <p className="text-xs font-semibold text-myco-600 uppercase tracking-wide mb-1">Did you know?</p>
            <p>{target.funFact}</p>
          </div>

          {/* Share + close */}
          <div className="flex gap-3">
            <button
              onClick={copyShare}
              className="flex-1 bg-myco-500 hover:bg-myco-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Copy results 📋
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-spore-200 text-spore-600 hover:bg-spore-50 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>

          {/* Image attribution */}
          <p className="text-center text-xs text-spore-400">{target.imageAttribution}</p>
        </div>
      </div>
    </div>
  );
}
