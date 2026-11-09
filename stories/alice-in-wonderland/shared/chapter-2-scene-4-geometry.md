# MEASURED ART BOARD / C2-S4

**Estado:** propuesta de Compuerta2A; no escena implementada ni dictamen de QA de reproducción.

## Arte seleccionado

- Fondo1670x942, fuente/mundo1:1. Rectángulo base16:9[195,90,1475,810],1280x720; overscan1.3047x horizontal y1.3083x vertical. Márgenes195/195/90/132px. Paisaje pintado completo, sin estirar centro.
- Noche lunar intermedia aprobada: cielo profundo con luna/estrellas; verde reconocible, tierra cálida apagada por luz lunar, lámpara con calor local; cero sombras de árboles sobre el piso.
- Casa compacta con tejado y chimenea acortados para caber sobre el panel de lectura en16:9 y9:16. La interfaz y su reserva se toman del lector actual; no se mueven.
- Rejilla2x2 del fondo y68 muestras verticales anatómicas para referencia180 de Alice. Tres poses nuevas: empujar puerta, preparar entrada, Conejo señalando el sendero. Reutilizar caminar front/right/back y buscar del Conejo ya aprobados.
- Rabbit0.8physicalGain y122de referencia se conservan desdeS3; Alice0.32 no cambia. Texturas originales4x preservadas junto a atlas normalizado.

## Coordenadas medidas - fuente/mundo1:1

|Elemento|Coordenadas / función|
|---|---|
|arrivalStart|[555, 665]|
|plaqueLook|[665, 665]|
|doorPushFeet|[753.5447071705133, 622.8286236740663]|
|doorInsideFirstStep|[741.5447071705133, 606.8286236740663]|
|handleContact|[777, 581]|
|gateOpeningCenter|[455, 642]|
|gateOpeningBounds|[410, 590, 508, 704]|
|nameplateBounds|[814, 490, 881, 524]|
|nameplateCenter|[847.5, 507]|
|windowBounds|[900, 430, 1014, 534]|
|windowSill|[957, 539]|
|chimneyTop|[925, 210]|
|bushLanding|[1110, 630]|
|bushBounds|[1032, 501, 1208, 664]|

## Rutas físicas sin texto

|Ruta|Modo y orientación|Duración|
|---|---|---|
|clearingExit|walk235 x0.32 x perspectiva; right, right, right, right, right|6.028s|
|houseArrival|walk235 x0.32 x perspectiva; right|1.181s|
|houseDoor|walk235 x0.32 x perspectiva; right, right, right|1.098s|
|doorFirstStep|walk235 x0.32 x perspectiva; back, back|0.222s|

## Contacto y capas de la puerta

Palma real de la pose medida contra[777,581]. Apoyo calculado sobre el escalón superior, no pies elevados sobre una pared. El tirador se bajó en el arte para ser alcanzable. Apertura con bisagra izquierda; hueco de forma arqueada, no un rectángulo negro superpuesto a cabezas. Fondo del hueco depth50, siempre debajo de Alice. Marco/hoja usan sus píxeles de madera reales como oclusores. El primer paso conserva perspectiva, giro back y fade parcial; S5 hereda todo.

## Cámara propuesta por formato

|Formato|CentroX, centroY, zoom|Reserva de diálogo|
|---|---|---|
|390x844|{'x': 812, 'y': 499.41666666666663, 'z': 0.96}|{'left': 14, 'top': 600.484375, 'right': 376, 'bottom': 776.484375}|
|1366x640|{'x': 836, 'y': 558.047619047619, 'z': 0.84}|{'left': 303, 'top': 428.40625, 'right': 1063, 'bottom': 582.40625}|
|720x1280|{'x': 812, 'y': 428.6666666666667, 'z': 1.5}|{'left': 20, 'top': 1016.8125, 'right': 700, 'bottom': 1164.8125}|
|360x800|{'x': 812, 'y': 517.6315789473684, 'z': 0.95}|{'left': 14, 'top': 560, 'right': 346, 'bottom': 736}|
|430x932|{'x': 812, 'y': 484.02488425925924, 'z': 1.08}|{'left': 14, 'top': 681.453125, 'right': 416, 'bottom': 857.453125}|

Claro: encuadre exacto deS3, Conejo no se mueve de[625,550]. Patio: un encuadre fijo por ventana real. En vertical se recorta paisaje lateral; la puerta, placa, Alice y chimenea quedan dentro. La verja completa se ve en el panorama y el estudio horizontal; la entrada vertical emerge desde el sendero izquierdo conectado con ella.

## Reservas para S5-S7

Ventana y alféizar para brazo gigante; chimenea accesible sobre tejado para el pie/Bill; franja de pared bajo ventana para escalera; arbusto derecho para aterrizaje; verja abierta y suelo despejado para fuga. Son reservas arquitectónicas, no aprobación anticipada de nuevas escenas/poses de Bill. Revalidar sus apoyos con su arte real en la compuerta correspondiente.

## Comprobaciones de esta compuerta

pixel-density-check.json: PASS2activos (atlas3poses y panorama), maestros inmutables verificados. character-art-check.json: PASS16texturas de8poses nuevas/reutilizadas,16texturas de caminar,2retratos; alfa duro, sin píxeles de celdas vecinas. geometry-check.json documenta vistas y contactos propuestos. Inspección visual de recortes, ojos, pies, mano/tirador, color y arquitectura. No es QA de escena, guardar/reanudar o MP4: esa fase queda para después de la aprobación.


## Authorized Gates3/4 implementation / 2026-11-03

20moments implemented; authored69756.343ms, actual1ms automatic clock69759ms. Only M13 transitions place with550ms full-shot dissolve. S3 terminal end control is replaced by the genuine same-frame continuation; prior narrative/actions preserved.

Door support plane correction: the wooden leaf uses618+0.1, behind Alice while she stands outside at622.829; dark interior50 and dim floor51 always behind her. Native door silhouette only, no head-cutting rectangle. S4 ends with first back step at[741.5447071705133,606.8286236740663], alpha0.9, approved0.32; hold rendered walk-back frame1, do not spin right at completion.

In an extreme narrow viewport, if the full pointing hand would be clipped, use the already approved short open-palm Rabbit pose facing right toward the path; same0.8gain, feet and camera. Ordinary formats retain the new long pointing pose. Saved direct starts at yard/end initialize pose metadata without requiring earlier on-screen playback.

Fresh local QA evidence is under .artifacts/qa/alice-in-wonderland/chapter-2-scene-4/. Gate4 remains pending until all required reports and the re-exported doorway video pass.
