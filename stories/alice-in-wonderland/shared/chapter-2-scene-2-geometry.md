# MEASURED ART BOARD / C2-S2 — estado implementado

Guion/arte aprobados con los tres ajustes solicitados. Compuertas3/4 completadas en el hilo principal.

Panorama1672×941, base16:9 [196,110,1476,830] de1280×720. Márgenes196px laterales,110px arriba y111px abajo; overscan1,30625× horizontal/1,30694× vertical. Mapeo uniforme fuente/mundo1:1. El interior del arco muestra piedra/tierra en sombra profunda; el original editado se conserva en dark-arch-original.png. Normalización2×2 mediante qa/pixel_density.py.

La cámara mantiene el grupo y circuito centrados en16:9 y9:16. Conserva el detalle cercano oficial; en horizontal aumenta el zoom necesario para cubrir el borde del lienzo. Solo hay paneo continuo durante la llegada muda; luego conserva(x,y,z) para cada tamaño. Nunca se desplaza la interfaz para despejar cuerpos. Los formatos ultrapanorámicos priorizan cobertura real del lienzo.

|Viewport|Cámara x|Cámara y|Zoom z|
|---|---|---|---|
|360×800|500.000000|545.651163|1.011764706|
|390×844|500.000000|550.000000|1.100000000|
|430×932|500.000000|550.000000|1.217647059|
|1366×640|500.000000|550.680820|1.422916667|
|1920×1080|500.000000|550.000000|2.000000000|
|800×800|500.000000|550.000000|1.066666667|
|720×1280|500.000000|550.000000|1.706666667|
|320×480|500.000000|641.354365|0.841689034|
|360×480|500.000000|607.870632|0.755799463|
|390×480|500.000000|607.870632|0.755799463|
|430×480|500.000000|607.870632|0.755799463|
|844×390|500.000000|556.540284|0.879166667|
|1280×720|500.000000|550.000000|1.333333333|
|1366×641|500.000000|550.395315|1.422916667|
|1536×730|500.000000|550.000000|1.600000000|
|1440×760|500.000000|550.000000|1.500000000|
|1920×947|500.000000|550.000000|2.000000000|
|800×600|500.000000|550.000000|0.833333333|
|480×900|500.000000|550.000000|1.200000000|
|360×844|500.000000|523.906977|1.011764706|

Coordenadas y apoyos, curvas de profundidad, walkPaths ordenados, occluders y contactos de mano constan en el JSON paralelo. Las referencias iniciales de Compuerta2A se conservan bajo camera.initialGate2AReference; las medidas actuales están en camera.perLayout.

Circuito: centro(500,520), radios130/120/110/100/90 para Mouse/Alice/Dodo/Lory/Eaglet; ejeY0,65×radio y fases0°/72°/144°/216°/288°. Dos vueltas en8s con runSpeed constante por actor, integral de profundidad y orientación45°. Alice sigue0.32.

Ramita: suelo→ala→suelo; apoyo final(345,555). Dodo la transporta caminando hasta su apoyo de colocación y vuelve antes del texto. Arco corto de tierra visible; no se dibuja mágicamente todo el óvalo desde un punto. Dedal/confites ocultos hasta la siguiente escena.

Poses secas y originales de detalle preservados. Variante canónica68 muestras por humano de referencia180; texturas cercanas4× muestreadas desde originales, nearest-neighbor y alfa duro. No se amplía la variante canónica reducida para fingir detalle. Golden Masters y escenas aprobadas se conservan.

Reutilización futura: juncos/borde de agua de Mouse(207,568), cobertura(235,538); hueco entre ramas(1390,207), salida alta(1490,120); sendero Dodo/Conejo(1378,466)→(1504,348), cobertura(1595,320). La implementación futura queda pendiente de sus compuertas.

QA:70combinaciones generales,20formatos de puesta en escena,2MP4 independientes silenciosos decodificados y reproducidos a1×;0errores. Alcance local Chromium con viewports simulados, no teléfonos físicos ni Safari. Los informes finales están en .artifacts/qa/alice-in-wonderland/chapter-2-scene-2/.
