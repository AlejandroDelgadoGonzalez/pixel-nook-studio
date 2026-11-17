"""Reusable isolated tests; all generated fixtures/reports stay in .artifacts."""
import json
import os
from pathlib import Path
import sys
import unittest
from datetime import datetime, timezone
from uuid import uuid4

if __name__ == '__main__':
    sys.dont_write_bytecode = True
    root=Path(__file__).resolve().parents[2]
    output=root/'.artifacts/pixel-kitchen-contracts'/(datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'-'+uuid4().hex[:8])
    output.mkdir(parents=True)
    os.environ['PIXEL_KITCHEN_TEST_OUTPUT']=str(output)
    suite=unittest.defaultTestLoader.discover(str(Path(__file__).parent/'tests'))
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    report=dict(scope='synthetic-test-only',passed=result.wasSuccessful(),testsRun=result.testsRun,
                failures=[dict(test=str(t),traceback=s) for t,s in result.failures],
                errors=[dict(test=str(t),traceback=s) for t,s in result.errors],
                output=str(output),runtimeTested=False,lanTested=False,realAssetsProcessed=False,
                adoptionWrites=False,syntheticSessionWrites=True)
    (output/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))
    raise SystemExit(0 if result.wasSuccessful() else 1)
