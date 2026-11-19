"""Validate a native human pose PNG and its measured joint coordinates."""
import argparse
import json
import math
from pathlib import Path

from PIL import Image

LIBRARY = Path(__file__).resolve().parents[2] / "concept_art/mannequins/human"


def validate(image, joints, reference):
    if image.size != (64, 64) or image.mode != "RGBA":
        raise ValueError("Expected a native RGBA 64x64 pose")
    if set(image.getchannel("A").getdata()) - {0, 255}:
        raise ValueError("Alpha must be binary")
    if set(joints) != set(reference["joints"]):
        raise ValueError("Incomplete joint set")
    for name, points in joints.items():
        if len(points) != len(reference["joints"][name]):
            raise ValueError(name)
        for x, y in points:
            if not (0 <= x < 64 and 0 <= y < 64):
                raise ValueError(name)
            if name != "bodyRoot" and not image.getpixel((int(x), int(y)))[3]:
                raise ValueError(f"{name} outside silhouette")
    for segment, lengths in reference["segmentLengths"].items():
        start, end = segment.split("-")
        for i, length in enumerate(lengths):
            a = joints[start][min(i, len(joints[start])-1)]
            if not math.isclose(math.dist(a, joints[end][i]), length, abs_tol=1e-6):
                raise ValueError(f"Changed segment {segment}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path)
    parser.add_argument("pose", type=Path, help="JSON with view and joints")
    args = parser.parse_args()
    pose = json.loads(args.pose.read_text())
    rig = json.loads((LIBRARY / "mannequin-rig.json").read_text())
    validate(Image.open(args.image), pose["joints"], rig["views"][pose["view"]])
