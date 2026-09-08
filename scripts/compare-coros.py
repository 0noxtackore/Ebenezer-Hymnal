import json
import urllib.request

# Load parsed coros
with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "r", encoding="utf-8") as f:
    parsed = json.load(f)

# Load current DB
url = "https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app/hymnario/hymns.json"
with urllib.request.urlopen(url) as resp:
    db_hymns = json.loads(resp.read().decode('utf-8'))

print(f"PDF coros: {len(parsed['coros'])}")
print(f"DB hymns: {len(db_hymns)}")

# Normalize title for comparison
def norm(s):
    import re
    s = (s or '').lower()
    s = re.sub(r'[^a-záéíóúñü]', '', s)
    return s

# Build lookup of existing DB titles (for chorus categories)
db_norm_titles = set()
for h in db_hymns:
    cat = (h.get('category', '') or '').lower()
    if 'coros' in cat or 'gospel' in cat:
        db_norm_titles.add(norm(h.get('title', '')))

print(f"\nDB chorus titles (normalized): {len(db_norm_titles)}")

# Find missing coros
missing = []
existing = []
for c in parsed['coros']:
    title_from_lyrics = c['lyrics'].split('\n')[0].strip()[:80]  # First line as title
    n = norm(title_from_lyrics)
    if n in db_norm_titles:
        existing.append(c)
    else:
        missing.append(c)

print(f"\nAlready in DB: {len(existing)}")
print(f"Missing (need to add): {len(missing)}")

# Show missing by category
from collections import Counter
cat_counts = Counter(c['category'] for c in missing)
print("\nMissing by category:")
for k, v in sorted(cat_counts.items()):
    print(f"  {k}: {v}")

# Show first 10 missing
print("\n=== FIRST 10 MISSING ===")
for c in missing[:10]:
    title = c['lyrics'].split('\n')[0].strip()[:60]
    print(f"  {c['code']} [{c['musicKey']} {c['scale']}] {c['speed']}: {title}")

# Save missing list
with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-missing.json", "w", encoding="utf-8") as f:
    json.dump(missing, f, ensure_ascii=False, indent=2)
print(f"\nSaved missing list to coros-missing.json")
