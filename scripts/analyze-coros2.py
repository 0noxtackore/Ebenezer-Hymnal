import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

coros = data['coros']

# Show first coro keys
print("Keys:", list(coros[0].keys()))

# Show 10 with parentheses
count = 0
for c in coros:
    lyrics = c.get('lyrics', '') or ''
    if '(' in lyrics:
        print(f"\n=== {c['code']} ({c['musicKey']} {c['speed']}) ===")
        print(lyrics[:600])
        print("---")
        count += 1
        if count >= 10:
            break

print(f"\n=== Total with parentheses: {sum(1 for c in coros if '(' in c.get('lyrics',''))} ===")
print(f"=== Total with repeated first/last block: ===")
count2 = 0
for c in coros:
    lyrics = c.get('lyrics', '') or ''
    blocks = [b.strip() for b in lyrics.split('\n\n') if b.strip()]
    if len(blocks) >= 2 and blocks[0].strip() == blocks[-1].strip():
        count2 += 1
        if count2 <= 3:
            print(f"\n{c['code']}: {lyrics[:300]}")
print(f"Total: {count2}")
