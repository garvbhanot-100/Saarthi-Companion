from pathlib import Path
from PIL import Image

# Master image and output folder
BASE_DIR = Path(__file__).parent
SHEET_PATH=(
    BASE_DIR
    /"assets"
    /"images"
    /"images-2"
    /"service-logo-sheet.png"
)

OUTPUT_DIR = (
    BASE_DIR
    / "artifacts"
    / "saarthi-ai"
    / "assets"
    / "images"
    / "service-logos"
)

# The sheet contains 100 logos arranged in 10 columns x 10 rows.
COLUMNS = 10
ROWS = 10

def main():
    if not SHEET_PATH.exists():
        print(f"Image not found: {SHEET_PATH}")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with Image.open(SHEET_PATH) as image:
        image = image.convert("RGB")
        width, height = image.size
        cell_width = width / COLUMNS
        cell_height = height / ROWS

        for index in range(100):
            row, column = divmod(index, COLUMNS)

            left = round(column * cell_width)
            top = round(row * cell_height)
            right = round((column + 1) * cell_width)
            bottom = round((row + 1) * cell_height)

            logo = image.crop((left, top, right, bottom))
            logo.save(
                OUTPUT_DIR / f"service-{index + 1:03d}.png"
            )

    print("Done! Cropped 100 service logos.")
    print(f"Saved in: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()