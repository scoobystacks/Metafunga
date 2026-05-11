#!/usr/bin/env python3
"""
Fixes the 15 species whose images fetch_inat_images.py couldn't find.
Run from repo root on your LOCAL machine:
  python3 scripts/fix_missing_images.py
"""
import re, json, subprocess, urllib.parse

FUNGI_FILE = "src/data/fungi.ts"
USER_AGENT = "Metafunga/3.0 (https://github.com/scoobystacks/Metafunga; bot@scoobystacks.com)"

# Species that still have old/broken images
MISSING = [
    "Gyromitra caroliniana",
    "Laetiporus cincinnatus",
    "Morchella americana",
    "Cantharellus cinnabarinus",
    "Imleria badia",
    "Ganoderma tsugae",
    "Tylopilus felleus",
    "Laccaria amethystina",
]


def curl_json(url: str) -> dict:
    result = subprocess.run(
        ["curl", "-s", "--max-time", "12", "-A", USER_AGENT, url],
        capture_output=True, text=True, timeout=15
    )
    return json.loads(result.stdout)


def wiki_photo(scientific_name: str) -> tuple[str, str] | None:
    encoded = urllib.parse.quote(scientific_name.replace(" ", "_"))

    # Try pageimages with redirects enabled
    data = curl_json(
        f"https://en.wikipedia.org/w/api.php"
        f"?action=query&titles={encoded}&prop=pageimages"
        f"&format=json&pithumbsize=500&redirects=1"
    )
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        thumb = page.get("thumbnail")
        if thumb and thumb.get("source"):
            return thumb["source"], "© Wikimedia Commons contributors / CC BY-SA"

    # Fallback: get all images in article, pick first plausible photo
    data = curl_json(
        f"https://en.wikipedia.org/w/api.php"
        f"?action=query&titles={encoded}&prop=images"
        f"&format=json&redirects=1&imlimit=20"
    )
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        for img in page.get("images", []):
            title = img.get("title", "")
            name = title.replace("File:", "").lower()
            # Skip icons, flags, maps, logos
            if any(skip in name for skip in ["icon", "flag", "map", "logo", "symbol", "blank", "commons-logo", "wikispecies"]):
                continue
            if not any(name.endswith(ext) for ext in [".jpg", ".jpeg", ".png"]):
                continue
            # Fetch the actual file URL
            file_encoded = urllib.parse.quote(title.replace("File:", "").replace(" ", "_"))
            file_data = curl_json(
                f"https://en.wikipedia.org/w/api.php"
                f"?action=query&titles=File:{file_encoded}&prop=imageinfo"
                f"&iiprop=url&iiurlwidth=500&format=json"
            )
            file_pages = file_data.get("query", {}).get("pages", {})
            for fp in file_pages.values():
                info = fp.get("imageinfo", [{}])[0]
                thumb_url = info.get("thumburl") or info.get("url")
                if thumb_url:
                    return thumb_url, "© Wikimedia Commons contributors / CC BY-SA"
    return None


def patch_entry(entry: str, new_url: str, attribution: str) -> str:
    entry = re.sub(r'imageUrl:\s*"[^"]*"', f'imageUrl: "{new_url}"', entry, count=1)
    entry = re.sub(r'imageAttribution:\s*"[^"]*"', f'imageAttribution: "{attribution}"', entry, count=1)
    return entry


def main() -> None:
    with open(FUNGI_FILE) as f:
        source = f.read()

    results: dict[str, tuple[str, str]] = {}
    for name in MISSING:
        print(f"{name} ...", end=" ", flush=True)
        result = wiki_photo(name)
        if result:
            results[name] = result
            print("OK")
        else:
            print("NOT FOUND")

    # Patch matching entries by scientificName
    def patch(source: str) -> str:
        for name, (url, attrib) in results.items():
            pattern = rf'(scientificName:\s*"{re.escape(name)}".*?imageUrl:\s*)"[^"]*"'
            source = re.sub(pattern, rf'\1"{url}"', source, flags=re.DOTALL)
            pattern2 = rf'(scientificName:\s*"{re.escape(name)}".*?imageAttribution:\s*)"[^"]*"'
            source = re.sub(pattern2, rf'\1"{attrib}"', source, flags=re.DOTALL)
        return source

    new_source = patch(source)
    with open(FUNGI_FILE, "w") as f:
        f.write(new_source)

    print(f"\nDone — fixed {len(results)}/{len(MISSING)} missing images.")


if __name__ == "__main__":
    main()
