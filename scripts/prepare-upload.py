import json
import urllib.request
import time
import re

# Load missing coros
with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-missing.json", "r", encoding="utf-8") as f:
    missing = json.load(f)

print(f"Coros to add: {len(missing)}")

# Load current DB
url = "https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app/hymnario/hymns.json"
with urllib.request.urlopen(url) as resp:
    db_hymns = json.loads(resp.read().decode('utf-8'))

print(f"Current DB hymns: {len(db_hymns)}")

# Get max IDs per category+key+scale
max_nums = {}
for h in db_hymns:
    cat = h.get('category', '')
    key = (h.get('musicKey') or '').strip()
    scale = (h.get('scale') or '').strip()
    num = h.get('number', 0)
    k = f"{cat}|{key}|{scale}"
    if k not in max_nums or num > max_nums[k]:
        max_nums[k] = num

# Convert PDF coros to DB format
def extract_title(lyrics):
    """Extract a clean title from lyrics (first meaningful line)"""
    lines = [l.strip() for l in lyrics.split('\n') if l.strip()]
    if not lines:
        return 'Sin título'
    title = lines[0]
    # Remove parenthetical notes
    title = re.sub(r'\s*\(.*?\)\s*$', '', title)
    # Remove trailing punctuation
    title = title.rstrip(' ,.')
    # Limit length
    if len(title) > 80:
        title = title[:80]
    return title if title else 'Sin título'

def clean_lyrics(lyrics):
    """Clean and format lyrics"""
    # Fix encoding issues
    lyrics = lyrics.replace('Ã¡', 'á').replace('Ã©', 'é').replace('Ã­', 'í')
    lyrics = lyrics.replace('Ã³', 'ó').replace('Ã±', 'ñ').replace('Ã¼', 'ü')
    lyrics = lyrics.replace('Ã', 'Á').replace('Â¿', '¿').replace('Â¡', '¡')
    # Clean whitespace
    lyrics = re.sub(r'[ \t]+', ' ', lyrics)
    lyrics = re.sub(r'\n{3,}', '\n\n', lyrics)
    return lyrics.strip()

new_hymns = []
for c in missing:
    cat = c['category']
    key = c['musicKey']
    scale = c['scale']
    speed = c['speed']
    
    # Calculate next number
    k = f"{cat}|{key}|{scale}"
    next_num = max_nums.get(k, 0) + 1
    max_nums[k] = next_num
    
    title = extract_title(c['lyrics'])
    lyrics = clean_lyrics(c['lyrics'])
    
    hymn = {
        'id': f"pdf_{c['code'].lower()}_{int(time.time())}",
        'number': next_num,
        'title': title,
        'category': cat,
        'musicKey': key,
        'scale': scale,
        'lyrics': lyrics,
        'audioUrl': '',
        'imageUrl': '',
    }
    new_hymns.append(hymn)

# Combine with existing
all_hymns = db_hymns + new_hymns
print(f"Total after adding: {len(all_hymns)}")

# Summary by category
from collections import Counter
cat_counts = Counter(h.get('category', '') for h in all_hymns)
print("\nBy category:")
for k, v in sorted(cat_counts.items()):
    print(f"  {k}: {v}")

# Save to file for upload
output_path = r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-upload.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_hymns, f, ensure_ascii=False, indent=2)

print(f"\nSaved upload data to: {output_path}")
print(f"New coros preview:")
for h in new_hymns[:5]:
    print(f"  {h['code'] if 'code' in h else ''} #{h['number']} [{h['musicKey']} {h['scale']}] {h['title']}")
