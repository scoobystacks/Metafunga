# Metafunga

A daily fungi phylogeny guessing game — companion to Metazooa and Metaflora.

## How to play

Each day a mystery fungus is chosen. Guess fungi by name; each guess reveals the deepest shared node on the phylogenetic tree between your guess and the target. The photo progressively unblurs with each guess. You have **20 guesses** to identify the species.

## Data sources

- **Taxonomy**: [Index Fungorum](https://www.indexfungorum.org/) and [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy)
- **Images**: [iNaturalist](https://www.inaturalist.org/) (CC-BY / CC-BY-NC) and [Wikimedia Commons](https://commons.wikimedia.org/)
- **Species coverage**: ~85 curated common North American fungi spanning Basidiomycota, Ascomycota, and Mucoromycota

## Development

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build
```

## Deployment

Configured for GitHub Pages with `base: '/Metafunga/'` in `vite.config.ts`. Build output goes to `dist/`.
