# Medición desde el servidor (Meta Conversions API) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que `Lead` (clic a WhatsApp) y `CompleteRegistration` (envío de «Abrir cuenta») lleguen a Meta también desde el servidor, deduplicados con el pixel del navegador, para que bloqueadores y Safari/iOS no se coman las conversiones.

**Architecture:** el navegador sigue disparando `fbq(...)`, ahora con un `eventID`. En paralelo manda el mismo evento con `navigator.sendBeacon` a una Vercel Function propia (`/api/meta-event`), que le agrega IP, user agent y cookies `_fbp`/`_fbc` y lo reenvía a la Graph API. Meta une los dos por `event_name` + `event_id`. Los datos de contacto del formulario se normalizan y se cifran con SHA-256 **en el navegador**: el texto plano nunca sale de la página hacia nosotros ni hacia Meta.

**Tech Stack:** Vite + vite-react-ssg en Vercel, Vercel Functions (Node 24, firma Web `export function POST(request: Request)`), `node --test` con TypeScript nativo de Node 24 (sin dependencias nuevas), Web Crypto (`crypto.subtle`).

**Spec:** no hay documento aparte; los requisitos salen de la conversación del 2026-11-01 y del diagnóstico del pixel (abajo).

### Diagnóstico de partida (medido el 2026-11-01 vía API de Meta)

- Pixel `1274191492980071` («Acom Business's Pixel»), activo, último evento del navegador: hoy.
- 7 días: ~52 `PageView`, 8 `Lead`, **0 `CompleteRegistration`**.
- `server_last_fired_time`: **2025-03-18**. La CAPI está muerta hace 19 meses.
- Cookie propia y emparejamiento automático: activos. Gateway de CAPI: no contratado.

### Decisión de arquitectura (y la alternativa descartada)

**Elegido: función propia en este repo.** Cubre los dos eventos; `Lead` solo existe en el navegador (un clic a `wa.me`), así que ningún otro sistema puede mandarlo.

**Descartado por ahora: que Zentral mande `CompleteRegistration` al recibir el formulario.** Tendría datos validados por el servidor, pero toca otro repo y otro despliegue, y deja `Lead` sin cubrir igual. Si más adelante se quiere, se mueve solo ese evento a Zentral sin tocar `Lead`, usando el mismo `eventId` (que habría que mandar en el payload del formulario).

**Descartado: CAPI Gateway de Meta.** Cobra infraestructura (AWS) por algo que es una función de 100 líneas.

## Global Constraints

- Pixel ID: `1274191492980071` (constante en código, no es secreto).
- Token: variable de entorno `META_CAPI_ACCESS_TOKEN` en Vercel (Production y Preview). **Nunca** en el repo ni en el bundle del navegador.
- Opcional: `META_TEST_EVENT_CODE` solo en Preview, para ver los eventos en «Probar eventos» sin ensuciar producción.
- Eventos permitidos en el servidor: exactamente `Lead` y `CompleteRegistration`. `PageView` no va por servidor (YAGNI: no optimizamos campañas a visitas).
- `action_source`: `"website"`. `event_time`: segundos Unix, sellado en el servidor.
- `country` siempre `"ve"` (hasheado).
- Endpoint mismo origen: el CSP ya cubre `connect-src 'self'`; **no se toca el CSP**.
- La analítica nunca rompe la navegación ni el formulario: todo envuelto en `try`, todo fire-and-forget.
- Comentarios y nombres al estilo del repo: español, con el «porqué» marcado con 🚨 cuando el error sería mudo.

## Review Focus

1. **Bloqueador de anuncios activo** (`window.fbq` no existe): el envío al servidor tiene que salir igual; es justamente el caso que esta obra recupera. → test en Task 4 (verificación manual con uBlock).
2. **Teléfonos venezolanos en formatos reales** (`0414-1234567`, `+58 414 123 4567`, `(0212) 555 1234`, `4141234567`): todos deben dar `58XXXXXXXXXX`; basura corta no se manda. → tests en Task 1.
3. **POST desde otro origen o con evento inventado** (alguien envenenando el pixel): 403/400 y nada sale a Meta. → tests en Task 2.
4. **Meta lento o caído**: el visitante no se entera; la función corta a los 3 s y lo registra en logs. → Task 3, paso de verificación.
5. **Token ausente en el entorno**: no revienta ni devuelve 500 al visitante; lo grita en los logs. → test en Task 3.

---

### Task 1: Normalizar y cifrar datos de contacto (`src/lib/metaMatch.ts`)

**Files:**
- Create: `src/lib/metaMatch.ts` (sin imports con alias `@/`: lo importa `node --test`)
- Create: `tests/metaMatch.test.ts`
- Modify: `package.json` (scripts `test` y `build`)

**Interfaces:**
- Produces:
  - `normalizeEmail(raw: string): string | undefined`
  - `normalizePhoneVe(raw: string): string | undefined`
  - `normalizeName(raw: string): string | undefined`
  - `sha256Hex(value: string): Promise<string>` — con `crypto.subtle`, existe igual en navegador y Node 24.
  - `type ContactInput = { email?: string; phone?: string; firstName?: string; lastName?: string; city?: string; state?: string }`
  - `type HashedUserData = { em?: string; ph?: string; fn?: string; ln?: string; ct?: string; st?: string; country: string }`
  - `hashContact(input: ContactInput): Promise<HashedUserData>` — omite las claves cuyo normalizado es `undefined`; `country` siempre `sha256("ve")`.

- [ ] **Step 1: Escribir los tests que fallan** en `tests/metaMatch.test.ts` (`node:test` + `node:assert/strict`):
  - `normalizeEmail("  Ventas@ACOM.com ")` → `"ventas@acom.com"`; `normalizeEmail("sin-arroba")` → `undefined`; `normalizeEmail("")` → `undefined`.
  - `normalizePhoneVe` da `"584141234567"` para `"0414 123 4567"`, `"0414-1234567"`, `"+58 414 123 4567"`, `"584141234567"`, `"4141234567"`; da `"582125551234"` para `"(0212) 555 1234"`; da `undefined` para `"123"`, `""`, `"0414"`.
  - `normalizeName("  José ")` → `"josé"` (Meta acepta UTF-8; no se quitan acentos); `normalizeName("   ")` → `undefined`.
  - `sha256Hex("ve")` igual a `createHash("sha256").update("ve").digest("hex")` de `node:crypto`.
  - `hashContact({ email: "A@B.co", phone: "" })` tiene `em` y `country`, y **no** tiene la clave `ph`.
  - `hashContact({ city: "San Cristóbal" })`: `ct` es el hash de `"sancristóbal"` (minúsculas, sin espacios).

- [ ] **Step 2: Correr y ver que falla**
  Run: `node --test tests/`
  Expected: FAIL, no encuentra `../src/lib/metaMatch.ts`.

- [ ] **Step 3: Implementar `src/lib/metaMatch.ts`**
  Teléfono: quitar todo lo que no sea dígito; si empieza con `58` y tiene 12 dígitos, queda; si empieza con `0` y tiene 11, se cambia el `0` por `58`; si tiene 10, se le antepone `58`; cualquier otro largo da `undefined`. Ciudad y estado: `normalizeName` + quitar espacios.

- [ ] **Step 4: Correr y ver que pasa**
  Run: `node --test tests/`
  Expected: todos PASS.

- [ ] **Step 5: Engancharlo al build**
  En `package.json`: `"test": "node --test tests/"`, y anteponer `npm test && ` al script `build` existente (los tests van antes que el build, como `verificar-formulario.mjs`).
  Run: `npm run typecheck && npm test`
  Expected: sin errores.

- [ ] **Step 6: Commit**
  `git add src/lib/metaMatch.ts tests/metaMatch.test.ts package.json && git commit -m "feat(capi): normalizar y cifrar datos de contacto para Meta"`

---

### Task 2: Validar el evento y armar el payload de la CAPI (`api/_lib/capi.ts`)

**Files:**
- Create: `api/_lib/capi.ts` (el `_` hace que Vercel no lo publique como función)
- Create: `tests/capi.test.ts`

**Interfaces:**
- Consumes: `HashedUserData` de Task 1 (solo el tipo; importar con ruta relativa `../../src/lib/metaMatch.ts`).
- Produces:
  - `const PIXEL_ID = "1274191492980071"`
  - `const ALLOWED_EVENTS = ["Lead", "CompleteRegistration"] as const`
  - `const ALLOWED_HOSTS = ["acomve.com", "www.acomve.com"]` + cualquier `*.vercel.app` (para previews).
  - `type IncomingEvent = { eventName: "Lead" | "CompleteRegistration"; eventId: string; eventSourceUrl: string; customData?: Record<string, string>; userData?: Partial<HashedUserData> }`
  - `type Rejection = { status: 400 | 403 | 413; reason: string }`
  - `validateEvent(rawBody: string, origin: string | null): IncomingEvent | Rejection`
  - `type RequestContext = { ip?: string; userAgent?: string; fbp?: string; fbc?: string; nowSeconds: number; testEventCode?: string }`
  - `buildCapiPayload(ev: IncomingEvent, ctx: RequestContext): { data: object[]; test_event_code?: string }`
  - `readCookie(cookieHeader: string | null, name: string): string | undefined`

- [ ] **Step 1: Escribir los tests que fallan** en `tests/capi.test.ts`:
  - origen `https://evil.example` → `{ status: 403 }`; origen `null` → 403; `https://www.acomve.com` y `https://acom-web-xyz.vercel.app` → aceptados.
  - cuerpo de más de 4096 bytes → 413; JSON roto → 400; `eventName: "Purchase"` → 400; `eventId` que no es UUID v4 → 400; `eventSourceUrl` con host fuera de `ALLOWED_HOSTS` → 400.
  - `userData` con una clave que no es de `HashedUserData` o un valor que no es hex de 64 caracteres → se descarta esa clave (no se rechaza el evento).
  - `buildCapiPayload(ev, { ip: "1.2.3.4", userAgent: "UA", fbp: "fb.1.x", nowSeconds: 1700000000 })` → `data[0]` tiene `event_name`, `event_id` = `ev.eventId`, `event_time: 1700000000`, `action_source: "website"`, `event_source_url`, `user_data.client_ip_address: "1.2.3.4"`, `user_data.client_user_agent: "UA"`, `user_data.fbp: "fb.1.x"`; `em` (si viene) va como **arreglo** de un elemento; sin `fbc` no aparece la clave `fbc`; sin `testEventCode` no aparece `test_event_code`.
  - `readCookie("a=1; _fbp=fb.1.2.3; b=2", "_fbp")` → `"fb.1.2.3"`; si no existe, `undefined`.

- [ ] **Step 2: Correr y ver que falla**
  Run: `node --test tests/`
  Expected: FAIL en `capi.test.ts` (módulo inexistente); `metaMatch.test.ts` sigue en PASS.

- [ ] **Step 3: Implementar `api/_lib/capi.ts`** con las firmas de arriba. Sin dependencias.

- [ ] **Step 4: Correr y ver que pasa**
  Run: `node --test tests/`
  Expected: todo PASS.

- [ ] **Step 5: Commit**
  `git add api/_lib/capi.ts tests/capi.test.ts && git commit -m "feat(capi): validar eventos y armar el payload de Conversions API"`

---

### Task 3: La función `/api/meta-event` y su despliegue en preview

**Files:**
- Create: `api/meta-event.ts`
- Create: `api/_lib/send.ts` (el `fetch` a Meta, separado para poder testear el handler sin red)
- Create: `tests/meta-event.test.ts`

**Interfaces:**
- Consumes: `validateEvent`, `buildCapiPayload`, `readCookie`, `PIXEL_ID` de Task 2.
- Produces:
  - `api/_lib/send.ts`: `sendToMeta(payload: object, token: string, fetchImpl?: typeof fetch): Promise<{ ok: boolean; status: number }>` → POST a `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=…` con `AbortSignal.timeout(3000)`; nunca lanza (timeout/red → `{ ok: false, status: 0 }`).
  - `api/meta-event.ts`: `export async function POST(request: Request): Promise<Response>` y `handle(request: Request, env: { token?: string; testEventCode?: string }, send: typeof sendToMeta): Promise<Response>` (`POST` solo lee `process.env` y llama a `handle`).
  - Contrato HTTP: rechazo → su `status`; evento válido → **204** pase lo que pase con Meta; token ausente → 204 + `console.error("[meta-event] falta META_CAPI_ACCESS_TOKEN")`; Meta responde no-ok → 204 + `console.error` con el status. IP: primer valor de `x-forwarded-for`.

- [ ] **Step 1: Escribir los tests que fallan** en `tests/meta-event.test.ts`, llamando a `handle` con un `send` falso que registra llamadas:
  - origen ajeno → 403 y `send` no se llamó.
  - evento válido + token → 204 y `send` se llamó una vez, con `data[0].user_data.client_ip_address` = primer IP de `x-forwarded-for: "1.2.3.4, 10.0.0.1"` y `fbp` leído de la cabecera `cookie`.
  - evento válido sin token → 204 y `send` no se llamó.
  - `send` que devuelve `{ ok: false, status: 0 }` → igual 204.
  - con `testEventCode: "TEST123"` → el payload enviado lleva `test_event_code: "TEST123"`.

- [ ] **Step 2: Correr y ver que falla**
  Run: `node --test tests/`
  Expected: FAIL en `meta-event.test.ts`.

- [ ] **Step 3: Implementar `api/_lib/send.ts` y `api/meta-event.ts`.** El cuerpo se lee con `await request.text()` (sendBeacon manda `text/plain`). `GRAPH_VERSION`: la última versión estable que figure en https://developers.facebook.com/docs/graph-api/changelog el día de implementar, fijada como constante.

- [ ] **Step 4: Correr y ver que pasa**
  Run: `node --test tests/ && npm run typecheck`
  Expected: PASS.

- [ ] **Step 5 (acción del dueño): crear el token.** Events Manager → pixel `1274191492980071` → Configuración → API de conversiones → «Generar token de acceso». Cargarlo con `vercel env add META_CAPI_ACCESS_TOKEN` en Production y Preview. En Events Manager → «Probar eventos», copiar el código y cargarlo como `META_TEST_EVENT_CODE` **solo en Preview**.

- [ ] **Step 6: Desplegar preview y comprobar el endpoint**
  Run: `vercel deploy` y luego, contra la URL del preview:
  - `curl -s -o /dev/null -w "%{http_code}" -X POST -H "Origin: https://evil.example" -d '{}' <preview>/api/meta-event` → `403`
  - `curl -s -o /dev/null -w "%{http_code}" -X POST -H "Origin: <preview>" -d '{"eventName":"Lead","eventId":"<uuid v4>","eventSourceUrl":"<preview>/"}' <preview>/api/meta-event` → `204`, y el evento aparece en «Probar eventos» como **Servidor**.
  - `curl -s -o /dev/null -w "%{http_code}" <preview>/` y `<preview>/marcas` → `200`. Comprueba que crear `api/` no rompió el `routes` de `vercel.json`.
  - `curl -s -o /dev/null -w "%{http_code}" -H "Accept: text/markdown" <preview>/no-existe` → `404`. Comprueba que el 404 en Markdown sigue igual.

- [ ] **Step 7: Commit**
  `git add api/ tests/meta-event.test.ts && git commit -m "feat(capi): función /api/meta-event que reenvía Lead y CompleteRegistration a Meta"`

---

### Task 4: Conectar el navegador (`src/lib/analytics.ts` + `LeadForm.tsx`)

**Files:**
- Modify: `src/lib/analytics.ts` (completo: `trackWhatsappLeads`, `trackLeadFormSubmit`)
- Modify: `src/components/LeadForm.tsx:163` (la llamada a `trackLeadFormSubmit`)

**Interfaces:**
- Consumes: `hashContact`, `ContactInput`, `HashedUserData` de Task 1; contrato HTTP de Task 3.
- Produces:
  - `sendServerEvent(eventName: "Lead" | "CompleteRegistration", eventId: string, customData: Record<string, string>, userData?: HashedUserData): void` — `navigator.sendBeacon("/api/meta-event", JSON.stringify(...))`; si `sendBeacon` no existe o devuelve `false`, `fetch(..., { method: "POST", keepalive: true })`. Nunca lanza.
  - `trackLeadFormSubmit(intent: LeadIntent, contact: ContactInput): void` (firma nueva: suma `contact`).

- [ ] **Step 1: `Lead`.** En `trackWhatsappLeads`: `const eventId = crypto.randomUUID()`; `window.fbq?.("track", "Lead", customData, { eventID: eventId })`; `sendServerEvent("Lead", eventId, customData)`. 🚨 El envío al servidor va **fuera** del `if (fbq)`: con bloqueador `fbq` no existe y ése es el caso que se busca recuperar. Comentar el porqué.

- [ ] **Step 2: `CompleteRegistration`.** `trackLeadFormSubmit(intent, contact)`: mismo patrón de `eventId` para `fbq`; `hashContact(contact).then((ud) => sendServerEvent("CompleteRegistration", eventId, customData, ud)).catch(() => {})`. En `LeadForm.tsx:163` pasar `{ email, phone, firstName, lastName, city, state }` desde el estado del formulario (nombre y apellido ya son campos separados).

- [ ] **Step 3: Verificación local**
  Run: `npm run build`
  Expected: termina sin errores (incluye tests, typecheck y los verificadores).

- [ ] **Step 4: Verificación en preview con «Probar eventos»**
  Desplegar preview con `META_TEST_EVENT_CODE`. Para que el pixel del navegador también aparezca en la herramienta, abrir el preview desde el enlace que da Events Manager en «Probar eventos».
  - Clic a un botón de WhatsApp → aparece `Lead` de **Navegador** y de **Servidor** con el mismo ID, marcado «Deduplicado».
  - Enviar «Abrir cuenta» con datos de prueba → `CompleteRegistration` igual, y en el detalle del servidor figuran claves `em`/`ph` (hasheadas, nunca en claro).
  - Repetir el clic de WhatsApp **con uBlock Origin activo** → aparece solo el `Lead` de **Servidor**.
  - En la pestaña Red, el body de `/api/meta-event` no contiene el email ni el teléfono en claro.

- [ ] **Step 5: Commit**
  `git add src/lib/analytics.ts src/components/LeadForm.tsx && git commit -m "feat(capi): el navegador manda Lead y CompleteRegistration también al servidor, deduplicados"`

---

### Task 5: Política de privacidad, puesta en producción y control a 7 días

**Files:**
- Modify: `src/pages/Privacidad.tsx:91`
- Modify: el `.md` correspondiente de `/agent/pages/politica-de-privacidad.md`, si lo genera `scripts/generar-artefactos-publicos.mjs` a partir de la página (confirmar; si es así no se edita a mano)

- [ ] **Step 1 (decisión del dueño): texto de privacidad.** Propuesta, a aprobar antes de publicar, que se agrega después de la oración que menciona Meta Pixel:
  > «Cuando envías el formulario o nos escribes por WhatsApp desde el sitio, compartimos con Meta una versión cifrada e irreversible (hash) de tu correo, teléfono, nombre y ciudad, solo para medir el resultado de nuestros anuncios. Meta no recibe esos datos en texto legible.»

- [ ] **Step 2: Verificar**
  Run: `npm run build`
  Expected: sin errores; `node scripts/verificar-contenido.mjs` no se queja.

- [ ] **Step 3: Producción.** Merge a `main` → despliegue. Comprobar que `META_TEST_EVENT_CODE` **no** está en Production (`vercel env ls`).

- [ ] **Step 4: Control a las 48 h y a los 7 días** con la API de Meta (`ads_get_dataset_details` y `ads_get_dataset_stats`, agregación `event_source`):
  Expected: `server_last_fired_time` de la fecha del despliegue; `Lead` y `CompleteRegistration` con volumen de `SERVER`; el volumen de servidor ≥ el de navegador (la diferencia es lo que recuperan los bloqueadores). En `ads_get_dataset_quality`, EMQ de `CompleteRegistration` por encima del de `Lead`.

- [ ] **Step 5: Commit**
  `git add src/pages/Privacidad.tsx && git commit -m "docs(privacidad): declarar el envío cifrado de datos de contacto a Meta"`

---

### Riesgos residuales (aceptados, no tapados)

- **El chequeo de `Origin` no autentica.** Un script con `curl` puede falsificarlo y meter eventos falsos. La whitelist de eventos y el formato del `eventId` acotan el daño. Si algún día se ve basura en Events Manager, el siguiente paso es una regla de rate limit en el firewall de Vercel sobre `/api/meta-event`, no más código.
- **`CompleteRegistration` en 0 hoy** puede significar que nadie envió el formulario en 7 días o que el evento falla. El Step 4 de la Task 4 lo responde de paso, con un envío real de prueba.
- **Costo:** una invocación de función por conversión (~10/semana hoy). Despreciable.
