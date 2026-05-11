#!/usr/bin/env python3
"""
Marks the 7 most obscure species as difficulty "insane" in fungi.ts.
"""
import re

INSANE_IDS = {
    "allomyces-reticulatus",
    "cunninghamella-elegans",
    "clavariadelphus-truncatus",
    "hapalopilus-nidulans",
    "suillus-pungens",
    "polyporus-brumalis",
    "leucoagaricus-leucothites",
}

with open("src/data/fungi.ts", "r") as f:
    content = f.read()

# Split into per-entry blocks, same approach as update_fungi.py
array_match = re.search(r'(export const FUNGI: Fungus\[\] = \[)(.*?)(\];)', content, re.DOTALL)
if not array_match:
    print("ERROR: Could not find FUNGI array")
    exit(1)

header = content[:array_match.start(2)]
array_body = array_match.group(2)
footer = content[array_match.end(2):]

# Parse entry blocks
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

processed = []
changed = 0
for entry in entries:
    id_match = re.search(r'id:\s*"([^"]+)"', entry)
    if id_match and id_match.group(1) in INSANE_IDS:
        entry = re.sub(r'difficulty: "hard"', 'difficulty: "insane"', entry, count=1)
        changed += 1
    processed.append(entry)

new_array_body = "\n".join(processed)
if not new_array_body.startswith('\n'):
    new_array_body = '\n' + new_array_body

new_content = header + new_array_body + footer
with open("src/data/fungi.ts", "w") as f:
    f.write(new_content)

print(f"Marked {changed} species as 'insane'.")
