#!/usr/bin/env python3
"""
Fetches Wikipedia thumbnail URLs for all species in fungi.ts.
Outputs a JSON mapping { id: imageUrl } to wiki_images.json.
Run from the repo root: python3 scripts/fetch_wiki_images.py
"""
import re, json, time, urllib.request, urllib.parse, urllib.error

FUNGI_FILE = "src/data/fungi.ts"
OUTPUT_FILE = "scripts/wiki_images.json"
USER_AGENT = "Metafunga/3.0 (https://github.com/scoobystacks/Metafunga)"

def extract_entries(ts_source):
    """Extract (id, scientificName) pairs from fungi.ts."""
    ids = re.findall(r'id:\s*"([^"]+)"', ts_source)
    names = re.findall(r'scientificName:\s*"([^"]+)"', ts_source)
    assert len(ids) == len(names), f"id/name count mismatch: {len(ids)} vs {len(names)}"
    return list(zip(ids, names))

def wiki_thumbnail(scientific_name):
    """Return Wikipedia thumbnail URL or None."""
    encoded = urllib.parse.quote(scientific_name.replace(" ", "_"))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            # Prefer originalimage for higher quality; fall back to thumbnail
            if "originalimage" in data:
                src = data["originalimage"]["source"]
                # Convert to a ~600px thumbnail to keep file sizes reasonable
                # Wikimedia URLs: /wikipedia/commons/a/ab/File.jpg -> add /thumb/... /600px-...
                return src
            if "thumbnail" in data:
                return data["thumbnail"]["source"]
    except Exception as e:
        print(f"  WARN {scientific_name}: {e}")
    return None

def main():
    with open(FUNGI_FILE) as f:
        source = f.read()

    entries = extract_entries(source)
    print(f"Found {len(entries)} entries")

    results = {}
    for i, (fid, name) in enumerate(entries):
        print(f"[{i+1}/{len(entries)}] {name} ...", end=" ", flush=True)
        url = wiki_thumbnail(name)
        if url:
            results[fid] = url
            print(f"OK")
        else:
            results[fid] = None
            print(f"NOT FOUND")
        time.sleep(0.3)  # polite rate limiting

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    found = sum(1 for v in results.values() if v)
    print(f"\nDone: {found}/{len(entries)} images found → {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
