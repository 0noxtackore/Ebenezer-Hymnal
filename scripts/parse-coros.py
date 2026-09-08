import re
import json

KEY_MAP = {
    'C': 'Do', 'CR': 'Do',
    'A': 'La', 'AR': 'La',
    'G': 'Sol', 'GR': 'Sol',
    'D': 'Re', 'DR': 'Re',
    'E': 'Mi', 'ER': 'Mi',
    'F': 'Fa', 'FR': 'Fa',
    'DM': 'Re', 'GM': 'Sol', 'GRM': 'Sol',
}

SPEED_MAP = {
    'C': 'Lento', 'A': 'Lento', 'G': 'Lento', 'D': 'Lento', 'E': 'Lento', 'F': 'Lento',
    'DM': 'Lento', 'GM': 'Lento',
    'CR': 'Rápido', 'AR': 'Rápido', 'GR': 'Rápido', 'DR': 'Rápido', 'ER': 'Rápido', 'FR': 'Rápido',
    'GRM': 'Rápido',
}

CATEGORY_MAP = {
    'Lento': 'Coros Lentos',
    'Rápido': 'Coros Rápidos',
}

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026-raw.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Split by code patterns like C001, CR001, GR001, etc.
pattern = r'\n([A-Z]+0*\d+)\s*\n'
parts = re.split(pattern, text)

coros = []
i = 1
while i < len(parts):
    code = parts[i].strip()
    lyrics = parts[i + 1].strip() if i + 1 < len(parts) else ''
    i += 2

    # Extract prefix and number
    m = re.match(r'^([A-Z]+?)(0*\d+)$', code)
    if not m:
        continue
    prefix = m.group(1)
    num = int(m.group(2))

    key = KEY_MAP.get(prefix, '')
    speed = SPEED_MAP.get(prefix, '')
    category = CATEGORY_MAP.get(speed, 'Sin Categoria')

    # Clean lyrics: remove extra spaces, fix encoding issues
    lyrics = re.sub(r'[ \t]+', ' ', lyrics)
    lyrics = lyrics.replace('\r', '')
    # Convert double newlines to blocks
    lyrics = re.sub(r'\n{3,}', '\n\n', lyrics)

    coros.append({
        'code': code,
        'prefix': prefix,
        'number': num,
        'musicKey': key,
        'scale': 'Mayor' if key else '',
        'speed': speed,
        'category': category,
        'lyrics': lyrics,
    })

print(f"Total coros parsed: {len(coros)}")
print("")

# Summary by prefix
from collections import Counter
prefix_counts = Counter()
for c in coros:
    prefix_counts[c['prefix']] += 1

print("By prefix:")
for k, v in sorted(prefix_counts.items()):
    key = KEY_MAP.get(k, '?')
    speed = SPEED_MAP.get(k, '?')
    print(f"  {k}: {v} coros (Key={key}, Speed={speed})")

print("")
print("By category:")
cat_counts = Counter(c['category'] for c in coros)
for k, v in sorted(cat_counts.items()):
    print(f"  {k}: {v}")

# Save JSON
output = {
    'source': 'COROS 2026.pdf',
    'total': len(coros),
    'coros': coros,
}

output_path = r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nSaved to: {output_path}")

# Show first 3
print("\n=== SAMPLE ===")
for c in coros[:3]:
    print(f"{c['code']} - Key={c['musicKey']} {c['scale']} ({c['speed']}) [{c['category']}]")
    print(f"  Lyrics preview: {c['lyrics'][:100]}...")
    print()
