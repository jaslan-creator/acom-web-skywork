# El pixel de Meta solo cuenta lo que pasa en www.acomve.com

**Estado:** implementado el 2026-11-04 (`index.html` + `tests/pixelSoloEnProduccion.test.ts`).

## El defecto

El snippet del pixel (`index.html`) cargaba `fbevents.js` y disparaba `init` + `PageView` en **cualquier host**.

Medido en Meta el 2026-11-04 (dataset `1274191492980071`, 7 días, por host):

| Host | Eventos |
|---|---|
| `www.acomve.com` | ~250 |
| URLs de preview de Vercel (`acom-web-skywork-*.vercel.app`) | 16 |
| `localhost` | 8 |

No fallaba nada. Cada día de desarrollo ensuciaba las estadísticas y las audiencias de visitantes del sitio.

## El arreglo

1. **El snippet entero va dentro de un chequeo de host.** El `if` corre antes de crear `fbq`, así que fuera de producción no se descarga el script ni se dispara nada. `src/lib/analytics.ts` ya llama `window.fbq?.(...)`, de modo que no hubo que tocarlo.
2. **La lista de hosts tiene un solo dueño:** `ALLOWED_HOSTS` de `api/_lib/capi.ts`. El test la compara con la del HTML.
3. **El test ejecuta el script de verdad** en un sandbox de `node:vm`. No busca un texto: una condición que se lee bien pero no corta nada pasaría un test de texto en verde.
   - Se ejerció en rojo: contra el `index.html` anterior y con un host de más.

## Lo que no se tocó, a propósito

- **La CAPI (`/api/meta-event`).**
  - Desde localhost ya la rechaza el chequeo de origen.
  - Desde los previews manda con `META_TEST_EVENT_CODE`, a propósito, para probarla antes de producción.
  - Ojo: en un preview ya no hay pixel del navegador, así que el Test Events de Meta muestra solo la copia del servidor.
- **El `<noscript>`.** Sin JavaScript no hay `location` y no se puede limitar por host. Solo dispara en navegadores sin JS.
- **`link.acom.com.ve` y `smartpa.ge`.** También le mandan eventos al pixel (6 PageView, por servidor, el 2026-11-03). Parecen la página de enlaces de ACOM, o sea tráfico legítimo de marketing.

## Decisión del founder (2026-11-04): el portal de clientes NO lleva pixel

Se preguntó si convenía instalar este mismo pixel en `cliente.acomve.com` (portal de clientes, repo FMAPP) y rastrear todo, conversiones incluidas. Tras el análisis el founder decidió que no. Las razones, para no volver a proponerlo sin datos nuevos:

1. **No hay volumen.**
   - Una audiencia de Meta necesita al menos 100 personas reconocidas. El último dato del portal es de agosto de 2026: 17 cuentas de 10 clientes.
   - Optimizar campañas por compra pide unas 50 conversiones por semana.
2. **El ciclo es más largo que la ventana de Meta.** Meta atribuye hasta 7 días después del clic. El camino de ACOM es anuncio → WhatsApp o formulario → solicitud de crédito → alta en Odoo → invitación al portal → cotización.
3. **El portal es una parte chica de las ventas, y ahí el cliente no compra.** Envía una cotización que aprueba su vendedor, y la mayoría de las ventas las toma el vendedor con su app.
4. **Tiene un costo de seguridad.**
   - El portal guarda la sesión en el navegador y muestra facturas, deudas y RIF.
   - `/auth-callback` y `/solicitud-credito` llevan llaves en la URL, y el pixel le manda la URL completa a Meta.
   - Además comparte bundle con la web de los vendedores (`fmapp.expo.app`).
   - Zentral ya dejó su pixel fuera de la oficina por una razón parecida.

**Si algún día se quiere medir más allá de la web, el camino recomendado no es el pixel del portal. Es esto, por servidor:**
- Zentral le avisa a Meta (CAPI) la **primera compra** y las siguientes de cada cliente, venga por vendedor, portal u oficina. El cliente se identifica con su correo y teléfono cifrados.
- **Audiencias por lista de clientes** (activos, dormidos, perdidos) sincronizadas desde Zentral.
- Si hay campañas que lleven clientes al portal a pedir en línea: un evento por servidor desde `POST /api/portal/orders` (Task App), sin script en el navegador.
