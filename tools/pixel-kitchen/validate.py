"""Read-only CLI: python -B tools/pixel-kitchen/validate.py bundle.json --root ROOT."""
import argparse
import json
from pathlib import Path
from contracts import validate_bundle

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('bundle', type=Path)
    parser.add_argument('--root', type=Path, required=True)
    args = parser.parse_args()
    try:
        result = validate_bundle(json.loads(args.bundle.read_text(encoding='utf-8-sig')), args.root)
    except (OSError, ValueError) as exc:
        result = dict(valid=False, ready=False, errors=[str(exc)], pending=[])
    print(json.dumps(result, indent=2, ensure_ascii=False))
    raise SystemExit(0 if result['ready'] else 2)
