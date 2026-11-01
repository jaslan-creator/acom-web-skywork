import { PIXEL_ID } from "./capi.ts";

/** Fijada a mano; la vigente al 2026-11-01 según el changelog de la Graph API. */
export const GRAPH_VERSION = "v26.0";

const TIMEOUT_MS = 3000;

/**
 * Nunca lanza: si Meta tarda o está caído, el visitante no tiene por qué enterarse. El que llama
 * decide qué loguear con el `status` (0 = red o timeout).
 */
export async function sendToMeta(
  payload: object,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number }> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
