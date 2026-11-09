# Alejandro — visión y reglas de Pixel Nook

Este documento explica cómo colaborar con Alejandro y qué debe respetar cualquier agente del equipo. Recoge sus instrucciones del 15 de octubre de 2026 y las reglas vigentes del proyecto. Es un perfil de trabajo, no una autorización para iniciar cuentos, cambiar la plataforma, instalar otros agentes o publicar.

## Quién es Alejandro y qué quiere construir

Alejandro dirige la visión y las aprobaciones de Pixel Nook. Quiere construir el equipo y las historias paso por paso, con resultados concretos que pueda revisar antes de avanzar. La velocidad o el volumen producido no sustituyen su aprobación ni la calidad narrativa y visual.

Pixel Nook es una experiencia de lectura ilustrada y animada con pixel art retro, tranquila, inmersiva y de baja estimulación. La imagen ayuda a comprender la historia; la animación y el sonido acompañan la lectura sin competir con ella. Las decisiones de los personajes, sus consecuencias y los finales deben resultar comprensibles. No introducir interrupciones comerciales, espectáculo repetitivo de la pérdida ni finales suspendidos forzados.

Su público principal son jóvenes y adultos en redes sociales como TikTok, Reels y Shorts, junto con lectores de todas las edades que buscan contenido de baja estimulación: un descanso tranquilo del caos de las redes, con historias envolventes y con peso emocional. La claridad debe permitir que cualquiera siga la historia, sin volver infantiles los diálogos ni el tono.

Trabajar con Alejandro en español en esta colaboración. Mantener los cuentos y la interfaz en inglés. No deducir otros datos personales ni convertir preferencias no confirmadas en reglas.

## Fuentes y prioridad

Leer las fuentes actuales antes de trabajar; este perfil no sustituye sus detalles:

- [AGENTS.md](../AGENTS.md).
- [Historia y causalidad](../docs/rules/story-and-causality.md).
- [Arte y panoramas](../docs/rules/art-and-panoramas.md).
- [Puesta en escena y cámara](../docs/rules/staging-and-camera.md).
- [Lectura y accesibilidad](../docs/rules/reading-and-accessibility.md).
- [Vídeo y audio](../docs/rules/video-and-audio.md).
- [Creación de historias](../docs/authoring/new-story.md).
- [Contrato de historia y renderer](../docs/authoring/story-renderer-contract.md).

Las instrucciones explícitas actuales de Alejandro gobiernan el alcance del trabajo. Las reglas consolidadas y las correcciones visuales aprobadas el 14 de octubre prevalecen sobre los extractos históricos. Estos últimos documentan procedencia: no autorizan restaurar versiones, rutas, scripts, recuentos de QA ni decisiones obsoletas. Conservar el arte y la puesta en escena finales aprobados de Odyssey.

## Flujo obligatorio: una etapa revisable a la vez

No producir lotes masivos ni implementar por adelantado etapas pendientes de aprobación. Trabajar dentro de la etapa autorizada, presentar el resultado y resolver sus observaciones antes de avanzar. Una aprobación previa sigue siendo válida dentro de su alcance; no pedirla otra vez sin un cambio material.

1. **Historia antes del arte y del código.** Presentar la historia en una tabla causal y obtener la aprobación de Alejandro. Aplicar la **Prueba del Niño de 8 Años**, el estándar obligatorio de claridad causal y visual: cualquiera, incluso un niño de 8 años, debe entender quién está, de dónde viene, qué quiere, por qué actúa, qué ocurre en cada escena y como consecuencia, cómo llega al siguiente lugar y cuándo sucede, sin confundirse. La prueba no convierte el relato en contenido infantil ni infantiliza los diálogos o el tono.
2. **Arte y mapa de puntos lógicos antes de programar.** Con la historia aprobada, preparar y revisar el arte en incrementos acordados. Inspeccionar los fondos finales tanto en vertical como en panorama y medir su geometría. Presentar el arte y el mapa para aprobación antes de implementar las escenas correspondientes.
3. **Programación y auditoría escena por escena.** Implementar una escena autorizada, revisar narración y movimiento completo, corregir y presentar evidencia local. Cerrar esa revisión con Alejandro antes de pasar a la siguiente. No dar por aprobado el resto del capítulo porque una escena funcione.

La tabla causal debe permitir revisar, por cada unidad narrativa: lugar y momento; personajes y procedencia; situación o causa previa; intención; acción visible o hecho fuera de campo explicado; consecuencia; enlace con la siguiente unidad. Señalar las lagunas en vez de rellenarlas con supuestos silenciosos.

Para cada historia nueva, el mapa vive en `stories/<slug>/shared/stage-geometry.json` o un JSON equivalente dentro de `shared/`, declarado mediante `stageGeometry` en el manifiesto. Incluye `spawns`, `anchors`, `walkPaths` y `occluders` por entorno, con dimensiones reales, superficies transitables, coordenadas medidas, mapeo al mundo y evidencia del arte inspeccionado. Las rutas nombran anclas de inicio y final y puntos intermedios ordenados. Documentar las diferencias entre las variantes vertical y panorámica. Nunca inventar rutas o coordenadas sin verificarlas; la exención de geometría migrada de los cuentos existentes no se aplica a historias nuevas.

## Claridad narrativa y visual innegociable

- **Causalidad continua.** Presentar a los personajes y sus funciones antes de depender de ellos. Mostrar o explicar viajes, llegadas, salidas y hechos relevantes fuera de campo. Marcar el inicio y el final de los recuerdos. Una acción debe terminar antes de que el texto la dé por hecha. La narración describe lo que realmente se ve, incluidos muebles, posturas y objetos.
- **Vertical primero.** Componer primero para teléfono y formato 9:16; después comprobar escritorio y horizontal. Mantener actores, objetos importantes y terreno visibles, sin ocultarlos detrás del texto. El panorama horizontal es una imagen completa y continua con densidad de píxel uniforme: sin espejos, centros repetidos, alas inconexas, uniones borrosas, suelo estirado ni bordes fuera del arte. Respetar las composiciones verticales y excepciones ya aprobadas.
- **Pixel art coherente.** Usar la familia visual aprobada de Odysseus, Calypso y Hermes y la colección `concept_art/` como referencias. Conservar bloques definidos, contornos continuos, paletas limitadas, recortes medidos de atlas, pies completos y la cuadrícula compartida de dos píxeles de mundo. Las poses de interacción se dibujan para la acción; no se simulan aplastando una figura de pie.
- **Entradas y salidas físicas.** Hacer emerger gradualmente a personas y animales desde puertas, caminos, vegetación u otros límites comprobados del entorno. El efecto retro de aparición debe seguir siendo visible al salir de la cobertura; después se camina opaco. En una salida, desvanecer solo en los últimos pasos. No atravesar paredes, rocas, muebles ni otros cuerpos. Reservar las excepciones mágicas para sucesos sobrenaturales explícitos de la historia.
- **Actores en espera inmóviles.** Conservar su posición y presencia mientras otro se mueve. Establecer y sostener la cámara durante esos recorridos para no aparentar desplazamientos del que espera; reencuadrar por separado, respetando los seguimientos ya aprobados. Un movimiento necesario requiere su propia acción visible. Los cambios narrativos de mirada o postura no autorizan deslizamientos de coordenadas.
- **Objetos unidos a su dueño.** Mantener cada objeto transportado anclado a la mano y a la pose real, con la visibilidad de su dueño durante todo el recorrido. Detener al personaje antes de una acción separada de colocar, soltar o entregar. No cambiar de dueño a mitad del camino ni dejar objetos flotando; mostrar cambios de contenido cuando se consumen o vacían.
- **Continuidad entre escenas.** Cero cortes, fundidos o reinicios por pasar de número de escena en un mismo lugar y momento. Conservar posiciones, posturas, oyentes, muebles y propiedad de objetos. Un cambio real de lugar o tiempo usa un fundido del plano completo, incluidos personajes, objetos y sombras; la llegada caminando ocurre después como acción separada. No fundir solo el fondo mientras el reparto se desliza entre lugares.

## Estrategia de sonido retro

**Está prohibido usar ruido blanco o estática para fingir mar, lluvia o viento.** No considerar cumplida una atmósfera mediante ese recurso.

En cada historia nueva, empezando por *Alice in Wonderland*, seguir esta secuencia:

1. Construir primero el **Capítulo 1 completo en silencio**, escena por escena, para perfeccionar y revisar la historia, el arte y la puesta en escena. El silencio es parte deliberada de esta fase; no es un defecto que el agente deba corregir anticipadamente.
2. Una vez terminado y revisado ese capítulo en silencio, incorporar a `06-sound-director` al piloto sonoro sobre el propio Capítulo 1, bajo la coordinación de NOOK, como transición hacia el Capítulo 2. Probar distintas opciones de melodías y efectos con toque retro. Tomar como inspiración cómo *Super Mario Bros.* adapta la atmósfera musical y los efectos a cada nivel y acción, con una versión suave y discreta que no distraiga de la lectura. La referencia describe el enfoque de adaptación, no una selección ya aprobada de melodías, instrumentos o efectos.
3. Presentar las opciones para que Alejandro las escuche y elija. Documentar la guía sonora aprobada —ambientes, melodías, efectos por acción, intensidad, transiciones y uso del silencio— antes de extender el sonido al resto de los capítulos. No declarar una opción aprobada por haber generado una demo.

El sonido sigue el reloj de lectura, usa transiciones suaves y se atenúa al pausar. Revisar tanto sonido activado como desactivado y su comportamiento en exportación. Esta estrategia no autoriza una revisión retroactiva del audio de cuentos existentes; preservar sus decisiones específicas, incluida la ausencia de música y campanas de pueblo en The Second Cup.

## Lectura, guardado y vídeo son parte del producto

Conservar lectura manual y automática, pausa, avance y retroceso, historial, reinicio, selección de escena, continuación guardada y finalización. El primer toque revela el párrafo y el siguiente toque válido avanza. El texto progresivo ocupa su disposición final desde el principio: revelar por opacidad, sin palabras que cambien de línea al crecer.

Mantener controles legibles, foco visible, uso en pantallas bajas, rotación, pantalla completa y modo inmersivo. Preservar IDs persistentes, aliases de pasajes guardados y compatibilidad de progreso. Probar con almacenamiento aislado; nunca borrar el progreso real de Alejandro. No tratar distintos puertos de localhost como el mismo origen de guardado.

Lectura, reproducción automática, reconstrucción guardada y exportación deben representar el mismo mundo desde los mismos datos. El vídeo usa una instancia independiente del motor y renderer, conserva 720 × 1280 (9:16), márgenes y subtítulos adecuados, y no modifica el lector ni su progreso. Mantener las aperturas y previews reales de las escenas, los cierres, la cancelación y la liberación de recursos según las reglas de vídeo. No introducir controles del lector dentro del vídeo.

## Entorno local y evidencia de calidad

Trabajar únicamente dentro de `pixel-nook-studio`. `entre-lineas-platform` es un respaldo de solo lectura: nunca editarlo, borrarlo ni ejecutar sus scripts de mutación. Todas las pruebas y previews se realizan en `localhost` dentro del proyecto. **Nunca publicar ni alterar un Site en vivo sin una nueva orden explícita de Alejandro.**

Cuando haya cambios de historias o implementación, usar los checks reutilizables de `qa/`: `npm run qa -- --story=<slug>` para las historias afectadas y la suite completa tras cambios compartidos. Guardar salidas generadas y evidencia únicamente en `.artifacts/` —reportes de QA en `.artifacts/qa`—, sin recuperar cadenas de parches por capítulo ni JSON antiguos de resultados.

Auditar el inicio, el medio y el final de los movimientos, además de los pasajes quietos. Revisar teléfono a 360/390/430 px, escritorio, orientación, pausa, reconstrucción y exportaciones según el cambio. Inspeccionar capturas y grabaciones completas cuando corresponda; un test lógico no sustituye una revisión visual.

Informar con precisión qué se comprobó y qué sigue pendiente. Diferenciar simulaciones de teléfonos reales, previews de vídeos codificados completos y pruebas aceleradas de una evaluación del ritmo normal. Los resultados históricos no son pruebas nuevas. Un cambio exclusivamente documental requiere revisar el documento y sus referencias, no afirmar que se ha validado de nuevo el funcionamiento de la plataforma.

## Cómo colaborar y cerrar cada entrega

Explicar en lenguaje claro el resultado, su motivo, la evidencia disponible y las dudas que afecten a la siguiente decisión. Si un requisito es ambiguo, identificarlo y hacer una pregunta concreta; no inventar una preferencia de Alejandro. Presentar problemas de causalidad o de puesta en escena aunque la implementación sea técnicamente posible.

La unidad de entrega debe ser pequeña y revisable. El Paso 1 establece este perfil; el Paso 2 define a [NOOK](01-nook-manager.md); el Paso 3 solicitado por Alejandro define a los especialistas 02–06 y conecta el flujo en [AGENTS.md](../AGENTS.md). Ante solicitudes de creación o edición de cuentos, NOOK coordina esos especialistas y las cuatro compuertas. La instalación documental no inicia producción ni autoriza crear roles adicionales; la primera prueba real corresponde al Paso 4 cuando Alejandro la solicite.

## Wonderland Exterior Night

Todos los exteriores dentro de Wonderland, durante todo el cuento, son de noche: cielo oscuro azul profundo e iluminación nocturna mágica inspirada en la película animada clásica de Disney, con personajes y gotas legibles. El día soleado se reserva al mundo real junto a la hermana (C1-S1 y el despertar del Capítulo 6). Conservar continuidad de umbrales, geometría medida, rutas y rejilla de dos píxeles al cambiar la iluminación.


**Colorful Magical Wonderland Night:** Conservar cielo nocturno oscuro con luna y estrellas y bocas de cuevas oscuras; iluminar el escenario con colores vivos, hojas y plantas verdes, flores claras y tierra cálida, clara y limpia. Prohibido un filtro azul/morado global que apague el color y prohibidas las sombras proyectadas de ramas/árboles o sombras de sol en el suelo. Aplicar a todos los exteriores futuros de Wonderland.
