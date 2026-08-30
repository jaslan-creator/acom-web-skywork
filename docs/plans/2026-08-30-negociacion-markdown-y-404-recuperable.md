# Negociación de Markdown, 404 recuperable y alias — implementación 2026-08-30

Cierre de los puntos accionables de un informe externo de «preparación para agentes» (78/100).

## Lo primero: tres de los siete puntos del informe estaban mal medidos

Verificado contra el sitio vivo **antes** de implementar nada:

- La página de privacidad **existe** (`/politica-de-privacidad`). El auditor buscó `/privacy` y
  `/about`, slugs en inglés que este sitio no usa.
- El JSON-LD **ya tenía** `url`, `logo`, `sameAs` y `address`: viven dentro de un `@graph` que la
  herramienta no parece recorrer.
- El descubrimiento de marca (buscar «ACOM Trading» no devuelve el dominio) **no es un defecto del
  sitio**: el apex redirige a `www` en un salto, la home es `index, follow` y el canonical es
  correcto. Es trabajo de fuera del sitio.

Implementar la lista tal cual habría sido escribir datos que ya estaban y no arreglar nada.

## El hallazgo que cambió el mecanismo: un `rewrite` sobre una página existente NO dispara

El plan aprobado pedía servir el Markdown con `rewrites` + `has: Accept`. **Medido en un preview el
2026-08-30, eso es un no-op**: `/contacto` con `Accept: text/markdown` devolvió `text/html`. La
documentación de Vercel lo dice — *«The `source` property should NOT be a file because precedence is
given to the filesystem prior to rewrites being applied»* — y con `cleanUrls` las diez rutas SON
archivos.

Se probaron los tres mecanismos declarativos en un mismo preview, uno por ruta:

| Mecanismo | Resultado medido |
|---|---|
| `rewrites` + `has` | **200 `text/html`** — no dispara nunca |
| `routes` + `has` | **200 `text/markdown`, misma dirección** ✅ |
| `redirects` + `has` | 307 al `.md` — funciona, pero cambia la dirección |

Se eligió **`routes`**, que entrega exactamente lo que el plan buscaba (misma dirección, 200,
Markdown) y sigue siendo declarativo: **cero ejecución en el borde**, que es la decisión que ya se
había tomado. Contra lo que decía la documentación vieja, `routes` **sí convive** con `rewrites`,
`redirects`, `headers`, `cleanUrls` y `trailingSlash` — confirmado por deploy, no por lectura.

## Implementado

1. **Markdown por negociación** (`vercel.json`): diez entradas explícitas en `routes`, una por ruta
   del manifiesto. `has` exige que `Accept` contenga `text/markdown`; `missing` excluye el rechazo
   explícito `;q=0`. Verificado: `text/markdown` → Markdown · `;q=0` y `;q=0.0` → HTML ·
   `;q=0.9` → Markdown · navegador, `*/*` y sin cabecera → HTML.
2. **404 recuperable** (`src/pages/not-found/Index.tsx`): enlaces al mapa del sitio, `llms.txt`,
   índice para agentes y las nueve secciones, derivadas de `PUBLIC_ROUTES`. Sigue devolviendo 404.
3. **`/agent/404.md`**: contenido de recuperación para agentes, enlazado desde `llms.txt`.
4. **`llms.txt`** gana «Cuándo usar ACOM Trading como fuente» y «Cómo llamarnos», todo derivado del
   manifiesto.
5. **`contactPoint`** dentro del nodo `Organization` que ya existía, derivado de `PUBLIC_SITE`.
6. **Alias en inglés** como redirección **307**: `/privacy`, `/privacidad`, `/about`, `/contact`,
   `/terms`, `/faq`.
7. **`PRIVACY_UPDATED_AT`**: la fecha del documento legal deja de estar escrita a mano en la página.
8. **`verificar-contenido.mjs`** pasa a revisar los `.md`.
9. **Ocho invariantes nuevos** en `verificar-aeo.mjs`, **todos ejercidos en rojo y en verde**.

## Decisiones deliberadas — no las «arregles» sin leer esto

- **Nunca se devuelve un 406.** Ante cualquier duda se entrega la página. Decisión del dueño.
- **`routes` y no `rewrites`.** Ver arriba: el `rewrite` no dispara. Y **no** una capa de ejecución
  en el borde: sería el primer punto único de fallo de un sitio que hoy no ejecuta nada, y —medido—
  ese archivo queda fuera de todos los `tsconfig` del repo, así que un error de tipos se publicaría
  en verde. No compra nada: ninguna cabecera `Accept` de navegador ni de buscador contiene jamás la
  cadena `text/markdown`, así que la regla declarativa **no le puede entregar Markdown a una persona;
  es imposible por construcción**, no por parsear bien las prioridades `q`.
- **`Vary: Accept` va EN CADA REGLA, no solo en el bloque global.** Medido: cuando un `routes`
  empareja, las cabeceras globales **no** se aplican a esa respuesta. Por eso cada regla lleva
  además `X-Content-Type-Options: nosniff`.
- **307 y no 308 en los alias.** Una permanente la cachea el navegador para siempre: el día que
  `/faq` sea una página de verdad, quien haya tocado el alias no podría llegar nunca. Se endurecen
  cuando tengan tráfico probado. ⚠️ Vercel evalúa las redirecciones **antes** que la negociación: un
  agente que pida `/faq` en Markdown recibe primero el 307 y negocia en el salto siguiente.
- **Los alias NUNCA entran al sitemap**, que trae exactamente el manifiesto. Lo afirma el gate.
- **No se sirve un 404 en Markdown por negociación.** Una regla de reescritura devuelve **200**, así
  que cumplir esa media línea del informe **destruiría el 404 real**, que es el punto principal del
  mismo ítem. Se prefiere el 404 honesto; el contenido de recuperación vive en `/agent/404.md`.
- **Los enlaces del 404 van en `<a href>`, jamás en `<Link>`.** El router registra
  `PUBLIC_ROUTES` + `404` + comodín: un `<Link to="/llms.txt">` lo intercepta, empareja el comodín y
  vuelve a dibujar la misma página 404 — el enlace no recupera nada y no da ningún error.
- **La fecha legal NO se deriva de `CONTENT_UPDATED_AT`.** Esa constante es la frescura del *sitio* y
  alimenta el `<lastmod>` de las diez URLs: atarla haría que un retoque de texto en `/marcas`
  re-fechara un documento legal, afirmando una revisión que nadie hizo. Mismo criterio para Términos
  el día que se toque.
- **`llms.txt` no describe el formulario.** Su envío va a un servicio externo tras un candado
  anti-bot y está declarado `leadSubmission: false`: documentarlo sería publicar una capacidad que no
  existe, y encima invitar a que la golpeen. Se indica leer el Markdown y **entregar la conversación
  a una persona**.
- **No hay sección «Cuándo NO usar»** más allá de lo ya publicado en las Preguntas frecuentes (no se
  vende al detal): los datos del sitio dicen qué hace el negocio, no para quién está mal. Derivarla
  sería inventar política comercial. **Pendiente de las palabras del dueño.**

## El envenenamiento de caché: medido, no supuesto

La documentación de Vercel no dice en ningún lado que su CDN respete `Vary` en archivos estáticos.
Prueba sobre una ruta virgen, en los dos órdenes:

```
humano1: text/html      x-vercel-cache: MISS   vary: Accept
humano2: text/html      x-vercel-cache: HIT    vary: Accept
AGENTE : text/markdown  x-vercel-cache: MISS
humano3: text/html      x-vercel-cache: HIT    vary: Accept
humano4: text/html      x-vercel-cache: HIT    vary: Accept
humano5: text/html      x-vercel-cache: HIT    vary: Accept
```

La entrada del agente fue **MISS** (clave de caché separada) y las peticiones humanas siguientes
siguieron dando **HIT** sobre el HTML: **la CDN sí keyea por `Accept`. No hay envenenamiento.**
Marcha atrás si alguna vez apareciera: borrar el array `routes` de `vercel.json`. Nada más.

## Límite del gate — verde aquí NO prueba vivo en producción

Las aserciones sobre enrutamiento leen el `vercel.json` **del repositorio**, no lo que Vercel sirve.
Un `route` puesto a mano en el panel del proveedor puede pisarlo **sin ningún deploy**. Por eso toda
afirmación de enrutamiento se acompaña de una comprobación contra el dominio.

## Lo que no se puede arreglar con código

- **Descubrimiento de la marca**: presencia en directorios, menciones que enlacen al dominio y alta
  en Search Console. Necesita credenciales y decisiones del dueño.
- **JSON-LD marcado como parcial**: los campos que pide ya están. Si la herramienta no recorre
  `@graph`, seguirá marcándolo incompleto, y eso no se arregla empeorando el marcado.
- **RIF / identificador fiscal**: no está en ninguna parte del repositorio. Publicarlo reforzaría la
  verificación del negocio, pero es un dato que tiene que dar el dueño.
