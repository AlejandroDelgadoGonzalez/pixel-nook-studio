"""Read-only Pixel Kitchen v1 validation. No NookForge imports or adoption writes."""
import hashlib
import io
import json
import math
from pathlib import Path

from jsonschema import Draft202012Validator
from PIL import Image

SCHEMA = json.loads((Path(__file__).parent / 'schemas/v1/contracts.schema.json').read_text())
SIZES = {'character': [64, 64], 'object': [32, 32], 'scene': [640, 360], 'panorama': [1080, 360]}
PROFILES = dict(zip(SIZES, ['character-64/v1', 'object-32/v1', 'scene-640/v1', 'panorama-1080/v1']))


def digest(record):
    """Canonical document hash, distinct from the PNG byte hash."""
    return hashlib.sha256(json.dumps(record, sort_keys=True, separators=(',', ':'),
                                     ensure_ascii=False, allow_nan=False).encode()).hexdigest()


def reference(record):
    return dict(id=record['id'], revision=record['revision'], sha256=digest(record))


class Validation:
    def __init__(self, bundle, root):
        self.bundle, self.root = bundle, Path(root).resolve()
        self.errors, self.pending, self.index, self.images = [], [], {}, {}
        self.done, self.visiting = set(), set()

    def error(self, r, message):
        self.errors.append(f"{r.get('id', 'bundle')}@{r.get('revision', '?')}: {message}")

    def wait(self, r, field):
        self.pending.append(f"{r['id']}@{r['revision']}: {field}")

    def ref(self, owner, value, types, same_asset=True):
        if value is None:
            self.wait(owner, 'missing ' + '/'.join(types) + ' reference')
            return None
        target = self.index.get((value['id'], value['revision']))
        if target is None:
            self.error(owner, 'reference not found: ' + value['id'] + '@' + value['revision'])
            return None
        if target['recordType'] not in types:
            self.error(owner, 'wrong reference type: ' + target['recordType'])
            return None
        if value['sha256'] is None:
            self.wait(owner, 'reference hash unknown: ' + value['id'])
        elif value['sha256'] != digest(target):
            self.error(owner, 'reference document hash mismatch: ' + value['id'])
        if owner['scope'] != target['scope']:
            self.error(owner, 'project and synthetic scopes must not mix')
        if same_asset and (owner['assetId'], owner['assetType']) != (target['assetId'], target['assetType']):
            self.error(owner, 'asset identity/type mismatch')
        self.visit(target)
        return target

    def image(self, r):
        desc = r['image']
        if any(desc[k] is None for k in desc):
            self.wait(r, 'image path/hash/dimensions unknown')
            return None
        path = Path(desc['path'])
        resolved = (self.root / path).resolve()
        if path.is_absolute() or not resolved.is_relative_to(self.root):
            self.error(r, 'image path must be relative and confined to root')
            return None
        try:
            raw = resolved.read_bytes()
            if hashlib.sha256(raw).hexdigest() != desc['sha256']:
                self.error(r, 'PNG byte hash mismatch')
            with Image.open(io.BytesIO(raw)) as im:
                if im.format != 'PNG':
                    self.error(r, 'image is not PNG')
                if list(im.size) != desc['dimensions']:
                    self.error(r, 'actual image dimensions differ from descriptor')
                rgba = im.convert('RGBA').copy()
            self.images[(r['id'], r['revision'])] = rgba
            return rgba
        except (OSError, ValueError) as exc:
            self.error(r, 'unreadable image: ' + str(exc))
            return None

    def unknowns(self, r, value, path=''):
        if value is None:
            self.wait(r, path + ' unknown')
        elif isinstance(value, dict):
            for k, v in value.items():
                self.unknowns(r, v, path + '/' + k)
        elif isinstance(value, list):
            for i, v in enumerate(value):
                self.unknowns(r, v, path + '/' + str(i))

    def geometry(self, r, g):
        self.unknowns(r, g, 'geometry')
        if g['canvas'] is not None and g['canvas'] != SIZES[r['assetType']]:
            self.error(r, 'incorrect canvas for asset type')
        if any(v is None for v in g.values()):
            return
        w, h = SIZES[r['assetType']]
        def point(p):
            return 0 <= p[0] <= w and 0 <= p[1] <= h
        if not point(g['root']):
            self.error(r, 'root outside canvas boundary')
        for group in ['supports', 'contacts', 'protectedRegions']:
            ids = [v['id'] for v in g[group]]
            if len(ids) != len(set(ids)):
                self.error(r, 'duplicate geometry IDs in ' + group)
        for pin in g['supports'] + g['contacts']:
            if not point(pin['point']):
                self.error(r, 'pin point outside canvas')
            for x, y in pin['pixels']:
                if not (0 <= x < w and 0 <= y < h):
                    self.error(r, 'pin pixel outside canvas')
            if not any(x <= pin['point'][0] <= x+1 and y <= pin['point'][1] <= y+1
                       for x, y in pin['pixels']):
                self.error(r, 'pin point does not touch its declared pixels')
        for region in g['protectedRegions']:
            x, y, right, bottom = region['rect']
            if not (0 <= x < right <= w and 0 <= y < bottom <= h):
                self.error(r, 'invalid exclusive protected rectangle')

    def native(self, r, im):
        if im is None:
            return
        if list(im.size) != SIZES[r['assetType']]:
            self.error(r, 'incorrect physical PNG canvas')
            return
        alphas = set(im.getchannel('A').get_flattened_data()) if hasattr(im, 'get_flattened_data') else set(im.getchannel('A').getdata())
        if not alphas <= {0, 255}:
            self.error(r, 'non-binary native alpha')
        if r['assetType'] in ('scene', 'panorama') and alphas != {255}:
            self.error(r, 'scene/panorama must be opaque')
        g = r['geometry']
        if g['contacts'] is not None and g['supports'] is not None:
            for pin in g['contacts'] + g['supports']:
                for x, y in pin['pixels']:
                    if 0 <= x < im.width and 0 <= y < im.height and im.getpixel((x, y))[3] != 255:
                        self.error(r, 'support/contact pixel is not opaque')

    def equal_geometry(self, r, base):
        for field in ['canvas', 'root', 'transform', 'supports', 'contacts', 'protectedRegions']:
            if r['geometry'][field] != base['geometry'][field]:
                self.error(r, 'geometry changed: ' + field)

    def protected(self, r, base):
        a = self.images.get((base['id'], base['revision']))
        b = self.images.get((r['id'], r['revision']))
        if a is None or b is None or a.size != b.size:
            return
        g = base['geometry']
        for group in ['contacts', 'supports']:
            for pin in g[group] or []:
                for x, y in pin['pixels']:
                    if 0 <= x < a.width and 0 <= y < a.height and a.getpixel((x,y)) != b.getpixel((x,y)):
                        self.error(r, 'protected contact/support RGBA changed')
        for region in g['protectedRegions'] or []:
            rect = region['rect']
            if not (0 <= rect[0] < rect[2] <= a.width and 0 <= rect[1] < rect[3] <= a.height):
                # Geometry validation already reports this; never crop an invalid rectangle.
                continue
            if a.crop(rect).tobytes() != b.crop(rect).tobytes():
                self.error(r, 'protected region RGBA changed: ' + region['id'])

    def mapped_root(self, r, point, transform, target):
        self.unknowns(r, {'sourceRoot': point, 'transform': transform, 'targetRoot': target})
        if point is None or target is None or transform is None or any(v is None for v in transform.values()):
            return
        mapped = [point[i] * transform['scale'] + transform['offset'][i] for i in range(2)]
        if any(not math.isclose(a, b, abs_tol=1e-9, rel_tol=0) for a, b in zip(mapped, target)):
            self.error(r, 'source-to-cell root mapping mismatch')

    def source_root(self, r, source, point):
        if source and point is not None:
            im = self.images.get((source['id'], source['revision']))
            if im and not (0 <= point[0] <= im.width and 0 <= point[1] <= im.height):
                self.error(r, 'root outside source image boundary')

    def visit(self, r):
        key = (r['id'], r['revision'])
        if key in self.done:
            return
        if key in self.visiting:
            self.error(r, 'cyclic reference')
            return
        self.visiting.add(key)
        for item in r['pending']:
            self.wait(r, item['field'] + ': ' + item['reason'])
        kind = r['recordType']
        if kind == 'source':
            self.image(r)
            self.unknowns(r, {'view': r['view'], 'poseId': r['poseId']})
            for value in r['references']:
                self.ref(r, value, ['source'], same_asset=False)
            state = r['review']['state']
            if state == 'draft' or r['review']['receiptId'] is None:
                self.wait(r, 'source review pending')
            if state == 'test-reviewed' and r['scope'] != 'synthetic-test':
                self.error(r, 'test review cannot approve project source')
            if state == 'approved' and r['scope'] == 'synthetic-test':
                self.error(r, 'synthetic source must not claim real approval')
        elif kind == 'body':
            if r['assetType'] != 'character':
                self.error(r, 'body is only for characters')
            self.unknowns(r, r['measures'], 'measures')
            if any(v is not None and v > 64 for v in r['measures'].values()):
                self.error(r, 'target body measure exceeds character canvas')
            if r['root'] is not None and not all(0 <= v <= 64 for v in r['root']):
                self.error(r, 'body root outside target canvas')
            for view in ['front', 'side', 'back']:
                src = self.ref(r, r['masters'][view], ['source'])
                v = r['views'][view]
                if src and src['view'] != view:
                    self.error(r, 'master view mismatch: ' + view)
                if v is None:
                    self.wait(r, 'body view unknown: ' + view)
                    continue
                self.mapped_root(r, v['sourceRoot'], v['transform'], r['root'])
                self.source_root(r, src, v['sourceRoot'])
                self.height(r, v['bodyHeightInSource'], v['transform'], r['measures']['standingBodyHeight'])
        elif kind == 'pose':
            src = self.ref(r, r['source'], ['source'])
            self.geometry(r, r['geometry'])
            self.unknowns(r, {'view': r['view'], 'poseId': r['poseId']})
            if src and (src['view'], src['poseId']) != (r['view'], r['poseId']):
                self.error(r, 'pose/source identity mismatch')
            self.mapped_root(r, r['sourceRoot'], r['geometry']['transform'], r['geometry']['root'])
            self.source_root(r, src, r['sourceRoot'])
            if r['assetType'] == 'character':
                body = self.ref(r, r['bodyReference'], ['body'])
                if body:
                    if body['root'] is not None and r['geometry']['root'] is not None and body['root'] != r['geometry']['root']:
                        self.error(r, 'pose root differs from stable body root')
                    self.height(r, r['bodyHeightInSource'], r['geometry']['transform'], body['measures']['standingBodyHeight'])
            elif r['bodyReference'] is not None:
                self.error(r, 'non-character body reference must be null (not applicable)')
        elif kind == 'cook':
            src = self.ref(r, r['source'], ['source'])
            pose = self.ref(r, r['pose'], ['pose'])
            self.geometry(r, r['geometry'])
            self.native(r, self.image(r))
            self.unknowns(r, {'profile': r['profile'], 'engineVersion': r['engineVersion']})
            self.unknowns(r, r['parameters'], 'parameters')
            if r['profile'] is not None and r['profile'] != PROFILES[r['assetType']]:
                self.error(r, 'profile/type mismatch')
            if pose:
                self.equal_geometry(r, pose)
                if r['source'] != pose['source']:
                    self.error(r, 'Cook source differs from pose source')
        elif kind == 'retouch':
            parent = self.ref(r, r['parent'], ['cook', 'retouch'])
            edited = self.ref(r, r['editedFrom'], ['cook', 'retouch'])
            compare = self.ref(r, r['comparisonBase'], ['cook', 'retouch'])
            cook = self.ref(r, r['cookBase'], ['cook'])
            self.geometry(r, r['geometry'])
            self.native(r, self.image(r))
            if r['parent'] != r['editedFrom']:
                self.error(r, 'editedFrom must pin the exact parent in v1')
            for base in [parent, cook]:
                if base:
                    self.equal_geometry(r, base)
                    self.protected(r, base)
            if parent and cook:
                actual_cook = reference(parent) if parent['recordType'] == 'cook' else parent['cookBase']
                if actual_cook != r['cookBase']:
                    self.error(r, 'Cook lineage mismatch')
                expected_comparison = reference(parent) if parent['recordType'] == 'cook' or parent.get('stage') == 'chef' else parent['comparisonBase']
                if r['comparisonBase'] != expected_comparison:
                    self.error(r, 'wrong comparison base (nearest Chef or Cook)')
            if compare:
                a = self.images.get((compare['id'], compare['revision']))
                b = self.images.get(key)
                if r['changes'] is None:
                    self.wait(r, 'diff changes unknown')
                elif a and b and a.size == b.size:
                    expected = {(x, y): (list(a.getpixel((x,y))), list(b.getpixel((x,y))))
                                for y in range(a.height) for x in range(a.width) if a.getpixel((x,y)) != b.getpixel((x,y))}
                    supplied = {(v['x'], v['y']): (v['before'], v['after']) for v in r['changes']}
                    if supplied != expected or len(supplied) != len(r['changes']):
                        self.error(r, 'diff is not the exact decoded RGBA comparison')
            if r['status'] != 'draft':
                decision = 'simulated' if r['scope'] == 'synthetic-test' else 'approved'
                status = 'test-approved' if r['scope'] == 'synthetic-test' else 'approved'
                if r['status'] != status or not r['approval'] or r['approval']['decision'] != decision:
                    self.error(r, 'approval status/scope mismatch')
            elif r['approval'] is not None:
                self.error(r, 'draft cannot carry approval')
        elif kind == 'consumer':
            current = self.ref(r, r['current'], ['cook', 'retouch'])
            self.geometry(r, r['geometry'])
            if current:
                self.equal_geometry(r, current)
                if current['recordType'] == 'retouch' and current['status'] == 'draft':
                    self.wait(r, 'consumer current points to unapproved retouch')
        elif kind == 'adoption':
            self.ref(r, r['consumer'], ['consumer'])
            self.ref(r, r['expectedCurrent'], ['cook', 'retouch'])
            self.ref(r, r['candidate'], ['retouch'])
            if r['status'] == 'pending':
                self.wait(r, 'adoption pending')
                if r['compatibility'] != 'pending':
                    self.error(r, 'pending adoption cannot claim compatibility success')
            if r['status'] == 'blocked' and r['compatibility'] == 'compatible':
                self.error(r, 'blocked adoption cannot claim compatibility success')
        self.visiting.remove(key)
        self.done.add(key)

    def height(self, r, source_height, transform, target_height):
        self.unknowns(r, {'bodyHeightInSource': source_height, 'targetBodyHeight': target_height})
        if source_height is not None and target_height is not None and transform and transform['scale'] is not None:
            if not math.isclose(source_height * transform['scale'], target_height, abs_tol=1e-9, rel_tol=0):
                self.error(r, 'body height scale mismatch (not foreground bbox height)')

    def assessment(self, consumer, candidate, expected):
        errors = list(self.errors)
        pending = list(self.pending)
        if not consumer or not candidate or not expected:
            pending.append('adoption references unresolved')
        else:
            if consumer['current'] != expected:
                errors.append('stale editing/adoption base: consumer current changed')
            active = self.index.get((expected['id'], expected['revision']))
            if candidate['status'] not in ('approved', 'test-approved'):
                pending.append('candidate final is not approved')
            if active and (candidate['assetId'], candidate['assetType']) != (active['assetId'], active['assetType']):
                errors.append('candidate belongs to another asset')
            if active and candidate['geometry'] != consumer['geometry']:
                errors.append('candidate incompatible with consumer geometry')
            if active:
                active_cook = reference(active) if active['recordType'] == 'cook' else active['cookBase']
                if active_cook != candidate['cookBase']:
                    errors.append('candidate and consumer use different Cook lineages')
        return dict(compatible=not errors and not pending, errors=errors, pending=sorted(set(pending)))

    def run(self):
        for e in Draft202012Validator(SCHEMA).iter_errors(self.bundle):
            self.errors.append('schema ' + '/'.join(map(str, e.absolute_path)) + ': ' + e.message)
        # Reject NaN/Infinity, including arbitrary Cook parameters (Python JSON accepts them).
        try:
            digest(self.bundle)
        except (ValueError, TypeError) as exc:
            self.errors.append('non-JSON/non-finite data: ' + str(exc))
        if self.errors:
            return self.result()
        for r in self.bundle['records']:
            key = (r['id'], r['revision'])
            if key in self.index:
                self.error(r, 'duplicate ID/revision; never choose by mtime')
            self.index[key] = r
        if self.errors:
            return self.result()
        for r in self.bundle['records']:
            self.visit(r)
        for r in self.bundle['records']:
            if r['recordType'] == 'adoption':
                consumer = self.index.get((r['consumer']['id'], r['consumer']['revision'])) if r['consumer'] else None
                candidate = self.index.get((r['candidate']['id'], r['candidate']['revision'])) if r['candidate'] else None
                if consumer and consumer['recordType'] != 'consumer' or candidate and candidate['recordType'] != 'retouch':
                    continue
                verdict = self.assessment(consumer, candidate, r['expectedCurrent'])
                if r['compatibility'] == 'compatible' and not verdict['compatible']:
                    self.error(r, 'false compatibility claim')
                if r['status'] in ('adopted', 'simulated-adopted'):
                    required = 'simulated-adopted' if r['scope'] == 'synthetic-test' else 'adopted'
                    if not verdict['compatible'] or r['status'] != required or r['compatibility'] != 'compatible':
                        self.error(r, 'false adoption claim')
        return self.result()

    def result(self):
        return dict(valid=not self.errors, ready=not self.errors and not self.pending,
                    errors=sorted(set(self.errors)), pending=sorted(set(self.pending)),
                    scope='isolated-contract-validation; no files adopted')


def validate_bundle(bundle, root):
    return Validation(bundle, root).run()


def check_adoption(bundle, root, consumer_ref, candidate_ref, expected_current):
    validator = Validation(bundle, root)
    result = validator.run()
    if not result['ready']:
        return dict(compatible=False, errors=result['errors'], pending=result['pending'])
    # Resolve caller-supplied pins as well, rather than trusting IDs alone.
    owner = next(iter(validator.index.values()))
    consumer = validator.ref(owner, consumer_ref, ['consumer'], same_asset=False)
    candidate = validator.ref(owner, candidate_ref, ['retouch'], same_asset=False)
    validator.ref(owner, expected_current, ['cook', 'retouch'], same_asset=False)
    if consumer and consumer['recordType'] != 'consumer' or candidate and candidate['recordType'] != 'retouch':
        return dict(compatible=False, errors=validator.errors, pending=validator.pending)
    return validator.assessment(consumer, candidate, expected_current)
