import re
import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026-raw.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

# Re-parse from raw text
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
CATEGORY_MAP = {'Lento': 'Coros Lentos', 'Rápido': 'Coros Rápidos'}

pattern = r'\n([A-Z]+0*\d+)\s*\n'
parts = re.split(pattern, raw_text)

coros = []
i = 1
while i < len(parts):
    code = parts[i].strip()
    lyrics = parts[i + 1].strip() if i + 1 < len(parts) else ''
    i += 2

    m = re.match(r'^([A-Z]+?)(0*\d+)$', code)
    if not m:
        continue
    prefix = m.group(1)
    num = int(m.group(2))
    key = KEY_MAP.get(prefix, '')
    speed = SPEED_MAP.get(prefix, '')
    category = CATEGORY_MAP.get(speed, 'Sin Categoria')

    lyrics = re.sub(r'[ \t]+', ' ', lyrics)
    lyrics = lyrics.replace('\r', '')
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

print(f"Total from raw: {len(coros)}")

# Now analyze line-level patterns
for c in coros[:3]:
    lines = c['lyrics'].split('\n')
    print(f"\n=== {c['code']} ===")
    for li, line in enumerate(lines):
        stripped = line.strip()
        print(f"  L{li}: [{stripped}]")
