import PyPDF2
import json
import re
import sys

pdf_path = r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\pdf-files\COROS 2026.pdf"
output_path = r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026.json"

reader = PyPDF2.PdfReader(pdf_path)
full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n"

# Save raw text for inspection
raw_path = r"C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-2026-raw.txt"
with open(raw_path, "w", encoding="utf-8") as f:
    f.write(full_text)

print(f"Total pages: {len(reader.pages)}")
print(f"Raw text saved to: {raw_path}")
print(f"Text length: {len(full_text)} chars")
print("")
print("=== FIRST 3000 CHARS ===")
print(full_text[:3000])
