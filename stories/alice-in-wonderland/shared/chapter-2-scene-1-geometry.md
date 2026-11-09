# C2-S1 / A Way Out — geometría medida para Compuerta2A

31 de octubre de2026. Tabla Causal aprobada; corrección espacial y2A autorizadas. **concept_art/geometría aprobados por Alejandro; C2-S1 implementada y Compuerta4 verificada en el alcance habitual aprobado.**

[Guion corregido](../../../.artifacts/alice-in-wonderland/chapter-2/scene-1-gate-1-script.md) · [MEASURED ART BOARD / C2-S1](../../../.artifacts/alice-in-wonderland/chapter-2/scene-1/measured-art-board-c2-s1.png)

## Sistema de coordenadas y preservación

Panorama aprobado1664×936, mapeo uniforme ×2 a mundo3328×1872. Reutilizar exactamente los datos de `inherited-c1-s6-final.json`: capas, recortes, escala, origen, rotación, flip, alfa y profundidad. No reemplazar la laguna ni añadir otra agua.

Cámara390×844: x1741, y1270.5781990521327, z0.7033333333333334. Las otras cinco composiciones medidas también heredan su cuadro actual; `camera.perLayout` registra cada una. Ningún beat cambia x/y/z. Tarjeta inferior estándar: rectángulo real capturado, sin moverla o encogerla.

Mesa: soporte/profundidad1380. Llave y corcho1381. Cajita central abierta, botella, abanico y guantes conservan sus transformaciones y planos reales. Ningún personaje los toma.

Laguna cerrada: panorama[735,684,1005,740],270×56px; mundo[1470,1368,2010,1480]. Máximo dos ocupantes: Alice/Mouse. Las aves no entran ni aparecen desde agua a la derecha.

## Anclas medidas

|Ancla|Panorama x,y|Mundo x,y|Superficie|
|---|---|---|---|
|aliceInherited|[838, 724]|[1676, 1448]|water|
|mouseInherited|[794, 724]|[1588, 1448]|water|
|aliceWaterLip|[758, 694]|[1516, 1388]|water|
|mouseWaterLip|[750, 722]|[1500, 1444]|water|
|aliceDry|[775, 668]|[1550, 1336]|left-dry-floor|
|mouseDry|[750, 680]|[1500, 1360]|left-dry-floor|
|dodoSpawn|[720, 610]|[1440, 1220]|left-dry-floor|
|lorySpawn|[720, 624]|[1440, 1248]|left-dry-floor|
|eagletSpawn|[720, 570]|[1440, 1140]|left-dry-floor|
|dodoMeeting|[779, 610]|[1558, 1220]|left-dry-floor|
|loryMeeting|[754, 624]|[1508, 1248]|left-dry-floor|
|eagletMeeting|[830, 616]|[1660, 1232]|left-dry-floor|
|aliceDoorWait|[795, 521]|[1590, 1042]|left-dry-floor|
|mouseDoorWait|[768, 546]|[1536, 1092]|left-dry-floor|
|dodoDoorContact|[751, 448]|[1502, 896]|left-door-top-stone-step|
|loryDoorWait|[753, 522]|[1506, 1044]|left-dry-floor|
|eagletDoorWait|[834, 516]|[1668, 1032]|left-dry-floor|

## Recorridos y velocidad

Las coordenadas siguientes se verificaron sobre el panorama y contra las máscaras alfa reales de personajes/props. Rutas terrestres: integración exacta de `platform/reader/motion-speed.js`, contrastada independientemente con cuadratura numérica. La perspectiva se aplica una vez; la escala mágica0.32 de Alice también una sola vez. Ningún tramo recibe otra velocidad o easing. Nado y vadeo tienen contrato propio de acción visual, distinto de caminar.

|Ruta|Actor|Waypoints en panorama|Duración física|Inicio dentro de su beat|
|---|---|---|---:|---:|
|alice-to-left-lip|alice|[[838, 724], [804, 710], [776, 700], [758, 694]]|5.000s|0.000s|
|mouse-to-left-lip|mouse|[[794, 724], [750, 722]]|5.000s|0.000s|
|alice-emerge-left|alice|[[758, 694], [760, 677], [775, 668]]|4.000s|0.000s|
|mouse-emerge-left|mouse|[[750, 722], [750, 684], [750, 680]]|4.000s|0.000s|
|dodo-enter-left|dodo|[[720, 610], [779, 610]]|1.784s|0.000s|
|lory-enter-left|lory|[[720, 624], [754, 624]]|1.077s|1.400s|
|eaglet-enter-left|eaglet|[[720, 570], [830, 570], [830, 616]]|5.259s|0.000s|
|alice-to-door|alice|[[775, 668], [782, 622], [789, 574], [795, 521]]|3.909s|1.852s|
|mouse-to-door|mouse|[[750, 680], [750, 611], [750, 570], [768, 546]]|1.939s|3.822s|
|dodo-to-door|dodo|[[779, 610], [775, 549], [760, 478], [751, 448]]|5.761s|0.000s|
|lory-to-door|lory|[[754, 624], [750, 574], [753, 522]]|3.469s|2.292s|
|eaglet-to-door|eaglet|[[830, 616], [834, 565], [834, 516]]|3.431s|2.330s|

Entrada de aves: ventana6s, máximo físico5.259s. Lory espera1.4s al inicio para no cruzar la silueta de Dodo; su fade empieza al iniciar su entrada, no mientras espera fuera del cuadro. El resto del trayecto es continuo. Marcha a la puerta: ventana7s, llegada física común5.761s, sin pausas entre waypoints. Las breves incorporaciones iniciales dejan espacio a los compañeros; no hay avance por turnos ni cambios de velocidad.

## Tamaño, poses y contactos

Alice mantiene referencia180 y cuerpo0.32. Mouse conserva referencia18 y ganancia física1.4, sin nueva reducción mágica. Dodo56, Lory36, Eaglet42worldpx de altura anatómica de diseño antes de perspectiva: a igual plano ninguno supera a Alice0.32. La normalización usa68muestras por referencia humana180; las aves pequeñas usan respectivamente21/14/16muestras físicas de altura. No confundir esa relación con forzar68muestras en cada ave.

18poses nuevas de aves (incluido empuje real de hombro/ala) y3vistas traseras complementarias de Mouse, sin reemplazar sus poses de C1. Los originales y prompts están en `.artifacts/alice-in-wonderland/chapter-2/scene-1/`; los atlas elegidos en `assets/atlases/c2-s1-*.png`. Dodo mira a la derecha al empujar hacia izquierda/fondo: su pico no se introduce en la madera.

**Contacto real de puerta:** pies de Dodo en panorama(751,448), sobre el peldaño superior existente. Hombro/ala toca madera en(744.328,437.992), por encima del borde inferior real de la hoja y440. No usar el punto anterior del peldaño a y471.28. Las poses tienen sus propios anclajes de apoyo medidos. Puerta apenas entreabierta en3s, sin cruce; S2 completa la apertura. La proyección de la hoja usa el arte existente y se recorta a madera por encima de y440, conservando los peldaños y la piedra inferiores. Dodo queda por delante de la hoja (depth1001) hasta un cruce futuro explícito.

## Evidencia y alcance

- Normalización y auditoría `qa/pixel_density.py`:5atlas,21cortes seleccionados, alfa duro y muestreo conforme. Golden Masters verificados por hash, sin cambios.
- `qa/checks/character-art.mjs`, ejecutado en preview aislado con Phaser/drawCharacter:122texturas de marcha válidas,4retratos;0issues.33poses revisadas:21nuevas +12reutilizadas, con alfa duro y rejilla de2px en texturas normalizadas.
- Comprobación estática cada50ms:1461estados,34110proyecciones en6layouts;0solapamientos de siluetas/props y0incidencias de viewport en el alcance descrito. La emergencia parcial de aves desde el borde es una entrada explícita; la separación completa se exige al terminar.
-191archivos previos de historia, maestros, plataforma y QA comparados sin cambios.
-73s es presupuesto de Lectura Automática, no medición de una escena implementada. Se añadió1s a entrada sin recortar frases/pausas.
- No certifica lectura manual, clic inmediato, motor de C2, movimiento real a1x ni MP4. Todo ello pertenece a3/4 después de aprobación.

La geometría detallada vive en `chapter-2-scene-1-geometry.json`; atlas y densidad en los JSON homónimos. El manifiesto ya declara `shared/stage-geometry.json`, pero el enlace de C2 y cualquier registro runtime se difieren a la integración autorizada de Compuerta3. Sonido en pausa,2B no activada.


Los pivotes de apoyo de las16poses terrestres ordinarias de aves se midieron sobre sus pies reales, no sobre el centro de los recortes. Los frames derivados añaden el mismo padding6px al pivote; el gesto de Eaglet conserva ese apoyo al reflejarse hacia la puerta. En beat13 señala la puerta, no el charco: su frase propone salir de la sala juntos cuando ya están todos sobre suelo firme.


## Cierre de Compuertas3/4

Dictamen: `.artifacts/qa/alice-in-wonderland/chapter-2-scene-1/gate-4-verdict.json`.0errores dentro de los tamaños habituales seleccionados por Alejandro al conservar el panorama; los extremos se conservan como observaciones excluidas. MouseDry se ajustó2px de panorama hacia la derecha para evitar un recorte de1.253px a360×844; misma explanada, cámara y73s nominales. No cambia el extremo de puerta ni se toca un prop. Alice reutiliza la pose aprobada de mano vacía para observar la manga.
