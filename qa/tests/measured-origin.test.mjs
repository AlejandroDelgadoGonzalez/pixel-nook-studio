import test from 'node:test';
import assert from 'node:assert/strict';
import {measuredOrigin} from '../checks/depth-and-simultaneity.mjs';
test('legacy bottom-center remains the default',()=>assert.deepEqual(measuredOrigin(),[.5,1]));
test('a measured raised shoe is derived from its actual source cut',()=>assert.deepEqual(measuredOrigin({sourceBoundsExclusive:[10,20,110,220],sourceAnchor:[30,170],origin:[.2,.75]}),[.2,.75]));
test('a declared origin cannot disagree with the source shoe pin',()=>assert.equal(measuredOrigin({sourceBoundsExclusive:[10,20,110,220],sourceAnchor:[30,170],origin:[.5,1]}),null));
test('pins outside the crop and invalid numeric data fail',()=>{
 assert.equal(measuredOrigin({sourceBoundsExclusive:[10,20,110,220],sourceAnchor:[0,170],origin:[-.1,.75]}),null);
 assert.equal(measuredOrigin({sourceBoundsExclusive:[10,20,10,220],sourceAnchor:[10,170],origin:[0,.75]}),null);
 assert.equal(measuredOrigin({sourceBoundsExclusive:[10,20,110,220],sourceAnchor:[NaN,170],origin:[.2,.75]}),null);
});
