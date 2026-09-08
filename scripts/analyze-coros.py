import re
from collections import Counter

with open(r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026-raw.txt", "r", encoding="utf-8") as f:
    text = f.read()

codes = re.findall(r'^([A-Z]+\d+)\s*$', text, re.MULTILINE)
print(f"Total codes: {len(codes)}")

prefix_counts = Counter()
for c in codes:
    prefix = re.match(r'^([A-Z]+)', c).group(1)
    prefix_counts[prefix] += 1

for k, v in sorted(prefix_counts.items()):
    print(f"  {k}: {v}")

print("")
print("First 20:", codes[:20])
print("Last 20:", codes[-20:])
