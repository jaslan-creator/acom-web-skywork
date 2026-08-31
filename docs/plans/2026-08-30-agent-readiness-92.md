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

## El hallazgo que cambió el mecanismo: la fase que suena correcta apaga media configuración

El objetivo era servir `/agent/404.md` **con estado 404** en cualquier dirección inexistente. La
ronda anterior lo había descartado con esta nota:

> *No se sirve un 404 en Markdown por negociación. Una regla de reescritura responde **200**, así que
> cumplir esa media línea del informe destruiría el 404 real.*

**La objeción era al mecanismo, no al objetivo**, y el mecanismo que la resuelve lo descubrió esa
misma ronda: una entrada de `routes` acepta `status`, así que devuelve **404 y Markdown a la vez**.

### 🚨 `{"handle":"error"}` desactiva los `redirects` y el bloque `headers` ENTEROS

La primera versión usó el marcador de fase `error`, que es lo que la propia guía de Vercel publica
para un 404 personalizado. Se descartó `filesystem` con un argumento correcto (está río arriba de la
resolución de `cleanUrls`, y la documentación no dice dónde ocurre) y se eligió `error` por estar río
abajo de todo. **El razonamiento era bueno y el resultado fue falso**, y lo dijo el preview:

| Sondeo, mismo dominio de preview | con `{"handle":"error"}` | sin marcador (commit anterior) |
|---|---|---|
| `/faq` | **404** | 307 → `/preguntas-frecuentes` |
| `/about`, `/contact`, `/terms`… | **404** | 307 |
| Cabeceras globales en `/contacto` | **0 de 3** | 3 de 3 |
| `Cache-Control` de `/images` | `max-age=0` | `max-age=86400` |

⇒ el marcador puso a Vercel en modo `routes` heredado y **apagó los siete alias, la CSP, la
`Permissions-Policy`, la `Referrer-Policy` y el cacheo de imágenes**. 🚨 **Sin un solo error**: el
sitio se veía idéntico. Ir directo a `main` habría publicado eso, y lo único que lo cazó fue correr
el control **con el código anterior en el mismo dominio de preview** — el preview solo no alcanzaba,
porque ahí las cabeceras también faltan por el candado de despliegue, y esa coincidencia parecía la
explicación.

### Lo que quedó: un comodín al final, sin fase

La regla va al final de `routes`, **sin `handle`**. Corre antes del filesystem, así que **no detecta
un 404: lo afirma** — y lo que la vuelve segura es que exige que la ruta **no tenga ni un punto**.
Medido: los **68 archivos de `dist/` tienen extensión**, incluido el manifiesto con hash variable por
build que era justo lo que hundía la versión enumerada de esta idea. Las diez páginas las atrapan sus
propias reglas, que van antes.

🚨 **Y su lista de exclusiones se DERIVA de los `redirects`, jamás se escribe a mano.** Un alias nuevo
sin tocar el comodín dejaría de redirigir y empezaría a devolver «no encontrado» en Markdown: callado
y **solo para agentes**, que son quienes no reportan. El gate compara la expresión contra la lista
derivada y se pone rojo — ejercido.

✅ **Y la coexistencia dejó de ser un hallazgo empírico:** la documentación de Vercel, actualizada el
**2026-08-14**, dice explícitamente que `routes` **se puede usar junto con** `rewrites`, `redirects`,
`headers`, `cleanUrls` y `trailingSlash`. Lo que no dice en ningún lado es que **`handle` rompe esa
convivencia**, que es exactamente lo que se midió.

## Implementado

1. **404 en Markdown con estado 404** (`vercel.json`): una regla comodín al final, **sin fase**, con
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
7. **Un invariante nuevo por cada cosa de arriba** en `verificar-aeo.mjs` — **29 ejercidos en rojo**,
   cada uno por su propio motivo, y verde restaurado. Entre ellos, el que prohíbe que vuelva a
   aparecer un `handle` en `routes`.

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
- 🚫 **La versión enumerada del comodín se descartó** — la que lista a mano las páginas, los assets,
  los artefactos y los alias. Uno de los archivos lleva **hash variable por build**: una exclusión
  literal se pudre en el build siguiente y una con comodín ensancha el agujero. Lo que la reemplaza
  no enumera casi nada: exige **ausencia de punto**, que es una propiedad del conjunto entero, y su
  única lista —los alias— **se deriva de `redirects`** en vez de escribirse.
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
