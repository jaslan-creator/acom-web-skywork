# 404 en Markdown, instrucción para agentes y JSON-LD partido — implementación 2026-08-30 (2.ª ronda)

Cierre de los cuatro puntos de un segundo informe externo de «preparación para agentes» (**92/100**),
posterior a la ronda de esa misma mañana que lo movió de 78 a 92.

## Lo primero: dos de los cuatro no eran datos que faltaran

Verificado contra el sitio vivo **antes** de tocar nada:

- El JSON-LD **ya tenía** `url`, `logo`, `sameAs` y `address`. El informe los pedía igual.
- `llms.txt` **ya tenía** la sección «cuándo usar», con ocho viñetas derivadas del manifiesto, más
  «cómo llamarnos» y el límite publicado. El informe la reportaba ausente.

⇒ **lo que falla es la forma de entrega, no el contenido.** En el primer caso, el nodo `Organization`
vivía dentro de un `@graph`, y el raíz de un documento con `@graph` no tiene `@type`: un consumidor
que abre el primer bloque y pregunta por el tipo no encuentra nada. En el segundo, la sección está en
español y la detección es en inglés. Implementar la lista al pie de la letra —«agregá url y logo»—
habría escrito campos que ya estaban.

## El hallazgo que cambió el mecanismo: la fase que suena correcta es la peligrosa

El objetivo era servir `/agent/404.md` **con estado 404** en cualquier dirección inexistente. La
ronda anterior lo había descartado con esta nota:

> *No se sirve un 404 en Markdown por negociación. Una regla de reescritura devuelve **200**, así que
> cumplir esa media línea del informe destruiría el 404 real.*

**La objeción era al mecanismo, no al objetivo**, y el mecanismo que la resuelve lo descubrió esa
misma ronda: una entrada de `routes` acepta `status`, así que devuelve **404 y Markdown a la vez**.

Lo que sí obligó a pensar fue **qué fase**:

| Fase | Qué significa | Veredicto |
|---|---|---|
| `handle: "filesystem"` | «después de que el filesystem falle» | 🚨 **rechazada** |
| `handle: "error"` | «después de un error» | ✅ elegida |

`filesystem` suena exacto y es la que publica la propia guía de Vercel para un 404 personalizado.
Se rechaza porque está **río arriba** de lo que resuelve `/contacto` → `contacto.html`, y **la
documentación no dice en qué fase ocurre esa resolución de `cleanUrls`**. Si ocurriera en esa fase o
después, un comodín ahí interceptaría **todas las páginas del sitio** — y eso no se puede verificar
leyendo, solo desplegando. `error` está río abajo de todo (filesystem, `cleanUrls`, `redirects` y las
diez reglas de Markdown), así que **estructuralmente no las puede tocar**; y si la fase suprimiera el
`404.html` automático, el remedio vive en la misma fase, una línea más abajo.

✅ **Y la coexistencia dejó de ser un hallazgo empírico:** la documentación de Vercel, actualizada el
**2026-08-14**, ahora dice explícitamente que `routes` **se puede usar junto con** `rewrites`,
`redirects`, `headers`, `cleanUrls` y `trailingSlash`. El texto viejo que decía lo contrario ya no
existe; lo que aparece en buscadores son copias en caché. La producción de hoy no era un accidente.

## Implementado

1. **404 en Markdown con estado 404** (`vercel.json`): `{"handle":"error"}` + una regla comodín con
   `status: 404`, `dest: /agent/404.md`, los **mismos** regex de `Accept` y de rechazo `;q=0` que las
   diez reglas, y `Vary: Accept` + `nosniff` **en la propia regla**.
2. **`<link rel="alternate" type="text/markdown" href="/agent/404.md">`** en el 404, para el agente
   que recibió HTML porque no negoció. Es descubrimiento, no enrutamiento.
3. **`llms.txt` gana la guía en inglés**: «When to use this source» y «How to reach a human»,
   derivadas de los mismos datos, más el enlace a las instrucciones.
4. **`/agent-instructions.md`**, bilingüe (inglés primero): para qué es fuente, para qué **no**, cómo
   leer las representaciones Markdown, la tabla de las diez rutas, las capacidades y el traspaso
   obligatorio a una persona. Declarado también en `/agent/site.json` (`agentInstructions`).
5. **JSON-LD partido en dos bloques**: identidad plana primero (`@type` **cadena**), grafo después,
   con la organización **solo referenciada por `@id`**.
6. **`description`, `alternateName` y el RIF** entran al manifiesto como fuente única.
7. **Un invariante nuevo por cada cosa de arriba** en `verificar-aeo.mjs` — **28 ejercidos en rojo**,
   cada uno por su propio motivo, y verde restaurado.

## Decisiones deliberadas — no las «arregles» sin leer esto

- **El 404 en Markdown se entrega SOLO por negociación `Accept`.** Nada de husmear user-agent.
  Decisión del dueño. ⚠️ **Consecuencia aceptada a sabiendas:** si el auditor pide el 404 sin cabecera
  `Accept`, el ítem puede seguir marcado parcial. Se prefiere eso a que una persona que se equivoca
  de dirección reciba texto plano en vez de la página de recuperación que ya existe.
- 🚫 **NO se agrega una regla de respaldo a `/404.html` «por las dudas».** Medido: cuando un `routes`
  empareja, **las cabeceras globales no se aplican** — `/contacto` en Markdown no lleva CSP,
  `Referrer-Policy` ni `Permissions-Policy`, y el 404 humano de hoy sí las lleva. Esa regla
  «defensiva» le quitaría al 404 humano su CSP: una regresión de seguridad **silenciosa introducida
  por la propia medida de seguridad**. Si algún día hiciera falta, va con **todas** las cabeceras
  globales copiadas y un invariante que impida que las dos copias de la CSP se separen.
- 🚫 **Se evaluó y se descartó la versión sin fases** (un comodín con lista de exclusiones antes del
  filesystem). No detecta un 404: lo **afirma** desde una lista escrita a mano que tendría que
  enumerar las diez páginas, los assets, los doce artefactos, los siete alias y un archivo con
  **hash variable por build**. Su modo de fallo es que una página nueva devuelva «no encontrado» en
  Markdown mientras se ve perfecta en un navegador — falla mudo y **solo para agentes**, que son
  quienes no reportan. Si la fase `error` no hubiera servido, la decisión era **no hacer nada**.
- **La guía en inglés NO es un paso hacia un sitio bilingüe.** El sitio se queda en español. Es que
  las herramientas de agentes detectan en inglés, y está medido: el informe reportó «sin guía» con la
  sección española completa en el archivo.
- **Las instrucciones existen ADEMÁS de la sección de `llms.txt`, no en su lugar.** El informe acepta
  cualquiera de las dos formas y no se sabe cuál detecta; de fondo, un agente que entra por
  `/agent/site.json` nunca abre el `.txt`.
- **«Cuándo NO usarnos» no inventa política comercial.** Sus tres límites ya estaban publicados: no
  se vende al detal (Preguntas frecuentes), los precios no se publican (Preguntas frecuentes) y no
  hay checkout (`capabilities`). Ninguno se derivó de la nada.
- **Ninguna de las dos superficies documenta el envío del formulario**, igual que antes: va a un
  servicio externo tras un candado anti-bot y está declarado `leadSubmission: false`. ⚠️ En inglés
  hay una trampa propia — el token en mayúsculas del verbo de envío HTTP se escribe sin querer al
  explicar una API, y medio archivo es inglés. El gate lo prohíbe en las dos.
- **`@type` de la identidad va como CADENA.** `["Organization","WholesaleStore"]` es correcto en la
  norma y rompe a todo consumidor que compare por igualdad. El tipado múltiple se conserva en
  `additionalType`, que es la escotilla que Schema.org documenta para eso.
- **La organización se emite en las diez páginas y NO puede volver a aparecer dentro del `@graph`.**
  Ya se repetía igual antes; lo que cambia es que ahora está suelta y primero. Si volviera al grafo
  habría **dos fuentes de verdad de la misma entidad**, y se separarían sin que nada falle.
- **El RIF se publicó con dos fuentes, no con una.** Tu palabra y
  `zentral-erp-sync/docs/runbooks/auditoria-padron-clientes.md`, que lista
  «ACOM TRADING, C.A | J502296140». ⚠️ Publicar un identificador fiscal es irreversible en la
  práctica: queda indexado y cacheado por terceros aunque después se quite.
- **`PRIVACY_UPDATED_AT` y `CONTENT_UPDATED_AT` siguen separadas**, por el criterio de la ronda
  anterior. Nada acá las ata.

## El invariante que hubo que afinar, y por qué no es aflojarlo

El gate prohibía que `404.html` imprimiera la cadena `/404`: la página se renderiza en `/404` y se
sirve desde `/loquesea`, así que un enlace a su propia dirección mentiría y la hidratación
discreparía en el primer render. **Era una comparación de subcadena**, y el enlace nuevo a
`/agent/404.md` la disparó: `/agent/404.md` contiene `/404`.

No es un falso positivo cosmético — son dos invariantes reales chocando. Se afinó el guard a lo que
de verdad protege: **la página no puede imprimir SU PROPIA dirección**, y `/agent/404.md` no lo es.
La excepción va **expresada dentro de la regla** (`/404` que no cuelgue de `/agent`), no como una
lista de exenciones aparte — un guard con exenciones deja de leerse. Se probó la expresión sobre
cinco casos, incluidos `/404` y `/404.html`, que siguen prohibidos.

## Límite del gate — verde acá NO prueba vivo en producción

Heredado y vigente: las aserciones de enrutamiento leen el `vercel.json` **del repositorio**, no lo
que Vercel sirve. Un `route` puesto a mano en el panel lo pisa **sin ningún deploy**. Por eso toda
afirmación de enrutamiento se acompaña de una comprobación contra el dominio.

⚠️ **Y hay un riesgo nuevo, declarado:** la documentación de Vercel marca `handle` como **deprecado**
(recomienda `rewrites`, que comprueba el filesystem por su cuenta). Hoy funciona y es el patrón que
la propia guía de Vercel publica para un 404 personalizado, pero el día que lo remuevan **no se cae
solo el 404: se cae la negociación de Markdown entera**, que son las diez páginas.

## Lo que no se puede arreglar con código

- **Descubrimiento de la marca.** El sitio no tiene el defecto: el apex resuelve a `www` en un salto,
  la home es `index, follow` y el canonical es correcto. Es indexación y presencia — Search Console,
  ficha de Google Business Profile, altas consistentes en directorios y menciones que **enlacen** al
  dominio canónico. Necesita credenciales del dueño. Lo único que se hizo dentro del sitio son las
  grafías alternas y el RIF.
- **Perfiles adicionales para `sameAs`.** Hoy hay Facebook, Instagram y LinkedIn. No se inventan URLs.
- **El ítem del JSON-LD puede seguir marcado parcial** aunque quede impecable: si el parser del
  informe falla por otra razón que no sea el `@graph`, esto no lo mueve — y no se arregla empeorando
  el marcado. Lo que sí queda es un JSON-LD estrictamente más compatible que el de ayer.

## Marcha atrás

- Enrutamiento: quitar las dos entradas nuevas de `routes` en `vercel.json` y desplegar. Nada más.
- JSON-LD: revertir `structuredData.ts` + `SeoHead.tsx` al bloque único con `@graph`.
- Artefactos: se regeneran del manifiesto en cada build; revertir el generador los repone.
