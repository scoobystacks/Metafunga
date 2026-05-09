#!/usr/bin/env python3
"""
Adds aliases, synonyms, crossSectionUrl, rarity, fame, difficulty
to all existing entries in src/data/fungi.ts, then appends new species.
"""
import re, sys

# Per-species additions for all 85 existing entries
# Format: id -> {aliases, synonyms, rarity, fame, difficulty}
ADDITIONS = {
    "amanita-muscaria":      {"aliases":["Fly Mushroom","Bug Agaric"],                      "synonyms":[],                                         "rarity":30,"fame":95,"difficulty":"easy"},
    "amanita-phalloides":    {"aliases":["Green Death Cap"],                                  "synonyms":[],                                         "rarity":40,"fame":85,"difficulty":"easy"},
    "amanita-bisporigera":   {"aliases":["Eastern Destroying Angel"],                        "synonyms":[],                                         "rarity":50,"fame":65,"difficulty":"medium"},
    "amanita-caesarea":      {"aliases":["Caesar's Amanita"],                                "synonyms":[],                                         "rarity":75,"fame":60,"difficulty":"medium"},
    "agaricus-campestris":   {"aliases":["Meadow Mushroom","Pink Bottom"],                  "synonyms":[],                                         "rarity":20,"fame":75,"difficulty":"easy"},
    "agaricus-bisporus":     {"aliases":["Cremini","Portobello","White Button"],            "synonyms":[],                                         "rarity":5,"fame":99,"difficulty":"easy"},
    "coprinus-comatus":      {"aliases":["Lawyer's Wig","Ink Cap"],                          "synonyms":[],                                         "rarity":25,"fame":70,"difficulty":"easy"},
    "coprinellus-micaceus":  {"aliases":["Glistening Inky Cap","Mica Inkcap"],             "synonyms":["Coprinus micaceus"],                      "rarity":10,"fame":40,"difficulty":"hard"},
    "marasmius-oreades":     {"aliases":["Scotch Bonnet","Fairy Ring Champignon"],         "synonyms":[],                                         "rarity":20,"fame":70,"difficulty":"easy"},
    "armillaria-mellea":     {"aliases":["Bootlace Mushroom","Honey Fungus"],              "synonyms":["Armillariella mellea"],                   "rarity":15,"fame":70,"difficulty":"easy"},
    "hypholoma-fasciculare": {"aliases":["Clustered Woodlover","Sulphur Tuft"],            "synonyms":[],                                         "rarity":15,"fame":55,"difficulty":"medium"},
    "psilocybe-cubensis":    {"aliases":["Magic Mushroom","Shrooms","Golden Cap"],         "synonyms":["Stropharia cubensis"],                    "rarity":50,"fame":90,"difficulty":"easy"},
    "gymnopilus-junonius":   {"aliases":["Laughing Gym","Big Laughing Gym"],              "synonyms":["Gymnopilus spectabilis"],                 "rarity":45,"fame":35,"difficulty":"hard"},
    "boletus-edulis":        {"aliases":["Penny Bun","Cep","Cèpe","King Bolete"],         "synonyms":[],                                         "rarity":35,"fame":95,"difficulty":"easy"},
    "suillus-luteus":        {"aliases":["Sticky Bun","Brown Slippery Jack"],             "synonyms":[],                                         "rarity":20,"fame":55,"difficulty":"medium"},
    "leccinum-scabrum":      {"aliases":["Rough-stemmed Bolete","Scaber Stalk"],          "synonyms":[],                                         "rarity":30,"fame":50,"difficulty":"medium"},
    "pisolithus-arhizus":    {"aliases":["Dog Turd Fungus","Dyeball"],                    "synonyms":["Pisolithus tinctorius"],                  "rarity":40,"fame":30,"difficulty":"hard"},
    "cantharellus-cibarius": {"aliases":["Chanterelle","Girolle","Golden Chanterelle"],   "synonyms":[],                                         "rarity":30,"fame":90,"difficulty":"easy"},
    "craterellus-cornucopioides":{"aliases":["Horn of Plenty","Trumpet of Death"],       "synonyms":[],                                         "rarity":45,"fame":70,"difficulty":"easy"},
    "hydnum-repandum":       {"aliases":["Sweet Tooth","Wood Hedgehog"],                  "synonyms":[],                                         "rarity":35,"fame":65,"difficulty":"medium"},
    "clavulina-cristata":    {"aliases":["White Coral Fungus","Crested Coral Fungus"],    "synonyms":[],                                         "rarity":30,"fame":35,"difficulty":"hard"},
    "trametes-versicolor":   {"aliases":["Turkey Tail Fungus"],                           "synonyms":["Coriolus versicolor","Polyporus versicolor"],"rarity":5,"fame":80,"difficulty":"easy"},
    "ganoderma-lucidum":     {"aliases":["Lingzhi","Mushroom of Immortality"],           "synonyms":["Polyporus lucidus"],                      "rarity":40,"fame":90,"difficulty":"easy"},
    "fomitopsis-pinicola":   {"aliases":["Conifer Bracket","Red-belted Bracket"],        "synonyms":[],                                         "rarity":30,"fame":40,"difficulty":"hard"},
    "grifola-frondosa":      {"aliases":["Maitake","Sheep's Head","Dancing Mushroom"],   "synonyms":[],                                         "rarity":45,"fame":85,"difficulty":"easy"},
    "laetiporus-sulphureus": {"aliases":["Crab of the Woods","Sulphur Shelf"],           "synonyms":[],                                         "rarity":35,"fame":85,"difficulty":"easy"},
    "inonotus-obliquus":     {"aliases":["Birch Canker Polypore"],                        "synonyms":[],                                         "rarity":50,"fame":80,"difficulty":"easy"},
    "sparassis-radicata":    {"aliases":["Cauliflower Mushroom","Rooted Cauliflower"],   "synonyms":[],                                         "rarity":60,"fame":55,"difficulty":"medium"},
    "russula-emetica":       {"aliases":["Emetic Russula","Vomiting Russula"],           "synonyms":[],                                         "rarity":25,"fame":55,"difficulty":"medium"},
    "russula-xerampelina":   {"aliases":["Shrimp Russula","Crab Brittlegill"],           "synonyms":[],                                         "rarity":30,"fame":35,"difficulty":"hard"},
    "lactarius-deliciosus":  {"aliases":["Pine Mushroom","Red Pine Mushroom"],           "synonyms":[],                                         "rarity":30,"fame":85,"difficulty":"easy"},
    "lactarius-indigo":      {"aliases":["Blue Milk Cap","Indigo Lactarius"],            "synonyms":[],                                         "rarity":45,"fame":75,"difficulty":"easy"},
    "hypomyces-lactifluorum":{"aliases":["Lobster Fungus"],                               "synonyms":[],                                         "rarity":35,"fame":75,"difficulty":"easy"},
    "phallus-impudicus":     {"aliases":["Stinkhorn","Common Stinkhorn"],                "synonyms":[],                                         "rarity":20,"fame":65,"difficulty":"medium"},
    "clathrus-ruber":        {"aliases":["Latticed Stinkhorn","Red Cage Stinkhorn"],     "synonyms":[],                                         "rarity":55,"fame":60,"difficulty":"medium"},
    "lycoperdon-perlatum":   {"aliases":["Common Puffball","Devil's Snuffbox"],          "synonyms":[],                                         "rarity":10,"fame":55,"difficulty":"medium"},
    "calvatia-gigantea":     {"aliases":["Giant Puffball"],                               "synonyms":["Langermannia gigantea"],                  "rarity":30,"fame":80,"difficulty":"easy"},
    "scleroderma-citrinum":  {"aliases":["Pigskin Poison Puffball","Common Earthball"],  "synonyms":[],                                         "rarity":20,"fame":40,"difficulty":"hard"},
    "cortinarius-violaceus": {"aliases":["Violet Cort","Purple Webcap"],                  "synonyms":[],                                         "rarity":50,"fame":40,"difficulty":"hard"},
    "tricholoma-magnivelare":{"aliases":["White Matsutake","Pine Mushroom"],             "synonyms":["Armillaria ponderosa"],                   "rarity":55,"fame":70,"difficulty":"medium"},
    "pleurotus-ostreatus":   {"aliases":["Pearl Oyster","Oyster Fungus"],                "synonyms":[],                                         "rarity":15,"fame":95,"difficulty":"easy"},
    "lentinula-edodes":      {"aliases":["Oak Mushroom","Black Forest Mushroom"],        "synonyms":["Lentinus edodes"],                        "rarity":20,"fame":95,"difficulty":"easy"},
    "tremella-mesenterica":  {"aliases":["Yellow Brain","Golden Jelly Fungus"],         "synonyms":[],                                         "rarity":20,"fame":55,"difficulty":"medium"},
    "auricularia-auricula-judae":{"aliases":["Jelly Ear","Judas's Ear","Wood Fungus"],  "synonyms":["Auricularia auricula"],                   "rarity":15,"fame":75,"difficulty":"easy"},
    "exidia-glandulosa":     {"aliases":["Black Witch's Butter","Black Jelly Roll"],    "synonyms":[],                                         "rarity":25,"fame":25,"difficulty":"hard"},
    "dacrymyces-chrysospermus":{"aliases":["Common Jellyspot","Orange Jelly"],          "synonyms":["Dacrymyces palmatus"],                    "rarity":15,"fame":20,"difficulty":"hard"},
    "ustilago-maydis":       {"aliases":["Huitlacoche","Mexican Truffle","Corn Fungus"],"synonyms":[],                                         "rarity":20,"fame":70,"difficulty":"easy"},
    "puccinia-graminis":     {"aliases":["Black Stem Rust","Wheat Rust"],               "synonyms":[],                                         "rarity":30,"fame":55,"difficulty":"medium"},
    "morchella-esculenta":   {"aliases":["Common Morel","Sponge Mushroom","Honeycomb Morel"],"synonyms":[],                                    "rarity":40,"fame":90,"difficulty":"easy"},
    "morchella-elata":       {"aliases":["Burn Morel","Conifer Morel","Black Morel"],   "synonyms":[],                                         "rarity":45,"fame":75,"difficulty":"easy"},
    "gyromitra-esculenta":   {"aliases":["Brain Mushroom","Beefsteak Morel","Turban Fungus"],"synonyms":[],                                    "rarity":50,"fame":65,"difficulty":"medium"},
    "helvella-lacunosa":     {"aliases":["Fluted Black Elfin Saddle"],                   "synonyms":[],                                         "rarity":40,"fame":40,"difficulty":"hard"},
    "sarcoscypha-coccinea":  {"aliases":["Scarlet Cup","Red Elf Cup"],                   "synonyms":[],                                         "rarity":35,"fame":65,"difficulty":"medium"},
    "tuber-melanosporum":    {"aliases":["Black Truffle","Périgord Truffle"],            "synonyms":[],                                         "rarity":85,"fame":95,"difficulty":"easy"},
    "cordyceps-militaris":   {"aliases":["Caterpillar Fungus","Orange Caterpillar Club"],"synonyms":[],                                         "rarity":55,"fame":70,"difficulty":"medium"},
    "ophiocordyceps-unilateralis":{"aliases":["Zombie Fungus"],                          "synonyms":[],                                         "rarity":70,"fame":85,"difficulty":"easy"},
    "xylaria-polymorpha":    {"aliases":["Dead Fingers","Dead Man's Fingers"],           "synonyms":[],                                         "rarity":25,"fame":65,"difficulty":"medium"},
    "nectria-cinnabarina":   {"aliases":["Canker Nectria","Coral Spot Fungus"],         "synonyms":[],                                         "rarity":15,"fame":25,"difficulty":"hard"},
    "chlorociboria-aeruginascens":{"aliases":["Blue-green Elfcup","Turquoise Elfcup"],"synonyms":[],                                          "rarity":30,"fame":35,"difficulty":"hard"},
    "aspergillus-niger":     {"aliases":["Black Aspergillus"],                           "synonyms":[],                                         "rarity":5,"fame":70,"difficulty":"easy"},
    "penicillium-chrysogenum":{"aliases":["Fleming's Mold","Penicillin Fungus"],        "synonyms":["Penicillium notatum"],                    "rarity":5,"fame":95,"difficulty":"easy"},
    "rhizopus-stolonifer":   {"aliases":["Bread Mold","Black Bread Mold"],              "synonyms":[],                                         "rarity":5,"fame":80,"difficulty":"easy"},
    "mucor-mucedo":          {"aliases":["Pin Mold","Common Mucor"],                     "synonyms":[],                                         "rarity":10,"fame":40,"difficulty":"hard"},
    "ramaria-formosa":       {"aliases":["Pink Coral Fungus","Beautiful Coral Fungus"], "synonyms":[],                                         "rarity":45,"fame":35,"difficulty":"hard"},
    "mutinus-caninus":       {"aliases":["Dog's Stinkhorn","Canine Stinkhorn"],         "synonyms":[],                                         "rarity":40,"fame":35,"difficulty":"hard"},
    "pleurotus-djamor":      {"aliases":["Rose Oyster","Pink Oyster"],                  "synonyms":[],                                         "rarity":25,"fame":60,"difficulty":"medium"},
    "ganoderma-applanatum":  {"aliases":["Artist's Fungus","Shelf Fungus"],             "synonyms":[],                                         "rarity":20,"fame":55,"difficulty":"medium"},
    "piptoporus-betulinus":  {"aliases":["Razor Strop Fungus","Birch Bracket"],        "synonyms":["Piptoporus betulinus"],                   "rarity":25,"fame":60,"difficulty":"medium"},
    "meripilus-giganteus":   {"aliases":["Giant Polypore"],                              "synonyms":[],                                         "rarity":45,"fame":40,"difficulty":"hard"},
    "chroogomphus-rutilus":  {"aliases":["Slimy Spike","Wine-cap Gomphidius"],         "synonyms":[],                                         "rarity":40,"fame":25,"difficulty":"hard"},
    "amanita-pantherina":    {"aliases":["Brown Panther","Panther Amanita"],           "synonyms":[],                                         "rarity":45,"fame":65,"difficulty":"medium"},
    "amanita-rubescens":     {"aliases":["Blushing Amanita","The Blusher Amanita"],    "synonyms":[],                                         "rarity":30,"fame":55,"difficulty":"medium"},
    "boletus-satanas":       {"aliases":["Devil's Bolete","Satanic Bolete"],           "synonyms":["Boletus satanas"],                        "rarity":70,"fame":55,"difficulty":"medium"},
    "cantharellus-lateritius":{"aliases":["Smooth Chanterelle","Southeastern Chanterelle"],"synonyms":[],                                     "rarity":25,"fame":45,"difficulty":"hard"},
    "flammulina-velutipes":  {"aliases":["Enoki","Winter Mushroom","Velvet Foot"],     "synonyms":["Collybia velutipes"],                     "rarity":25,"fame":75,"difficulty":"easy"},
    "hericium-erinaceus":    {"aliases":["Monkey Head Mushroom","Pom Pom Mushroom","Bearded Tooth"],"synonyms":[],                            "rarity":50,"fame":85,"difficulty":"easy"},
    "omphalotus-illudens":   {"aliases":["Eastern Jack-o'-Lantern","Glowing Mushroom"],"synonyms":["Clitocybe illudens"],                     "rarity":30,"fame":70,"difficulty":"easy"},
    "pluteus-cervinus":      {"aliases":["Fawn Mushroom"],                               "synonyms":[],                                         "rarity":15,"fame":35,"difficulty":"hard"},
    "agaricus-xanthodermus": {"aliases":["Yellow-stainer","Inky Agaricus"],            "synonyms":[],                                         "rarity":20,"fame":35,"difficulty":"hard"},
    "cantharellus-tubaeformis":{"aliases":["Trumpet Chanterelle","Winter Chanterelle","Funnel Chanterelle"],"synonyms":["Craterellus tubaeformis"],"rarity":35,"fame":50,"difficulty":"medium"},
    "suillus-pungens":       {"aliases":["Pungent Suillus","Pungent Jack"],            "synonyms":[],                                         "rarity":40,"fame":20,"difficulty":"hard"},
    "leucoagaricus-leucothites":{"aliases":["Smooth Parasol","White Dapperling"],      "synonyms":[],                                         "rarity":25,"fame":20,"difficulty":"hard"},
    "clavariadelphus-truncatus":{"aliases":["Truncated Club Coral","Pestle-shaped Coral"],"synonyms":[],                                      "rarity":50,"fame":20,"difficulty":"hard"},
    "lycoperdon-pyriforme":  {"aliases":["Stump Puffball","Pear-shaped Puffball"],     "synonyms":["Morganella pyriformis"],                  "rarity":15,"fame":45,"difficulty":"medium"},
    "phaeolus-schweinitzii": {"aliases":["Dyer's Mazegill","Rusty Bracket"],           "synonyms":[],                                         "rarity":40,"fame":35,"difficulty":"hard"},
}

def fmt_list(lst):
    """Format a Python list as TypeScript array string."""
    if not lst:
        return "[]"
    items = ", ".join(f'"{x}"' for x in lst)
    return f"[{items}]"

def process_entry(block, species_id):
    """Add new fields to a single entry block."""
    data = ADDITIONS.get(species_id)
    if data is None:
        print(f"WARNING: No data for {species_id}", file=sys.stderr)
        return block

    aliases_str = fmt_list(data["aliases"])
    synonyms_str = fmt_list(data["synonyms"])
    rarity = data["rarity"]
    fame = data["fame"]
    difficulty = data["difficulty"]

    # 1. Insert aliases + synonyms after commonName line
    block = re.sub(
        r'(    commonName: "[^"]*",\n)',
        rf'\1    aliases: {aliases_str},\n    synonyms: {synonyms_str},\n',
        block, count=1
    )

    # 2. Insert crossSectionUrl after imageAttribution line
    block = re.sub(
        r'(    imageAttribution: "[^"]*",\n)',
        r'\1    crossSectionUrl: null,\n',
        block, count=1
    )

    # 3. Insert rarity, fame, difficulty after gbifId line
    block = re.sub(
        r'(    gbifId: \d+,\n)',
        rf'\1    rarity: {rarity},\n    fame: {fame},\n    difficulty: "{difficulty}",\n',
        block, count=1
    )

    # 4. Fix Flammulina velutipes image
    if species_id == "flammulina-velutipes":
        block = re.sub(
            r'imageUrl: "https://inaturalist-open-data\.s3\.amazonaws\.com/photos/9279/medium\.jpg"',
            'imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flammulina_velutipes.jpg/400px-Flammulina_velutipes.jpg"',
            block
        )
        block = re.sub(
            r'imageAttribution: "© Jason Hollinger / iNaturalist CC-BY"',
            'imageAttribution: "© Stu\'s Images / Wikimedia Commons CC-BY-SA"',
            block,
            count=1
        )

    return block

def main():
    with open("src/data/fungi.ts", "r") as f:
        content = f.read()

    # Split into header, entries array, footer
    # Find the opening of the array and process entry by entry
    # Each entry starts with "  {" and ends with "  },"
    # We process the content by finding id fields

    # Split content on entry boundaries - each entry is delimited by "  {\n" ... "  },"
    # Strategy: find each entry block, determine its id, add fields, reassemble

    # Find all entry blocks using regex
    # Entry pattern: starts at "  {\n" and ends at "  },"
    entry_pattern = re.compile(r'(  \{[^{}]*(?:\{[^{}]*\}[^{}]*)*\},)', re.DOTALL)
    # (This pattern matches { ... { ... } ... },  (one level of nested braces)

    # Better: split on "  },\n  {" boundaries
    # Find the FUNGI array content between the [ and ];
    array_match = re.search(r'(export const FUNGI: Fungus\[\] = \[)(.*?)(\];)', content, re.DOTALL)
    if not array_match:
        print("ERROR: Could not find FUNGI array", file=sys.stderr)
        sys.exit(1)

    header = content[:array_match.start(2)]
    array_body = array_match.group(2)
    footer = content[array_match.end(2):]

    # Split array body into individual entry blocks
    # Each entry is "  {\n    ...\n  },"
    # We split by finding each top-level { } block
    entries = []
    depth = 0
    current = []
    i = 0
    while i < len(array_body):
        ch = array_body[i]
        if ch == '{' and depth == 0:
            depth = 1
            current = [ch]
        elif ch == '{':
            depth += 1
            current.append(ch)
        elif ch == '}':
            depth -= 1
            current.append(ch)
            if depth == 0:
                # Grab any trailing comma + newline
                j = i + 1
                while j < len(array_body) and array_body[j] in ',\n':
                    current.append(array_body[j])
                    j += 1
                entries.append(''.join(current))
                current = []
                i = j
                continue
        elif depth > 0:
            current.append(ch)
        i += 1

    # Now process each entry
    processed = []
    for entry in entries:
        # Extract id
        id_match = re.search(r'id:\s*"([^"]+)"', entry)
        if id_match:
            species_id = id_match.group(1)
            entry = process_entry(entry, species_id)
        processed.append(entry)

    new_array_body = "\n".join(processed)
    # Ensure it starts with newline for proper formatting
    if not new_array_body.startswith('\n'):
        new_array_body = '\n' + new_array_body

    new_content = header + new_array_body + footer
    with open("src/data/fungi.ts", "w") as f:
        f.write(new_content)

    print(f"Processed {len(entries)} entries successfully.")

if __name__ == "__main__":
    main()
