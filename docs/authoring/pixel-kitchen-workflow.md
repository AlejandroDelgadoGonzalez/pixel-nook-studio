# Pixel Kitchen workflow — contrato operativo

Vigente documentalmente desde 2026-11-16, por el encargo **Paso 1 — Consolidar el contrato**, con aclaraciones posteriores de maestros side y orden de validación. Integración pendiente; el Paso 2 solo implementó contratos y validadores aislados. Esta es la referencia única para las decisiones confirmadas del flujo Pixel Kitchen; el [PLAN.md](../../.artifacts/pixel-kitchen-transition/PLAN.md) conserva investigación y recomendaciones no adoptadas. No se aprueba el plan completo por referencia.

## 1. Alcance, autoridad y separación del legado

Este contrato rige **A: futuras historias con Pixel Kitchen** y **B: migración visual de Alice**, cuando sus encargos se autoricen expresamente. Registrar en cada encargo si corresponde a A, B o mantenimiento legacy. La presencia de este archivo no inicia ninguno de esos trabajos.

Las historias existentes conservan sus contratos, fuentes canónicas, arte, geometría, guion, audio, guardados, IDs, alias y certificados. No se renumeran reportes ni aprobaciones históricos. “Gate 3” en una evidencia antigua sigue significando lo que significaba al emitirse; no convertirlo en audio. No aplicar nuevos tamaños ni normalizar fuentes aprobadas del legado.

Para A/B, este contrato prevalece sobre menciones incompatibles a cuatro compuertas, 2A/2B, audio previo obligatorio, atlas como fuente creativa obligatoria o IA necesaria para aprobar. Los párrafos conservados en perfiles/reglas con esa numeración describen el procedimiento legacy, no instrucciones adicionales para A/B. Las reglas compatibles de preservación, causalidad, seguridad de lectura/guardado/exportación y anatomía completa siguen vigentes.

El chat de actualización de arte y herramientas **no se identifica como NOOK ni adopta su rol de constructor de cuentos**. NOOK continúa como coordinador de encargos narrativos/de producción que lo requieran. La tarea técnica o documental no inicia una producción. Se mantiene un solo hilo: sin subagentes, forks, chats de delegación ni servicios autónomos. Los nombres de roles no son números de compuerta: `04-staging-choreographer` trabaja en la compuerta 4 nueva y `05-qa-inspector` en la 5; no se renombran perfiles existentes en este paso.

## 2. Cinco compuertas confirmadas

| Compuerta futura | Responsabilidad | Criterio operativo |
|---|---|---|
| **1 — Narrativa** | Arquitectura narrativa, coordinada por NOOK en encargos de historias | Mapa/tabla causal, texto, beats y continuidad; aprobación de Alejandro de versión y alcance. En B se fija el comportamiento anterior, no se rediseña. |
| **2 — Arte/geometría** | Arte | Revisar precocidos nuevos visibles, activos reutilizados inventariados, maestros, referencia corporal, raíces/contactos y geometría medida/proyectada. Distinguir medición de fuente/proyección de Cook aún no ejecutado. Aprobación de Alejandro. |
| **3 — Audio** | Sonido en espera | **PAUSED / NON-BLOCKING**. No genera, incorpora ni activa audio nuevo por rutina; no bloquea avanzar de 2 a 4 ni cerrar QA visual. Reactivación solo por petición expresa. |
| **4 — Programación con Cook inicial** | Programación, consumiendo el contrato de Arte | Al entrar se cocina la fuente original y se valida el derivado. **Cook puro permite programar** sin esperar Chef ni retoque manual, si cumple estructura y geometría aprobadas. Implementar únicamente el alcance autorizado. |
| **5 — QA** | QA como fase separada del mismo hilo | Verificar la revisión realmente consumida, lectura/guardado/reconstrucción, geometría/contactos, cámara y exportación según el alcance; evidencia y cero errores obligatorios antes de certificar. No simular aprobación ni independencia de otro agente. |

Secuencia visual: **1 → 2 → 4 → 5**, manteniendo 3 como PAUSED / NON-BLOCKING, no completada ni aprobada implícitamente. No activar un piloto sonoro al terminar un capítulo ni exigir 2B para A/B. En A, la producción visual sin sonido nuevo mantiene silencio intencional; en B se conserva el audio y la sincronía del baseline, también donde ya fueran silencio. La pausa nunca autoriza silenciar audios existentes.

Chef/manual son refinamiento posterior separado. La falta de pulido estético no bloquea programación. Fuente incompleta, contacto roto, clipping, contrato inválido o evidencia pendiente sí son fallos técnicos: no se reclasifican como estética para eludir QA.

## 3. Arte individual, referencia corporal y Cook

Decisiones confirmadas:

- Nombre futuro de la herramienta: **Pixel Kitchen**. Los archivos actuales siguen llamándose NookForge hasta una implementación/renombrado autorizados.
- Cada pose futura es **un PNG individual de cuerpo completo**, nunca una hoja multivista ni piezas de extremidades. Cada personaje tiene maestros precocidos `front`, `side`, `back`; side usa front como referencia y back usa front + side. Las poses de interacción necesarias son fuentes completas adicionales, no se sustituyen por esos tres maestros básicos.
- Conservar precocidos originales grandes, maestros, finales y trazabilidad compacta. Solicitar fondo 100% transparente para los nuevos precocidos de personajes/objetos; no magenta, fondos sólidos o tablero pintado. Inspeccionar el alpha real generado y distinguirlo de lo solicitado: un PNG con residuos o alpha intermedio no es conforme por el prompt. Cuando haga falta, proponer limpieza localizada en una copia derivada trazable, conservando intacta la fuente original y verificando silueta/detalles. No binarizar globalmente las 66 fuentes; el alpha binario de la salida Cook no autoriza ese tratamiento de las fuentes grandes.
- Cook es un **derivado autorizado**, no una modificación destructiva de la fuente ni permiso para convertir fuentes aceptadas del legado. Lee siempre el original, nunca el canvas previamente procesado. Conserva una referencia corporal estable entre vistas y poses; no encoge una pose por brazos extendidos, sombrero o cola ni realinea cada imagen por su bbox de manera independiente.
- Si no cabe la pose completa o no se pueden verificar cuerpo/contactos, registrar conflicto y devolver a Arte dentro del alcance autorizado; no recortar anatomía, deformar ni inventar otra interacción.

| Clase | Salida física PNG 1:1 |
|---|---|
| Personajes | **64×64** |
| Objetos | **32×32** |
| Escenarios | **640×360** |
| Panoramas 3:1 | **1080×360** |

Escenarios opacos; personajes/objetos con transparencia. Los perfiles técnicos detallados de cuantización, umbrales y metadatos no quedan aprobados en bloque por esta tabla. No deformar un escenario para forzarlo a un formato incompatible. En B se conserva la correspondencia espacial con el original; un conflicto de ratio/encuadre se informa, no se resuelve con generación o reencuadre creativo.

La referencia corporal debe relacionar landmarks, escala y raíces de las fuentes grandes con la celda Cook. Raíz corporal, apoyo de pies/asiento y contacto de mano/objeto son conceptos distintos. Verificar tanto datos como píxeles visibles y tamaño aparente. No exigir que un PNG nuevo tenga las dimensiones del antiguo para reproducir su colocación/anclas. Entre Cook y sus retoques se conserva el lienzo y las invariantes de ese derivado.

Las fuentes globales actuales, incluida la carpeta de precocidos registrada, no se convierten automáticamente en maestros aprobados. Mantener sus estados reales de revisión y los fallos detectados. No relajar checks para que una biblioteca pendiente parezca certificada.

### Definición del maestro side y revisión selectiva

La estructura física de las futuras fuentes/poses se fija en la subsección siguiente; no implica mover la biblioteca existente.

El nombre `side` se mantiene. Para estas vistas significa **cabeza en perfil derecho claro y mirada horizontal hacia la derecha, con un solo ojo visible; cuerpo en tres cuartos con volumen frontal/lateral legible, ambas piernas y zapatos distinguibles y ambos pies apoyados**, en postura erguida neutral. “Tres cuartos” se refiere al cuerpo, no a una cara frontal o en tres cuartos con dos ojos. Nariz/morro, mandíbula, oreja, barba, gafas y tocado deben corresponder al perfil; no basta borrar un ojo o taparlo con pelo. Las gafas muestran su lectura lateral, sin dos lentes frontales equivalentes. Conservar tamaño de cabeza, identidad y unión natural del cuello. No imponer perfil estricto al cuerpo ocultando una pierna, zancada, carrera ni objetos añadidos. Mantener proporciones, ropa y escala corporal de `front`/`back`, sin ángulo matemático obligatorio de 45° ni anatomía humana forzada en animales. Las correcciones se editan como personaje completo, sin recortar, pegar, rotar, deformar ni superponer una cabeza separada; el cuerpo aceptado se conserva.

Usar como referencias visuales directas las poses pertinentes de Alice y White Rabbit actuales y los personajes de `odyssey-core` mostrados por Alejandro. Extraer orientación y legibilidad corporal, sin copiar accesorios ajenos ni fase de caminata. Identificar las fuentes/poses concretas en el siguiente encargo; su apariencia no aprueba por sí sola los maestros nuevos. Esta definición no altera movimientos, poses ni reglas de locomoción de cuentos existentes.

Antes de propagar la biblioteca, revisar las vistas `side` existentes y conservar `front`/`back` que estén bien. Primero presentar un piloto `side` corregido a Alejandro; solo después extender el criterio a las vistas afectadas. No regenerar las 66 imágenes por defecto ni convertir borradores en referencias aprobadas. **Estado de Alice actualizado:** el piloto side y los front/back exactos usados en el piloto tienen aprobación visual por recibo/hash. La corrección histórica de nariz no se reabre por esta anotación. Alpha técnico, adopción global y certificados de escena son estados separados; no se cambia el legado.

### Estructura oficial de personajes para A/B cuando se autoricen

Decisión confirmada posterior al piloto: dentro de `stories/<historia>/assets/characters/<character-id>/` usar este árbol. Los nombres **`maestros-precocidos/` y `temporal/`** son explícitos y prevalecen sobre recomendaciones anteriores de nombres en inglés para estas dos carpetas.

```text
stories/<historia>/
  assets/characters/<character-id>/
    maestros-precocidos/
      front.png
      side.png
      back.png
    temporal/
      <pose-id>-pre-cook-<revision>.png
    <pose-id>-cook-<revision>.png
    <pose-id>-final-<revision>.png
  shared/art-contracts/characters/<character-id>/
    <body-or-pose-contract>.json
    <revision-and-diff>.json
```

Los maestros conservan las tres fuentes grandes que fijan proporciones/estilo y sus estados reales. `temporal/` es el lugar visible de **nuevas poses precocidas**, una pose por PNG: el editor local de PC debe leerla directamente, sin esconder la producción en `.artifacts/`. Para el teléfono fuera de casa, una cola estática publicada presenta las tareas seleccionadas y sus referencias; no lee el disco del PC. No se afirma que ese listado completo ni el editor táctil/entrega estén implementados ahora.

En la raíz de `<character-id>/`, fuera de ambas subcarpetas, quedan **únicamente PNG Cook/final de 64×64 reales** destinados al consumidor. Los contratos, recibos y diffs se guardan fuera de esa raíz de PNG, en el área de contratos compartidos. Aprobado y adoptado siguen siendo conceptos distintos; revisiones explícitas, sin seleccionar por mtime ni sobrescribir una revisión consumida.

**Build:** `dist`/Vercel excluyen ambos subárboles en esta ruta de personajes. El filtro se limita al contrato nuevo y no cambia rutas legacy de atlas. Un `dist` anterior que ya contenga fuentes privadas hace fallar el build; no se borra silenciosamente. **Retención:** aprobar un Final no borra `temporal/`; archivar/limpiar solo después de comprobar que ninguna base de edición, diff, referencia, revisión activa o evidencia retenida lo necesita y con autorización de limpieza. No se mueve ni crea este árbol en cuentos actuales por documentarlo; el ensayo técnico permanece aislado, no representa producción nueva.

## 4. Chef y retoque manual

Chef es un **rol secuencial del hilo de trabajo en PC**, no subagente ni servicio autónomo. Alejandro pega personalmente la entrega del teléfono en su chat del Chef y allí se activa el perfil [07-pixel-chef](../../agents/07-pixel-chef.md); esto no es delegación automática entre chats. Cada encargo se ejecuta secuencialmente en ese hilo. Inspecciona el original grande frente al Cook, consulta correcciones humanas reales y propone parches quirúrgicos. Mantiene identidad, curvas, rellenos, reflejos y regiones protegidas. No inventa poses, cambia geometría ni sustituye decisiones narrativas. No se crea ni arranca un proceso Chef por documentar su función.

Son válidos los caminos **Cook → Manual → Final**, **Cook → Chef → Manual → Final** y aprobar un candidato Chef sin más clics manuales. No es obligatorio fabricar una versión IA para poder guardar/aprobar. El registro debe distinguir la base de edición y la base del diff: Cook→humano o Chef→humano, según corresponda. Los diffs son aprendizaje operativo para futuras correcciones, no entrenamiento automático de pesos.

## 5. Aprobar y guardar: adopción automática validada

**Intención confirmada:** en PC, aprobar y guardar un final tramita automáticamente su actualización en los **consumidores nuevos compatibles**. No se añade una segunda aprobación rutinaria ni una orden manual de “sustituir” para cada final ya aprobado. La comprobación técnica forma parte del trámite automático iniciado por esa misma acción.

1. Guardar final y trazabilidad de la base exacta sobre la que se aprobó; identificar los consumidores nuevos compatibles afectados. La compatibilidad se declara y verifica en la integración futura, no se supone para todo el proyecto.
2. Verificar **lienzo, raíz, contactos y regiones protegidas**, incluyendo los píxeles que sustentan apoyos/agarres, además de procedencia, revisión y checks de los consumidores afectados. Metadata idéntica no basta si desaparece una mano o se altera un contacto.
3. Si pasa, adoptar la revisión automáticamente en esos consumidores, preservando la anterior para trazabilidad/recuperación. Registrar e informar qué final se guardó y dónde se adoptó. Un final sin consumidores queda aprobado en biblioteca; no inventar usos ni vincularlo a historias por su cuenta.
4. Si falla validación o aparece un conflicto de revisión, **conservar la revisión activa e informar el conflicto** y sus consumidores. Distinguir “final guardado/aprobado” de “adoptado”; no anunciar actualización exitosa que no ocurrió. Resolver el conflicto dentro de su alcance; un cambio estructural/narrativo ajeno al retoque requiere encargo específico, no una segunda aprobación rutinaria del mismo final.
5. Una reproducción o exportación ya iniciada **mantiene su revisión hasta terminar**. La siguiente carga utiliza el final adoptado. No cambiar imágenes a mitad de beat/exportación ni mezclar revisiones entre lectura y su exportación correspondiente.

En el teléfono, **Aprobar y Copiar Entrega para el Chef** registra la aprobación y exporta la intención de edición; no guarda un Final en el PC ni declara adopción desde Vercel. Al recibir Alejandro esa entrega en su chat de PC, Chef ejecuta el trámite local de reconstrucción, validación y adopción sin pedir otra aprobación rutinaria. Una entrega obsoleta o incompatible se rechaza, sin reinterpretar la aprobación ni aplicar un rebase silencioso.

Esta adopción automática no alcanza al legado ni autoriza migrarlo. El mecanismo concreto de releases, locking, transacciones o rollback sigue siendo una recomendación técnica a diseñar; no cambia la intención funcional anterior.

### Aprobar imagen no es certificar escena

Alejandro aprueba el final visual; el sistema verifica su compatibilidad y tramita su adopción. **Certificar una escena** exige QA sobre sus consumidores y revisión efectiva, con alcance/evidencia propios. No heredar el PASS de una escena anterior para un binding cambiado, ni exigir repetir una aprobación estética ya dada cuando no cambió el alcance. La verificación técnica dirigida se ejecuta como parte de la adopción; no es otra compuerta creativa. Si falta o falla, se mantiene la revisión activa.

Los reportes y aprobaciones históricos no se reescriben: quedan ligados a las entradas y significados originales. La siguiente revisión necesita evidencia nueva o una justificación verificable de qué cobertura sigue siendo válida.

## 6. Dos flujos: historias futuras y Alice visual

### A — Futuras historias

Aplican las cinco compuertas anteriores. Narrativa y puesta en escena se diseñan/aprueban en su encargo; Arte decide reutilización y precocidos nuevos; al entrar en 4 se cocina. Ninguna autorización de herramientas/documentación inicia una historia.

### B — Migración visual de Alice in Wonderland

La nueva versión debe reproducir la anterior: **mismo guion, escenas, beats, tiempos, movimientos, recorridos, interacciones y continuidad**. Solo cambia representación artística y adaptación técnica imprescindible para mostrar nuevos activos conservando ese comportamiento. No rediseñar/reinterpretar staging, inventar movimientos, poses de interacción alternativas, objetos o decisiones narrativas. No retimar pausas ni mover la cámara para compensar arte diferente.

| Clase | Operación de B cuando se autorice | Qué debe conservar |
|---|---|---|
| Escenarios | Reutilizar y cocinar los originales existentes realmente consumidos por Alice. **Sin generar escenarios ni nuevos precocidos de escenario**; sin reemplazarlos por otra referencia parecida. | Composición, arquitectura, puntos de contacto y correspondencia espacial al convertir coordenadas. |
| Personajes | Generar precocidos del estilo nuevo de las mismas identidades y de las mismas poses necesarias; después Cook/refinamiento. | Orientación, función y secuencia de poses e instantes de intercambio. |
| Objetos | Generar precocidos de los mismos objetos existentes; después Cook/refinamiento. | Identidad, función, orientación necesaria, dueño, apoyo, agarre y tiempos de uso/transferencia. |

Los nuevos PNG no tienen que medir lo mismo que los antiguos: **colocación, tamaño aparente y anclas deben reproducir la escena anterior** con conversiones medidas, sin alterar recorridos/timing para acomodarlos. Mantener la versión vieja separada, ejecutable y preservada. No reinterpretar la pausa de audio como autorización para silenciarla.

Antes de producir activos de B, inventariar la cadena **activo/pose anterior → precocido equivalente o escenario reutilizado → Cook → final → escenas/beats consumidores**, con referencias/hash, descriptor real de celda si existe, mappings, raíces/contactos, estados y evidencia. Un final pendiente no impide usar Cook válido; una correspondencia desconocida sí impide declarar completa la cobertura. El esquema concreto y archivo del inventario siguen propuestos en el plan; no están implementados por este contrato.

QA de B compara ambas versiones **en los mismos momentos**: misma escena, beat, tiempo local y formato, con trazas y capturas sincronizadas en entradas/salidas, intercambios, contactos y puntos intermedios de recorridos. Detectar cambios involuntarios de escala aparente, apoyo, encuadre, recorrido, timing y continuidad. Diferencias artísticas no justifican cambios de comportamiento. Fijar métricas/tolerancias raster antes del ensayo; no inventarlas después de observar un fallo. Comparar también pausa, reconstrucción, guardado/reanudación y exportación.

**Este Paso 1 no autoriza comenzar B**, generar sus precocidos, cocinar sus escenarios, crear una nueva historia o alterar la anterior. Sus compuertas verifican preservación/equivalencia, no reabren narrativa.

## 7. PC local + Vercel Touch Editor y entrega al Chef

**Decisión confirmada que sustituye al modo LAN:** Alejandro usa el teléfono fuera de casa y el PC en casa. En PC, `tools/pixel-kitchen/local_editor_server.py` sigue como herramienta directa de escritorio. En teléfono se usa una página estática de Pixel Kitchen publicada mediante GitHub/Vercel. **Se descartan servidor LAN, emparejamiento físico, pairing QR, `.local/pixel-kitchen/pairing.json` y locks de Wi-Fi local.** No se necesita conexión directa teléfono→PC, IP privada, túnel ni un PC encendido para consultar la cola publicada.

### Teléfono: cola estática y aprobación exportable

Cada tarea publicada presenta el sprite y el **Original grande real** al lado, más su candidato Chef o Cook puro en un editor táctil cómodo, sobre la cuadrícula nativa 1:1 (64×64 personaje / 32×32 objeto, ampliación nearest para el dedo). No convertir el Original al tamaño de la celda para mostrarlo. La cola identifica revisión/base exactas y estados reales; una tarea no se aprueba por publicarse. Cook puro sigue siendo una base válida sin fabricar una etapa Chef.

**Solo lectura significa alojamiento sin escrituras:** Vercel sirve archivos estáticos; no hay backend cloud, tokens de GitHub en el cliente, escritura de repositorio ni acceso/escritura directa al disco del PC. El navegador modifica una copia en memoria. La descarga JSON es una acción explícita de Alejandro en su teléfono, no escritura remota. Esto reemplaza el antiguo requisito de PC/teléfono sobre un mismo servidor y no convierte Chef en un servicio autónomo.

Al tocar **“Aprobar y Copiar Entrega para el Chef”**, se genera un bloque estructurado con **`assetId`, `baseRevision`, `baseSha256`, `editedFrom` y la lista exacta de cambios `(x, y, colorHex)`**. `baseSha256` identifica los bytes del PNG de edición; `baseRevision` identifica su revisión exacta, distinta del hash del documento de contrato. `editedFrom` distingue Cook de Chef y debe poder resolverse a la base concreta. El paquete no ejecuta código ni contiene rutas arbitrarias para escribir archivos. Los transparentes y la codificación de color tendrán una convención explícita en el formato que se implemente, conservando alpha nativo binario.

Mostrar una caja de texto visible con el bloque completo y ofrecer descarga JSON de respaldo, aun si falla o se deniega el portapapeles. Alejandro pega ese bloque en **su chat del Chef conectado al PC**. No hay envío automático desde Vercel. La pantalla debe distinguir aprobación exportada de **Final reconstruido/adoptado**, estado que solo puede confirmar el trámite en PC.

La exclusión de `maestros-precocidos/` y `temporal/` del build se mantiene. Para el Original grande de cada tarea, se publica una **copia explícitamente seleccionada, sin alterar sus bytes, en el paquete estático de revisión**, con su hash y procedencia; no se incluye ninguna carpeta privada completa ni se declara runtime esa copia. La ubicación exacta de ese paquete sigue siendo diseño técnico pendiente; esta documentación no copia ni publica fuentes.

### Ciclo oficial de Chef al recibir la entrega en PC

1. **Reconstruir y validar.** Resolver asset/pose y revisión exactos; verificar `baseSha256` contra el PNG local y recuperar el contrato correspondiente. Aplicar únicamente los cambios por coordenadas, guardar un **Final inmutable** y calcular el diff RGBA real. Mantener separadas base de edición, base de comparación y Cook de origen: el aprendizaje humano compara contra Chef si se editó Chef, o contra Cook si se editó Cook. Ejecutar `check_adoption` con la revisión esperada del consumidor y verificar lienzo, raíz, transformación, apoyos, contactos y regiones protegidas, incluidos sus píxeles reales. La base Chef no tiene por qué ser el Cook todavía activo del consumidor: ambas revisiones se fijan por separado. Si falta la base, cambió su hash o fallan invariantes, rechazar e informar sin romper la revisión activa ni elegir “la más nueva” por fecha.
2. **Sustituir automáticamente.** Si la validación pasa, adoptar el Final en los consumidores nuevos compatibles, sustituyendo el Cook puro o la revisión compatible activa y conservando la anterior para rollback. No pedir una segunda aprobación rutinaria ni vincular historias nuevas por iniciativa propia. Lectura/exportación iniciadas mantienen su revisión hasta terminar; la siguiente carga recibe el Final adoptado.
3. **Aprender del diff.** Analizar los cambios reales de Alejandro entre la propuesta Chef —o Cook— y el Final; registrar la lección en **`learning/`**, ligada a asset, bases, hashes, coordenadas y aprobación. Distinguir lo observado de la interpretación; no inventar motivos ni convertir automáticamente un caso en regla universal. Una entrega rechazada no se registra como corrección humana adoptada. No es entrenamiento automático de pesos ni permiso para reescribir reglas canónicas.
4. **Preparar el siguiente de la cola.** Tomar la siguiente tarea pendiente dentro del encargo autorizado, consultar lo aprendido y preparar su propuesta de retoque IA sobre sus fuentes existentes. No inventar poses, activos o narrativa. **Solo cuando el flujo/encargo autorice publicar**, actualizar GitHub/Vercel con la siguiente tarea lista, Original y revisión/base fijados, y estados reales. Sin autorización de publicación, queda preparada localmente. Chef continúa como rol secuencial del chat, nunca como daemon ni servicio de Vercel.

Se conservan los controles locales de integridad, base obsoleta, serialización y atomicidad ya probados en PC; no son locks Wi-Fi ni un requisito de edición simultánea PC/teléfono. El formato versionado definitivo, identidad de tarea/entrega y tratamiento de paquetes repetidos se concretarán al implementar el importador; no se declara ese código existente.

**Orden de validación:** el piloto Cook→Phaser y el ensayo local manual/final/adopción ya realizados conservan su evidencia y límites. El siguiente E2E de teléfono será **Vercel estático en un teléfono real fuera de la red doméstica → edición → copiar/descargar entrega → pegado en Chef del PC → reconstrucción/validación → adopción → aprendizaje → siguiente tarea**. No exige pairing, misma Wi-Fi ni conflictos simultáneos por LAN. Hasta probar ese ciclo no se declara implementado el flujo móvil. Mantener NookForge operativo; esta decisión no inicia Alice nueva ni certifica todo Pixel Kitchen.

Conservar originales precocidos, maestros, finales, paquetes de entrega, bases del diff y trazabilidad compacta. Descartes/temporales solo se archivan o limpian tras comprobar dependencias y con autorización; el cambio de arquitectura no autoriza borrar pairing/locks históricos ni ningún archivo. El trabajo local puede seguir sin Internet para sus funciones existentes; consultar/publicar Vercel requiere Internet y las capacidades del agente/proveedor conservan sus propios requisitos.

## 8. Confirmado frente a propuesto; seguimiento documental

**Confirmado en este contrato:** nombre Pixel Kitchen; cinco compuertas y 3 pausada/no bloqueante; Cook inicial en 4 y uso de Cook puro; Chef/manual posteriores y mismo hilo; cuatro tamaños PNG; poses individuales, tres maestros y cuerpo estable; fuente preservada/derivado Cook; editor local PC y teléfono fuera de casa mediante Vercel estático → entrega copiada al Chef; descarte de LAN/pairing QR; diferencia aprobación/certificación; preservación legacy; alcance A/B; adopción automática validada del final al aprobar y guardar, sin segunda aprobación rutinaria.

**Aún propuesto, no aprobado en bloque:** resto del árbol y renombrado físico del PLAN fuera de la estructura de personajes confirmada arriba, story slug nuevo, estructura del catálogo, detalles de scripts y del perfil `agents/07-pixel-chef.md` aún no construido, valores de paleta/defaults, `pixelToWorld:2`, coordenadas concretas de raíces, tolerancias, detalles del esquema/versionado de entrega y del manifiesto/cola estática e importador (no sus campos/ciclo ya confirmados), protocolo general de concurrencia/releases/rollback fuera del ensayo aislado ya implementado, algoritmo y comandos de retención y selección concreta de activos/fixtures del piloto. El orden temprano del piloto Phaser sí queda confirmado por la aclaración posterior. Ninguna de estas elecciones técnicas modifica historias por quedar enlazada aquí.

**Pasos 1 y 2 cerrados:** contrato documental y contratos v1 con validadores aislados, respectivamente; ver [alcance implementado](../../tools/pixel-kitchen/README.md). No se reabren ni se confunden sus pruebas sintéticas con validación de arte o integración real. Las aclaraciones y el ensayo posteriores no reabren esos pasos ni amplían su cobertura histórica.

**Seguimiento actualizado:** las revisiones side y el piloto Cook→Phaser se ejecutaron en encargos posteriores al Paso 1. Los cinco insumos del piloto ya tienen aprobación visual exacta; un encargo anterior ya probó edición manual→final/diff→adopción y rollback en consumidor local aislado, sin Chef obligatorio. El encargo actual es solo documental y confirma su extensión futura Vercel→entrega al Chef. No inicia Alice nueva; LAN queda descartado por la decisión posterior de esta sección 7. La demo Vercel existente sigue siendo solo visualización: el editor táctil con entrega al Chef y el rol 07 son el siguiente trabajo propuesto, todavía sin implementar. Resultados y siguiente alcance: [PLAN](../../.artifacts/pixel-kitchen-transition/PLAN.md).

La numeración futura es documentalmente vigente para A/B; herramientas, certificados y packers actuales no adquieren soporte por cambiar un enlace. Si un helper solo entiende atlas/gates legacy, declararlo incompatible para el paquete nuevo y no emitir un certificado falso. La verificación histórica del Paso 1 se limita a enlaces, alcance y consistencia documental. Los ensayos posteriores declaran su cobertura concreta por separado; no prueban el nuevo ciclo de teléfono real Vercel→Chef, migración ni todo el sistema.


### Implementación acotada posterior: cola estática y Chef

El rol [07-pixel-chef](../../agents/07-pixel-chef.md), CLI y editor táctil en memoria del [preview](pixel-kitchen-preview.md) implementan el piloto aislado de entrega. La cola publica únicamente originales seleccionados; no lista el disco privado. El CLI no es un modelo ni servicio autónomo: ejecuta recetas de coordenadas inspeccionadas por el rol secuencial y valida adopción/diff. Las afirmaciones previas de integración pendiente describen los hitos anteriores; no se declara implementado el catálogo completo ni consumidores de historias. La prueba de teléfono físico y primera entrega real de Alejandro permanecen pendientes.

### Review Board de NOOK

Alejandro aprobó el formato de los dos pilotos de Fase E: G2 Pre-Cook y G4 Post-Cook. NOOK genera el [Review Board oficial](../../tools/review-board/README.md) para la decisión de escena en G1/G2 y emite revisiones en G4/G5. Pixel Kitchen aporta Cook y retoques opcionales. La aprobación del formato queda separada de las decisiones de una escena y de la evidencia de runtime y exportación.
