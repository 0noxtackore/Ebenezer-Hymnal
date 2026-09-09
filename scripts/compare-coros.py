import json
import urllib.request
import re

# Load PDF coros
with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

# Load Firebase hymns
with urllib.request.urlopen("https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app/hymnario/hymns.json") as resp:
    fb_data = json.loads(resp.read().decode('utf-8'))
    if isinstance(fb_data, dict):
        fb_hymns = list(fb_data.values())
    else:
        fb_hymns = fb_data

pdf_coros = pdf_data['coros']
fb_coros = [h for h in fb_hymns if 'coro' in (h.get('category', '') or '').lower() or 'gospel' in (h.get('category', '') or '').lower()]

print(f"PDF coros: {len(pdf_coros)}")
print(f"Firebase coros: {len(fb_coros)}")

# Build FB lookup by nomenclature
fb_by_nom = {}
for h in fb_coros:
    nom = (h.get('nomenclature', '') or '').strip().upper()
    if nom:
        fb_by_nom[nom] = h

# Compare
pdf_codes = set()
fb_codes = set(fb_by_nom.keys())

missing_in_fb = []
for c in pdf_coros:
    code = c['code'].strip().upper()
    pdf_codes.add(code)
    if code not in fb_by_nom:
        first_line = c['lyrics'].split('\n')[0].strip()[:50]
        missing_in_fb.append(f"  {code} [{c['musicKey']} {c['scale']}] {first_line}")

extra_in_fb = fb_codes - pdf_codes
missing_in_pdf = pdf_codes - fb_codes

print(f"\n=== MISSING in Firebase ({len(missing_in_fb)}) ===")
for m in missing_in_fb:
    print(m)

print(f"\n=== EXTRA in Firebase (not in PDF) ({len(extra_in_fb)}) ===")
for e in sorted(extra_in_fb):
    h = fb_by_nom[e]
    print(f"  {e} [{h.get('musicKey','')} {h.get('scale','')}] {h.get('title','')[:50]}")

# Check for lyrics completeness
print(f"\n=== LYRICS COMPARISON ===")
short_in_fb = []
empty_in_fb = []
for c in pdf_coros:
    code = c['code'].strip().upper()
    if code in fb_by_nom:
        pdf_lyrics = c['lyrics'].strip()
        fb_lyrics = (fb_by_nom[code].get('lyrics', '') or '').strip()
        pdf_lines = [l.strip() for l in pdf_lyrics.split('\n') if l.strip()]
        fb_lines = [l.strip() for l in fb_lyrics.split('\n') if l.strip()]
        if not fb_lyrics:
            empty_in_fb.append(code)
        elif len(fb_lines) < len(pdf_lines) * 0.7:
            short_in_fb.append(f"  {code}: PDF={len(pdf_lines)} lines, FB={len(fb_lines)} lines")

if empty_in_fb:
    print(f"Empty lyrics in Firebase: {empty_in_fb}")
if short_in_fb:
    print(f"Short lyrics in Firebase:")
    for s in short_in_fb:
        print(s)
if not empty_in_fb and not short_in_fb:
    print("All lyrics look complete!")
