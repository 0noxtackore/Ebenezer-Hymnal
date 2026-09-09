import re
import json

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026-raw.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

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
ROMAN_RE = re.compile(r'^(I{1,3}|IV|V|VI{0,3}|IX|X{1,3}|XI{0,3}|XIV|XV|XVI{0,3}|XIX|XX{1,3}|XXI{0,3}|XXIV|XXV|XXVI{0,3}|XXIX|XXX)\s*\.?\s*$', re.IGNORECASE)

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

def structure_lyrics(raw):
    """Parse lyrics and insert CORO markers."""
    raw = raw.strip()
    raw = re.sub(r'\s*\(BIS\)\s*', '', raw, flags=re.IGNORECASE)
    raw = re.sub(r'\n{3,}', '\n\n', raw)
    
    lines = raw.split('\n')
    
    result_lines = []
    i = 0
    in_parens = False
    parens_buf = []
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Empty line
        if not line:
            result_lines.append('')
            i += 1
            continue
        
        # Check if line is just "CORO"
        if line.upper() == 'CORO':
            result_lines.append('')
            result_lines.append('CORO')
            i += 1
            continue
        
        # Check if line starts with roman numeral
        if ROMAN_RE.match(line):
            result_lines.append('')
            result_lines.append(line)
            i += 1
            continue
        
        # Check for opening paren
        if line.startswith('(') and not line.endswith(')'):
            # Multi-line paren block
            in_parens = True
            parens_buf = [line[1:].strip()]  # Remove opening paren
            i += 1
            continue
        
        if in_parens:
            if line.endswith(')'):
                parens_buf.append(line[:-1].strip())
                in_parens = False
                # Output as CORO
                result_lines.append('')
                result_lines.append('CORO')
                for pl in parens_buf:
                    result_lines.append(pl)
                parens_buf = []
            else:
                parens_buf.append(line)
            i += 1
            continue
        
        # Check for single-line paren block: (TEXT)
        if line.startswith('(') and line.endswith(')'):
            result_lines.append('')
            result_lines.append('CORO')
            result_lines.append(line[1:-1].strip())
            i += 1
            continue
        
        # Regular line
        result_lines.append(line)
        i += 1
    
    # Clean up multiple blank lines
    cleaned = []
    prev_blank = False
    for l in result_lines:
        if l == '':
            if not prev_blank:
                cleaned.append(l)
            prev_blank = True
        else:
            cleaned.append(l)
            prev_blank = False
    
    return '\n'.join(cleaned).strip()

# Process
fixed_count = 0
for c in coros:
    original = c['lyrics']
    structured = structure_lyrics(original)
    if structured != original:
        c['lyrics'] = structured
        fixed_count += 1

print(f"Fixed: {fixed_count}/{len(coros)}")

# Count CORO blocks
with_coro = sum(1 for c in coros if '\nCORO\n' in c['lyrics'] or c['lyrics'].startswith('CORO\n'))
print(f"With CORO block: {with_coro}")

# Show examples
print("\n=== EXAMPLES ===")
count = 0
for c in coros:
    if '\nCORO\n' in c['lyrics'] or c['lyrics'].startswith('CORO\n'):
        print(f"\n{c['code']} ({c['musicKey']} {c['speed']})")
        print(c['lyrics'][:500])
        print("---")
        count += 1
        if count >= 8:
            break

# Save
with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json", "w", encoding="utf-8") as f:
    json.dump({'source': 'COROS 2026.pdf', 'total': len(coros), 'coros': coros}, f, ensure_ascii=False, indent=2)

# Also regenerate coros-upload.json with correct fields
upload = []
for c in coros:
    upload.append({
        'id': f"auto_{c['code']}",
        'number': c['number'],
        'title': c['code'],
        'category': c['category'],
        'musicKey': c['musicKey'],
        'scale': c['scale'],
        'nomenclature': c['code'],
        'lyrics': c['lyrics'],
        'audioUrl': '',
        'imageUrl': '',
    })

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-upload.json", "w", encoding="utf-8") as f:
    json.dump(upload, f, ensure_ascii=False, indent=2)

print(f"\nSaved coros-2026.json and coros-upload.json")
