import type { Fungus, Rank } from "../types";
import { FUNGI } from "../data/fungi";
import { deepestRevealedRank } from "../utils/phylogeny";

interface Props {
  target: Fungus;
  revealedRanks: Set<Rank>;
  dayNumber: number;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function CladePreviews({ target, revealedRanks, dayNumber }: Props) {
  const deepest = deepestRevealedRank(revealedRanks);
  if (deepest === "kingdom") return null;

  const cladeFungi = FUNGI.filter(
    (f) => f.id !== target.id && f.taxonomy[deepest] === target.taxonomy[deepest]
  );

  if (cladeFungi.length === 0) return null;

  const shuffled = seededShuffle(cladeFungi, dayNumber);
  const previews = shuffled.slice(0, 6);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-spore-100 p-4">
      <p className="text-xs font-semibold text-spore-400 uppercase tracking-wide mb-2">
        Others in this {deepest}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {previews.map((f) => (
          <div key={f.id} className="relative group aspect-square rounded-lg overflow-hidden bg-spore-100 flex items-center justify-center">
            <img
              src={f.imageUrl}
              alt={f.commonName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            {/* Always-visible label at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1 py-1">
              <span className="text-white text-[9px] font-medium text-center leading-tight line-clamp-2 block">
                {f.commonName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
