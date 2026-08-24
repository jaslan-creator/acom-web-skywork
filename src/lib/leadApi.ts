/**
 * El puente con Zentral para el formulario de «Abrir cuenta».
 *
 * 🚨 Si falta `https://www.zentralapp.ai` en `connect-src` del CSP (vercel.json), el navegador
 * bloquea la petición ANTES de que salga y el `catch` recibe un `TypeError: Failed to fetch` —
 * indistinguible de estar sin señal. Es un fallo mudo: nada aparece en los logs del servidor
 * porque la petición nunca llegó.
 */

const ZENTRAL_BASE = "https://www.zentralapp.ai";
/** El tenant de ACOM en Zentral. */
const TENANT_SLUG = "acom";

const ENDPOINT = `${ZENTRAL_BASE}/api/lead/${TENANT_SLUG}`;

export type LeadIntent = "account" | "question";

export interface LeadPayload {
  submissionKey: string;
  intent: LeadIntent;
  businessName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  state?: string;
  city?: string;
  geoCityId?: number | null;
  message?: string;
  /** Campo trampa. Un humano no lo llena nunca. */
  hp_website?: string;
}

export type LeadError = "rate_limited" | "invalid" | "offline" | "unknown";

/**
 * ¿Está publicada la captación?
 *
 * 🚨 FALLA CERRADA a propósito: si esto no responde, la página muestra los requisitos y el camino
 * de WhatsApp — que es exactamente como se comporta el sitio hoy. Fallar abierta dibujaría un
 * formulario que no puede enviar, y el visitante perdería lo que escribió.
 */
export async function isCaptureEnabled(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, { method: "GET", signal });
    if (!res.ok) return false;
    const json = (await res.json()) as { enabled?: boolean };
    return json.enabled === true;
  } catch {
    return false;
  }
}

export interface LeadResult {
  ok: boolean;
  /** Presente solo cuando `ok` es false. */
  error?: LeadError;
}

/**
 * Manda el formulario. La llave de idempotencia la acuña quien llama, UNA VEZ por intento: si se
 * genera en cada envío, un doble clic crea dos fichas del mismo negocio.
 *
 * ⚠️ Una sola forma con `error` opcional, y NO una unión discriminada: este repo compila con
 * `strict: false`, así que TypeScript no estrecha `{ok:true} | {ok:false, error}` y el acceso a
 * `error` no compila. La unión sería más elegante y no funciona acá.
 */
export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Sin señal, o el CSP bloqueando. Los dos se ven igual desde acá.
    return { ok: false, error: "offline" };
  }

  if (res.ok) return { ok: true };
  if (res.status === 429) return { ok: false, error: "rate_limited" };
  if (res.status === 400) return { ok: false, error: "invalid" };
  return { ok: false, error: "unknown" };
}

/** Una llave por intento. `crypto.randomUUID` existe en todo navegador que soporte este sitio. */
export function newSubmissionKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `k${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
  }
}
