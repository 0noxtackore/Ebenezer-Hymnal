import re
import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

coros = data['coros']

# Show C003 specifically
for c in coros:
    if c['code'] == 'C003':
        print(f"=== {c['code']} ===")
        print(repr(c['lyrics'][:600]))
        print()
        print(c['lyrics'][:600])
        break

# Show C010
for c in coros:
    if c['code'] == 'D010':
        print(f"\n=== {c['code']} ===")
        print(repr(c['lyrics'][:600]))
        break

# Check how many have ( in lyrics
parens = [c for c in coros if '(' in c.get('lyrics', '')]
print(f"\nWith parentheses: {len(parens)}")

# Show first 5
for c in parens[:5]:
    print(f"\n{c['code']}:")
    blocks = [b.strip() for b in c['lyrics'].split('\n\n') if b.strip()]
    for i, b in enumerate(blocks):
        print(f"  Block {i}: {repr(b[:100])}")
