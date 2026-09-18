from pathlib import Path
from pypdf import PdfReader
import json

root = Path(".local/references")
out = []
for path in sorted(root.glob("lesson-*.pdf")):
    reader = PdfReader(path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({"page": i + 1, "text": text})
    (root / (path.stem + "-pages.json")).write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
    out.append({"id": path.stem, "pageCount": len(pages), "pagesWithText": sum(bool(p["text"].strip()) for p in pages), "cover": pages[0]["text"][:600]})
Path("evidence/task-00-01/pdf-inspection.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(out, ensure_ascii=True, indent=2))

