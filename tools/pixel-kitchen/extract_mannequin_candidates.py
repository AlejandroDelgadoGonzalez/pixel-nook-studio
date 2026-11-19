"""Rebuild front candidates from the pinned Pixel Kitchen finals."""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "app/pixel-kitchen-preview/queue"
OUT = ROOT / "concept_art/mannequins/candidates"
ARTIFACTS = ROOT / ".artifacts"
BLACK = (0, 0, 0, 255)

# Only the anatomy hidden by hair, clothing or footwear is traced here.
# Visible skin and the selected eye pixels are read directly from the finals.
CANDIDATES = {
    "alice": {
        "filename": "alice-front-v1-final-b6fe29bcbe4040e59142d31cef7d8210.png",
        "skin": {(253, 199, 156, 255): 211, (234, 159, 110, 255): 148},
        "eyes": [(28, 20), (35, 20)],
        "joints": dict(crown=[(32, 9)], neck=[(32, 28)],
                       shoulders=[(26, 33), (38, 33)], elbows=[(24, 38), (40, 38)],
                       wrists=[(22, 42), (42, 42)], waist=[(32, 42)],
                       hips=[(29, 49), (35, 49)], knees=[(28, 53), (36, 53)],
                       ankles=[(28, 57), (36, 57)], bodyRoot=[(32, 59)]),
        "head": [(29, 9), (35, 9), (40, 13), (41, 18), (41, 23),
                 (38, 26), (35, 27), (29, 27), (25, 24), (24, 19), (25, 13)],
        "body": [(29, 26), (35, 26), (35, 29), (39, 31), (40, 35),
                 (37, 39), (37, 43), (39, 48), (37, 51), (27, 51),
                 (25, 48), (27, 43), (27, 39), (24, 35), (25, 31), (29, 29)],
        "arms": [[(25, 32), (28, 34), (25, 39), (23, 43), (21, 43), (22, 37)],
                 [(39, 32), (36, 34), (39, 39), (41, 43), (43, 43), (42, 37)]],
        "legs": [[(27, 49), (31, 49), (30, 56), (31, 59), (25, 59), (25, 57), (26, 55)],
                 [(33, 49), (37, 49), (38, 55), (39, 57), (39, 59), (33, 59), (34, 56)]],
    },
    "odysseus": {
        "filename": "odysseus-front-v1-final-clean.png",
        "skin": {(253, 191, 145, 255): 211},
        "eyes": [(27, 25), (34, 25)],
        "joints": dict(crown=[(31, 13)], neck=[(31, 35)],
                       shoulders=[(25, 39), (38, 39)], elbows=[(23, 43), (41, 43)],
                       wrists=[(21, 47), (42, 47)], waist=[(32, 47)],
                       hips=[(29, 54), (35, 54)], knees=[(28, 57), (36, 57)],
                       ankles=[(27, 60), (37, 60)], bodyRoot=[(32, 62)]),
        "head": [(27, 13), (34, 13), (39, 17), (40, 23), (40, 28),
                 (37, 32), (34, 34), (28, 34), (24, 32), (22, 28), (22, 21), (24, 16)],
        "body": [(28, 32), (34, 32), (35, 36), (40, 39), (38, 46),
                 (39, 51), (37, 55), (26, 55), (24, 51), (26, 46),
                 (24, 39), (28, 36)],
        "arms": [[(25, 38), (28, 39), (24, 44), (22, 49), (19, 49), (19, 46), (21, 41)],
                 [(37, 38), (40, 39), (42, 43), (44, 46), (44, 49), (41, 49), (39, 45)]],
        "legs": [[(26, 53), (31, 53), (30, 58), (31, 62), (23, 62), (23, 60), (26, 57)],
                 [(33, 53), (38, 53), (39, 57), (41, 60), (41, 62), (33, 62), (34, 58)]],
    },
}


def extract(source, spec):
    size = source.size
    mask = Image.new("1", size)
    draw = ImageDraw.Draw(mask)
    for polygon in [spec["head"], spec["body"], *spec["arms"], *spec["legs"]]:
        draw.polygon(polygon, fill=1)

    visible = {}
    for y in range(64):
        for x in range(64):
            shade = spec["skin"].get(source.getpixel((x, y)))
            if shade is not None:
                visible[x, y] = shade
                mask.putpixel((x, y), 1)
                # Include the immediate outline around visible anatomy.
                for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
                    point = (x + dx, y + dy)
                    mask.putpixel(point, 1)

    sprite = Image.new("RGBA", size)
    for y in range(1, 63):
        for x in range(1, 63):
            if not mask.getpixel((x, y)):
                continue
            boundary = any(not mask.getpixel(p) for p in
                           ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
            if (x, y) in visible:
                shade = visible[x, y]
            elif boundary:
                shade = 0
            elif x > 34:
                shade = 148
            else:
                shade = 180
            sprite.putpixel((x, y), (shade, shade, shade, 255))
    for x, y in spec["eyes"]:
        for row in range(y, y + 4):
            for col in range(x, x + 2):
                assert source.getpixel((col, row)) == BLACK
                sprite.putpixel((col, row), BLACK)
    return sprite


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    ARTIFACTS.mkdir(exist_ok=True)
    comparison = Image.new("RGB", (768, 810), "#333747")
    labels = ImageDraw.Draw(comparison)
    for x, title in enumerate(("Approved reference", "Candidate", "50% overlay")):
        labels.text((256*x+8, 7), title, fill="white")
    sprites = []
    manifest = {}
    for row, (name, spec) in enumerate(CANDIDATES.items()):
        path = QUEUE / spec["filename"]
        if name == "alice":
            assert hashlib.sha256(path.read_bytes()).hexdigest() == "b1f433b47ed8eba97bc267115e8686bffe11cde6af2e042968b1a348c8756986"
        if name == "odysseus":
            assert hashlib.sha256(path.read_bytes()).hexdigest() == "e7869cce9797419b2fbbbaa5a2950072827430f5fa257a02879c7a42d87e575c"
        source = Image.open(path).convert("RGBA")
        assert source.size == (64, 64)
        if name == "odysseus":
            assert source.getpixel((41, 8)) == (0, 0, 0, 0)
        candidate = extract(source, spec)
        assert set(candidate.getdata()) == {
            (0, 0, 0, 0), BLACK, (148, 148, 148, 255),
            (180, 180, 180, 255), (211, 211, 211, 255),
        }
        assert candidate.getbbox()[3] == (60 if name == "alice" else 63)
        filename = f"{name}-mannequin-front.png"
        candidate.save(OUT / filename)
        joints = dict(spec["joints"], eyes=spec["eyes"])
        marked = candidate.copy()
        for joint, points in joints.items():
            for point in points:
                assert joint == "bodyRoot" or candidate.getpixel(point)[3] == 255, (name, joint, point)
                marked.putpixel(point, (0, 218, 247, 255))
        marked.save(OUT / f"{name}-mannequin-front-joints.png")
        manifest[f"candidate-{name}"] = {
            "filename": filename,
            "sha256": hashlib.sha256((OUT / filename).read_bytes()).hexdigest(),
            "sourceUrl": path.name,
            "eyeSize": [2, 4],
            "joints": joints,
        }
        sprites.append(candidate)
        guide = candidate.copy()
        guide.putalpha(guide.getchannel("A").point(lambda alpha: alpha // 2))
        for col, frame in enumerate((source, candidate, Image.alpha_composite(source, guide))):
            frame = frame.resize((256, 256), Image.Resampling.NEAREST)
            comparison.paste(frame, (256 * col, 25 + 266 * row), frame)
        labels.text((8, 12 + 266 * row + 256), name.title(), fill="white")

    for col, sprite in enumerate(sprites):
        # Translate only the presentation panel so the two soles share a baseline.
        offset = (63 - sprite.getbbox()[3]) * 4
        frame = sprite.resize((256, 256), Image.Resampling.NEAREST)
        comparison.paste(frame, (256 * col, 550 + offset), frame)
        labels.text((256 * col + 8, 548), ("A - Alice", "B - Odysseus")[col], fill="white")
        labels.line((256 * col, 802, 256 * (col + 1) - 1, 802), fill="#9198ac")
    (OUT / "candidate-rigs.json").write_text(json.dumps(manifest, indent=2) + "\n")
    comparison.save(ARTIFACTS / "mannequin-candidates.png")


if __name__ == "__main__":
    main()
