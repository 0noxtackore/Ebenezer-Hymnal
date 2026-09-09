import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

coros = data['coros']

# Show 5 examples without CORO blocks
count = 0
for c in coros:
    lyrics = c.get('lyrics', '') or ''
    if '\n\nCORO\n' not in lyrics and '\nCORO\n' not in lyrics:
        print(f"\n=== {c['code']} - {c['musicKey']} ({c['speed']}) ===")
        print(lyrics[:500])
        print("---")
        count += 1
        if count >= 5:
            break
