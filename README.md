# Metafunga

**🍄 Play now: [scoobystacks.github.io/Metafunga](https://scoobystacks.github.io/Metafunga/)**

A daily fungi phylogeny guessing game — companion to Metazooa and Metaflora.

## How to play

Each day a mystery fungus is chosen. Guess fungi by name; each guess reveals how deep your guess matches the target on the phylogenetic tree. The photo progressively unblurs with each guess. You have **20 guesses** to identify the species.

- **Phylogeny tree** — a vertical node graph shows your progress through kingdom → phylum → class → order → family → genus → species. Correct guesses branch off the side of their deepest matching node.
- **Hints** — exchange 3 guesses to reveal the next rank (💡).
- **Fuzzy search** — typos and alternate spellings are matched automatically. Common name aliases and historical scientific synonyms are all searchable.
- **Clade previews** — once a rank is revealed, 6 thumbnail images of other fungi in that clade appear to help narrow it down.
- **Practice mode** — play unlimited practice games filtered by difficulty (Easy / Medium / Hard).
- **Wikipedia links** — tap any revealed node to open its Wikipedia page; the first paragraph is shown inline.

## Database

**136 curated species** spanning:

| Group | Examples |
|---|---|
| Basidiomycota / Agaricales | Amanita muscaria, Psilocybe cubensis, Oyster Mushroom, Shaggy Mane, Blewit, Galerina marginata |
| Basidiomycota / Boletales | Porcini, Chanterelle, Paxillus involutus, Suillus, Leccinum |
| Basidiomycota / Polyporales | Turkey Tail, Reishi, Chicken of the Woods, Dryad's Saddle, Trichaptum |
| Basidiomycota / Russulales | Russula spp., Lactarius spp., Lion's Mane, Coral Tooth |
| Basidiomycota / other | Corn Smut, Wheat Stem Rust, jelly fungi, stinkhorns, puffballs |
| Ascomycota | Morels, truffles, Ergot, Orange Peel Fungus, Cordyceps, Zombie Ant Fungus |
| Mucoromycota | Black Bread Mold, Common Pin Mold, Cunninghamella |
| Chytridiomycota | Batrachochytrium dendrobatidis (Chytrid Fungus) |
| Blastocladiomycota | Allomyces reticulatus |

Each species has:
- Common name aliases and historical scientific synonyms (searchable)
- **Rarity** score (0 = ubiquitous, 100 = extremely rare)
- **Fame** score (0 = unknown, 100 = household name)
- **Difficulty** tier (Easy / Medium / Hard) used to filter practice games

## Data sources

- **Taxonomy**: [Index Fungorum](https://www.indexfungorum.org/) and [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy)
- **Images**: [iNaturalist](https://www.inaturalist.org/) (CC-BY / CC-BY-NC) and [Wikimedia Commons](https://commons.wikimedia.org/)
- **Wikipedia summaries**: [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · GitHub Pages

## Development

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build
```

## Deployment

Pushing to `main` triggers GitHub Actions to build and deploy to GitHub Pages automatically. The live site reflects the commit hash and build timestamp shown in the version footer at the bottom of the page.
