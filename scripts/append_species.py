#!/usr/bin/env python3
"""
Appends new species entries from new_species.ts into src/data/fungi.ts
before the closing ];
"""
import re

# Read the new species file and extract entries between the [ and ];
with open("scripts/new_species.ts", "r") as f:
    ns_content = f.read()

# Extract array body between NEW_SPECIES = [ and the closing ];
match = re.search(r'export const NEW_SPECIES = \[(.*?)\];', ns_content, re.DOTALL)
if not match:
    print("ERROR: Could not find NEW_SPECIES array")
    exit(1)

new_entries = match.group(1).strip()

# Read fungi.ts
with open("src/data/fungi.ts", "r") as f:
    fungi_content = f.read()

# Find the closing ]; of the FUNGI array
# It's the last ]; before FUNGI_MAP
insert_pos = fungi_content.rfind("];\n\nexport const FUNGI_MAP")
if insert_pos == -1:
    insert_pos = fungi_content.rfind("];\n\nexport const FUNGI_MAP")
    if insert_pos == -1:
        # Try to find just the ]
        insert_pos = fungi_content.rfind("];\n\nexport")

if insert_pos == -1:
    print("ERROR: Could not find end of FUNGI array")
    exit(1)

# Insert new entries before the ];
# The position points to the `]` character
insertion = ",\n  " + new_entries.replace("\n  {", "\n  {").replace("\n{", "\n  {")
# Clean up the new entries formatting
insertion = "\n" + new_entries + "\n"

new_content = fungi_content[:insert_pos] + insertion + fungi_content[insert_pos:]

with open("src/data/fungi.ts", "w") as f:
    f.write(new_content)

print("Successfully appended new species to fungi.ts")
