import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

coros = data['coros']

# Analyze patterns for CORO detection
patterns = {
    'parentheses': 0,      # Sections in (parentheses)
    'repeated_stanza': 0,  # Last stanza same as first
    'short_last': 0,       # Last stanza shorter than others
    'all_caps_last': 0,    # Last section all caps with exclamation
}

for c in coros:
    lyrics = c.get('lyrics', '') or ''
    stanzas = [s.strip() for s in lyrics.split('\n\n') if s.strip()]
    
    if len(stanzas) < 2:
        continue
    
    # Check for parentheses in any stanza
    for s in stanzas:
        if s.startswith('(') and s.endswith(')'):
            patterns['parentheses'] += 1
            break
    
    # Check if last stanza repeats first
    first = stanzas[0].strip()
    last = stanzas[-1].strip()
    if first == last:
        patterns['repeated_stanza'] += 1
    
    # Check if last stanza is significantly shorter
    first_lines = len([l for l in first.split('\n') if l.strip()])
    last_lines = len([l for l in last.split('\n') if l.strip()])
    if last_lines < first_lines * 0.5 and last_lines <= 4:
        patterns['short_last'] += 1

print("Pattern analysis:")
for k, v in patterns.items():
    print(f"  {k}: {v}")

# Show examples with parentheses
print("\n=== EXAMPLES WITH PARENTHESES ===")
count = 0
for c in coros:
    lyrics = c.get('lyrics', '') or ''
    if '(' in lyrics:
        print(f"\n{c['code']} - {c['title']}")
        print(lyrics[:400])
        count += 1
        if count >= 5:
            break

# Show examples with repeated first/last stanza
print("\n=== EXAMPLES WITH REPEATED STANZAS ===")
count = 0
for c in coros:
    lyrics = c.get('lyrics', '') or ''
    stanzas = [s.strip() for s in lyrics.split('\n\n') if s.strip()]
    if len(stanzas) >= 2 and stanzas[0] == stanzas[-1]:
        print(f"\n{c['code']} - {c['title']}")
        print(lyrics[:400])
        count += 1
        if count >= 3:
            break
