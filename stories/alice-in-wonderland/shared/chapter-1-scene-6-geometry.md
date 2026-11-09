# S6 revised measured geometry / Gates1 and2A only

Gates1/2A approved29Oct2026; S6 is implemented. Original panorama, fixed S5 camera and standard lower caption retained. Runtime evidence is in .artifacts/qa/alice-in-wonderland/pool-of-tears/.

|Anchor|Source x,y|World x,y|
|---|---|---|
|alice|[915, 720]|[1830, 1440]|
|rabbitStart|[760, 535]|[1520, 1070]|
|rabbitThreshold|[750, 478]|[1500, 956]|
|rabbitInside|[750, 450]|[1500, 900]|
|glovesFloor|[740, 544]|[1480, 1088]|
|fanLanding|[758.2491666666666, 578.5491666666667]|[1516.4983333333332, 1157.0983333333334]|
|fanRest|[809, 590]|[1618, 1180]|
|waterEntry|[800, 722]|[1600, 1444]|
|aliceFloat|[825, 724]|[1650, 1448]|
|aliceClose|[838, 724]|[1676, 1448]|
|mouse|[794, 724]|[1588, 1448]|
|alicePickup|[815, 590]|[1630, 1180]|
|aliceShrink|[815, 590]|[1630, 1180]|
|aliceSwim|[850, 724]|[1700, 1448]|
|mouseEntry|[750, 724]|[1500, 1448]|

Alice:1.50 ->0.85 ->0.32. Beat6=5.6s, Mouse absent.
Giant route:915,720 ->951,720 ->951,590 ->815,590; walk235, body1.50, measured1.616s. Pickup facesleft.
Tiny route:815,590 ->744,590 ->744,720 ->800,722; walk235, body0.32, measured6.308s. No furniture crossing.
Fan falls nearRabbit to758.249,578.549; never crosses table. Gloves remain740,544.
Expanded water source bounds735,684,1005,740; water below furniture and floor props. Lagoon fully formed during S5 cry and inherited unchanged; no legacy small-pool overlay.
Mouse entry only11–12:750,724 ->794,724 in3.5s; physical gain1.4, no miniature human factor.
Closing swim850,724 ->838,724 in3s; Mouse794,724;88worldpx centre separation.
Static table1380; resting tabletop props1381. Box open undercentre, bottle/gloves/fan stationary after release.

Automatic budget 64.549s; maximum beat7.72s. Actual runtime verification deferred.

## Authorized correction29Oct2026
Rabbit exit now uses walk235, full-foot startled crop364x570→78x122. Door ordering keeps Rabbit in front while waiting/opening and behind the leaf while entering/closing; closed mask persists until actor absence. Moment8 speaks at rest; original6307.716ms Alice route now starts only after the click, before slip. Mouse enters only after Moment11, from measured left rock sourcebounds645,602,680,632 (origin662,618), on a right-facing diagonal to794,724 at constant walk140, then300ms afloat. Mandatory routes are text-free; all previous dialogue and pauses preserved.
