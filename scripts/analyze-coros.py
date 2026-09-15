import json, urllib.request

a = 'AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM'
u = 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app'
d = json.dumps({'email': 'ramon@ebenezer.dev', 'password': 'Ramon2026', 'returnSecureToken': True}).encode()
r = urllib.request.Request(f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={a}', data=d, headers={'Content-Type': 'application/json'})
t = json.loads(urllib.request.urlopen(r).read().decode())['idToken']
h = json.loads(urllib.request.urlopen(f'{u}/hymnario/hymns.json?auth={t}').read().decode())

# Format: nomenclature -> (section_index_before_coro)
# For 2-section songs: insert CORO before section 1 (0-indexed)
# For 3+ section songs: insert CORO before the identified chorus section
# value = index of the section that becomes the CORO

updates = {}

for k, v in h.items():
    if not isinstance(v, dict) or not v.get('lyrics', ''):
        continue
    cat = (v.get('category', '') or '').lower()
    if 'lento' not in cat and 'rapido' not in cat:
        continue
    lyrics = v['lyrics']
    if '\n\nCORO\n' in lyrics:
        continue
    
    nom = v.get('nomenclature', '?')
    sections = [s.strip() for s in lyrics.split('\n\n') if s.strip()]
    
    if len(sections) < 2:
        continue  # single section, no CORO needed
    
    # For songs with 2 sections where the second is clearly a chorus
    # (different theme, repetitive, or starts differently)
    updates[nom] = {
        'key': k,
        'num_sections': len(sections),
        'sections': sections
    }

print(f'Coros with 2+ sections (candidates for CORO): {len(updates)}')
for nom, info in sorted(updates.items()):
    print(f'  {nom}: {info["num_sections"]} sections')

# Now determine which section index to insert CORO before
# For most 2-section songs: CORO goes before section index 1
# For 3+ section songs: depends on the song structure

# Songs where the chorus is clearly the LAST section
chorus_at_end = []
# Songs where we need manual analysis
needs_analysis = []

for nom, info in updates.items():
    if info['num_sections'] == 2:
        chorus_at_end.append(nom)
    else:
        needs_analysis.append(nom)

print(f'\n2-section songs (CORO before last section): {len(chorus_at_end)}')
print(f'Multi-section songs (need analysis): {len(needs_analysis)}')
for nom in needs_analysis:
    info = updates[nom]
    print(f'  {nom}: {info["num_sections"]} sections')
    for i, s in enumerate(info['sections']):
        first_line = s.split('\n')[0][:50]
        print(f'    [{i}] {first_line}')
