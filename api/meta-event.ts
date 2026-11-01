/**
 * `/api/meta-event` — reenvía `Lead` y `CompleteRegistration` a la Conversions API de Meta.
 *
 * 🚨 Existe porque el pixel del navegador solo no alcanza: un bloqueador de anuncios o Safari/iOS
 * se lo comen y la conversión desaparece sin dejar rastro. El navegador manda acá el MISMO evento
 * con el mismo id, y Meta deduplica (ver `buildCapiPayload`).
 *
 * 🚨 Al visitante siempre le contesta 204 si el evento es válido, pase lo que pase con Meta o con
 * el token: lo manda `sendBeacon`, que ni mira la respuesta. Los fallos se gritan en los logs de
 * Vercel con el prefijo `[meta-event]`, que es donde hay que buscarlos.
 */
import { buildCapiPayload, readCookie, validateEvent } from "./_lib/capi.ts";
import { sendToMeta } from "./_lib/send.ts";

type Env = { token?: string; testEventCode?: string };

export async function handle(request: Request, env: Env, send: typeof sendToMeta): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });

  const result = validateEvent(await request.text(), request.headers.get("origin"));
  if ("status" in result) return new Response(null, { status: result.status });

  if (!env.token) {
    console.error("[meta-event] falta META_CAPI_ACCESS_TOKEN");
    return new Response(null, { status: 204 });
  }

  const cookies = request.headers.get("cookie");
  const payload = buildCapiPayload(result, {
    ip: request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    fbp: readCookie(cookies, "_fbp"),
    fbc: readCookie(cookies, "_fbc"),
    nowSeconds: Math.floor(Date.now() / 1000),
    testEventCode: env.testEventCode,
  });

  const sent = await send(payload, env.token);
  if (!sent.ok) console.error(`[meta-event] Meta respondió ${sent.status} para ${result.eventName}`);
  return new Response(null, { status: 204 });
}

export function POST(request: Request): Promise<Response> {
  return handle(
    request,
    { token: process.env.META_CAPI_ACCESS_TOKEN, testEventCode: process.env.META_TEST_EVENT_CODE },
    sendToMeta,
  );
}
