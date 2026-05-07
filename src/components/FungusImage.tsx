import type { Fungus } from "../types";

interface Props {
  fungus: Fungus;
  guessCount: number;
  revealed: boolean;
}

const MAX_BLUR = 20;
const MAX_GUESSES = 20;

export function FungusImage({ fungus, guessCount, revealed }: Props) {
  const blur = revealed
    ? 0
    : Math.max(0, MAX_BLUR - (guessCount / MAX_GUESSES) * MAX_BLUR);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-spore-100 shadow-md">
      <img
        src={fungus.imageUrl}
        alt={revealed ? fungus.commonName : "Mystery fungus"}
        className="w-full h-full object-cover blur-reveal"
        style={{ filter: `blur(${blur}px) saturate(${revealed ? 1 : 0.6})` }}
        loading="eager"
      />
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl select-none opacity-40">🍄</span>
        </div>
      )}
      {revealed && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-white text-xs truncate">{fungus.imageAttribution}</p>
        </div>
      )}
    </div>
  );
}
