import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-upload.json", "r", encoding="utf-8") as f:
    all_hymns = json.load(f)

print(f"Total: {len(all_hymns)}")

# Show a chorus example
for h in all_hymns:
    if h.get('category', '').lower() == 'coros lentos':
        print("\n--- Example chorus ---")
        print(f"Title: {h.get('title')}")
        print(f"Number: {h.get('number')}")
        print(f"Category: {h.get('category')}")
        print(f"MusicKey: {h.get('musicKey')}")
        print(f"Scale: {h.get('scale')}")
        print(f"Nomenclature: {h.get('nomenclature')}")
        print(f"Lyrics:\n{h.get('lyrics', '')[:1500]}")
        break

# Check how many have lyrics with CORO blocks
with_coro = 0
without_coro = 0
for h in all_hymns:
    lyrics = h.get('lyrics', '') or ''
    if '\n\nCORO\n' in lyrics or '\nCORO\n' in lyrics:
        with_coro += 1
    else:
        without_coro += 1

print(f"\nWith CORO block: {with_coro}")
print(f"Without CORO block: {without_coro}")
