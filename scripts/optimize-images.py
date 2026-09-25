from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
names = ['hero_moving_service_1790153159353', 'service_craft_protection_1790153177359', 'office_move_logistics_1790153527033', 'storage_warehouse_facility_1790153540073', 'furniture_lift_exterior_1790153551793']
before = after = 0
for name in names:
    source = root / 'src/assets/images' / (name + '.jpg')
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.convert('RGB').save(target, 'WEBP', quality=82, method=6)
    before += source.stat().st_size
    after += target.stat().st_size
    for file in (root / 'src').rglob('*'):
        if file.suffix in ['.ts', '.tsx']:
            text = file.read_text(encoding='utf-8-sig')
            if name + '.jpg' in text:
                file.write_text(text.replace(name + '.jpg', name + '.webp'), encoding='utf-8')
print(f'5 images: {before:,} -> {after:,} bytes ({(1-after/before)*100:.1f}% smaller); original dimensions retained.')
