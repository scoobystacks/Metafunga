export type Rank = "kingdom" | "phylum" | "class" | "order" | "family" | "genus" | "species";

export const RANKS: Rank[] = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];

export interface Taxonomy {
  kingdom: "Fungi";
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface Morphology {
  capShape: string;
  gillAttachment: string;
  sporeColor: string;
  hasRing: boolean;
  hasVolva: boolean;
}

export type Edibility = "choice" | "edible" | "inedible" | "toxic" | "deadly" | "psychoactive";
export type Ecology = "mycorrhizal" | "saprotrophic" | "parasitic";

export interface Fungus {
  id: string;
  scientificName: string;
  commonName: string;
  taxonomy: Taxonomy;
  edibility: Edibility;
  ecology: Ecology;
  habitat: string;
  naRange: string;
  morphology: Morphology;
  imageUrl: string;
  imageAttribution: string;
  gbifId: number;
  funFact: string;
}

export interface Guess {
  fungusId: string;
  scientificName: string;
  commonName: string;
  deepestMatchRank: Rank | null;
}

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  targetId: string;
  guesses: Guess[];
  revealedRanks: Set<Rank>;
  status: GameStatus;
  dayNumber: number;
}
