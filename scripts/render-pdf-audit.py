from pathlib import Path
import json, subprocess, sys
from PIL import Image, ImageOps, ImageDraw
sys.stdout.reconfigure(encoding="utf-8")
out = Path(".local/pdf-renders")
out.mkdir(parents=True, exist_ok=True)
cards = []
for path in sorted(Path(".local/references").glob("lesson-*.pdf")):
    prefix = out / path.stem
    subprocess.run([sys.argv[1], "-f", "1", "-singlefile", "-scale-to", "700", "-png", str(path), str(prefix)], check=True, capture_output=True)
    im = Image.open(str(prefix) + ".png").convert("RGB")
    card = Image.new("RGB", (480, 320), "#eef2f6")
    card.paste(ImageOps.contain(im, (456, 282)), (12, 30))
    ImageDraw.Draw(card).text((12, 8), path.stem + " | physical PDF page 1", fill="#111827")
    cards.append(card)
sheet = Image.new("RGB", (1440, 320 * 4), "white")
for i, card in enumerate(cards): sheet.paste(card, ((i % 3) * 480, (i // 3) * 320))
sheet.save(".local/pdf-renders/covers.png")
for item in ["lesson-01", "lesson-02", "lesson-03", "lesson-09", "lesson-10", "lesson-11"]:
    pages = json.loads(Path(".local/references", item + "-pages.json").read_text(encoding="utf-8"))
    print(item)
    for p in pages:
        text = p["text"]
        if any(word in text.lower() for word in ["agent-environment", "markov decision process", "experience replay", "target network", "behaviour cloning", "behavior cloning", "rlhf"]):
            print(p["page"], text[:150].replace("\n", " "))

