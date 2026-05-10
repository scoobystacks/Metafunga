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
    <div className="w-full">
      <p className="text-xs font-semibold text-spore-400 uppercase tracking-wide mb-2">
        Others in this {deepest}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {previews.map((f) => (
          <div key={f.id} className="relative group aspect-square rounded-lg overflow-hidden bg-spore-100">
            <img
              src={f.imageUrl}
              alt={f.commonName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-[10px] font-semibold text-center p-1 leading-tight">
                {f.commonName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
