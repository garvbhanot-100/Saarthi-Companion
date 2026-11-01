from PIL import Image
from pathlib import Path


project_dir = Path(__file__).resolve().parent
sheet_path = project_dir / "Saarthi-icon-sheet.png" / "Saarthi ai  images all.jpeg"
output = project_dir / "assets" / "images" / "service-logos"

if not sheet_path.is_file():
    raise FileNotFoundError(f"Contact sheet image not found: {sheet_path}")

with Image.open(sheet_path) as source:
    sheet = source.convert("RGB")

output.mkdir(parents=True, exist_ok=True)
width, height = sheet.size

for row in range(7):
    for col in range(7):
        bounds = (
            round(col * width / 7),
            round(row * height / 7),
            round((col + 1) * width / 7),
            round((row + 1) * height / 7),
        )
        number = row * 7 + col + 1
        sheet.crop(bounds).save(output / f"service-{number:02}.png")

print(f"Success! 49 icons created in {output}")