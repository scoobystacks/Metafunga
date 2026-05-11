#!/usr/bin/env python3
"""
Replaces imageUrl values in fungi.ts with iNaturalist photo URLs.

Run from repo root on your LOCAL machine (requires internet access):
  python3 scripts/fetch_inat_images.py

iNaturalist photos are served from a stable AWS S3 CDN, so URLs won't
break due to Wikipedia file renames/deletions.
"""
import re, json, time, urllib.request, urllib.parse

FUNGI_FILE = "src/data/fungi.ts"
USER_AGENT = "Metafunga/3.0 (https://github.com/scoobystacks/Metafunga)"


def extract_entries(ts_source: str) -> list[tuple[str, str]]:
    ids = re.findall(r'id:\s*"([^"]+)"', ts_source)
    names = re.findall(r'scientificName:\s*"([^"]+)"', ts_source)
    assert len(ids) == len(names), f"id/name count mismatch: {len(ids)} vs {len(names)}"
    return list(zip(ids, names))


def inat_photo(scientific_name: str) -> tuple[str, str] | None:
    """Return (photo_url, attribution) or None."""
    q = urllib.parse.quote(scientific_name)
    url = f"https://api.inaturalist.org/v1/taxa/search?q={q}&limit=3"
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read())
        for taxon in data.get("results", []):
            # Match on exact scientific name to avoid wrong-taxon results
            if taxon.get("name", "").lower() != scientific_name.lower():
                continue
            photo = taxon.get("default_photo")
            if not photo:
                continue
            photo_url = photo.get("medium_url") or photo.get("url")
            if not photo_url:
                continue
            # Build attribution from photo attribution field
            attrib = photo.get("attribution", "© iNaturalist contributors / CC BY")
            return photo_url, attrib
    except Exception as e:
        print(f"  WARN {scientific_name}: {e}")
    return None


def patch_entry(entry: str, new_url: str, attribution: str) -> str:
    entry = re.sub(r'imageUrl:\s*"[^"]*"', f'imageUrl: "{new_url}"', entry, count=1)
    entry = re.sub(r'imageAttribution:\s*"[^"]*"', f'imageAttribution: "{attribution}"', entry, count=1)
    return entry


def split_entries(ts_source: str) -> list[str]:
    """Split source into per-entry blocks by tracking brace depth."""
    depth = 0
    entries: list[str] = []
    current: list[str] = []
    i = 0
    while i < len(ts_source):
        ch = ts_source[i]
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
                j = i + 1
                while j < len(ts_source) and ts_source[j] in ',\n':
                    current.append(ts_source[j])
                    j += 1
                entries.append(''.join(current))
                current = []
                i = j
                continue
        elif depth > 0:
            current.append(ch)
        i += 1
    return entries


def main() -> None:
    with open(FUNGI_FILE) as f:
        source = f.read()

    entries = extract_entries(source)
    print(f"Found {len(entries)} entries\n")

    id_to_inat: dict[str, tuple[str, str]] = {}
    for i, (fid, name) in enumerate(entries):
        print(f"[{i+1}/{len(entries)}] {name} ...", end=" ", flush=True)
        result = inat_photo(name)
        if result:
            id_to_inat[fid] = result
            print(f"OK")
        else:
            print("NOT FOUND — keeping existing URL")
        time.sleep(0.4)

    # Patch the source file
    blocks = split_entries(source)
    changed = 0
    patched: list[str] = []
    for block in blocks:
        m = re.search(r'id:\s*"([^"]+)"', block)
        if m and m.group(1) in id_to_inat:
            url, attrib = id_to_inat[m.group(1)]
            block = patch_entry(block, url, attrib)
            changed += 1
        patched.append(block)

    array_match = re.search(r'export const FUNGI: Fungus\[\] = \[', source)
    footer_match = re.search(r'\];\s*\nexport const FUNGI_MAP', source)
    header = source[:array_match.end()]
    footer = source[footer_match.start():]
    new_source = header + '\n' + '\n'.join(patched) + footer

    with open(FUNGI_FILE, "w") as f:
        f.write(new_source)

    print(f"\nDone — updated {changed}/{len(entries)} URLs in {FUNGI_FILE}")
    print("Run `npm run build` to verify, then commit.")


if __name__ == "__main__":
    main()
