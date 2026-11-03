from PIL import Image
from pathlib import Path

folder = Path(__file__).parent

# Original image
image_path = folder / "services_grid.jpeg"

# Open the image
image = Image.open(image_path).convert("RGB")

# Image dimensions
width, height = image.size

# Grid configuration: 10 rows × 10 columns
rows = 10
cols = 10

# Calculate individual tile dimensions
tile_width = width / cols
tile_height = height / rows

# Create output folder
output_folder = folder / "service_images"
output_folder.mkdir(exist_ok=True)

# Split the image into 100 tiles
for row in range(rows):
    for col in range(cols):

        # Calculate crop boundaries
        left = round(col * tile_width)
        top = round(row * tile_height)
        right = round((col + 1) * tile_width)
        bottom = round((row + 1) * tile_height)

        # Crop individual service image
        cropped_image = image.crop(
            (left, top, right, bottom)
        )

        # Generate image number
        image_number = row * cols + col + 1

        # Create filename
        filename = f"service_{image_number:03d}.png"

        # Save image
        output_path = output_folder / filename
        cropped_image.save(output_path)

        print(f"Created: {filename}")

print("\nSuccessfully created all 100 service images!")
print(f"Images saved in: {output_folder}")