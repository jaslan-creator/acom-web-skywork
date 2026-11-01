/**
 * Validación y armado del evento para la Conversions API de Meta.
 *
 * 🚨 El endpoint es público: cualquiera le puede hacer POST. Lo que se valida acá es lo que impide
 * que alguien le meta al pixel eventos inventados (una «Purchase» falsa entrena a Meta sobre basura
 * y no da ningún error). El chequeo de `Origin` no autentica —se falsifica con curl—; la lista
 * cerrada de eventos y el formato del id son lo que acota el daño.
 *
 * Sin dependencias y sin I/O, para poder testearlo con `node --test`.
 */
import type { HashedUserData } from "../../src/lib/metaMatch.ts";

export const PIXEL_ID = "1274191492980071";
export const ALLOWED_EVENTS = ["Lead", "CompleteRegistration"] as const;
export const ALLOWED_HOSTS = ["acomve.com", "www.acomve.com"];

const MAX_BODY_BYTES = 4096;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const USER_DATA_KEYS = ["em", "ph", "fn", "ln", "ct", "st", "country"] as const;

export type IncomingEvent = {
  eventName: (typeof ALLOWED_EVENTS)[number];
  eventId: string;
  eventSourceUrl: string;
  customData?: Record<string, string>;
  userData?: Partial<HashedUserData>;
};

export type Rejection = { status: 400 | 403 | 413; reason: string };

export type RequestContext = {
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  nowSeconds: number;
  testEventCode?: string;
};

/** Los previews de Vercel viven en `*.vercel.app`; sin esto no se puede probar antes de producción. */
function isAllowedHost(host: string): boolean {
  return ALLOWED_HOSTS.includes(host) || host.endsWith(".vercel.app");
}

function hostOf(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export function validateEvent(rawBody: string, origin: string | null): IncomingEvent | Rejection {
  const originHost = hostOf(origin);
  if (!originHost || !isAllowedHost(originHost)) return { status: 403, reason: "origin" };
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) return { status: 413, reason: "size" };

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { status: 400, reason: "json" };
  }
  if (typeof parsed !== "object" || parsed === null) return { status: 400, reason: "json" };

  const { eventName, eventId, eventSourceUrl, customData, userData } = parsed;
  if (!ALLOWED_EVENTS.includes(eventName as IncomingEvent["eventName"])) return { status: 400, reason: "event" };
  if (typeof eventId !== "string" || !UUID_V4.test(eventId)) return { status: 400, reason: "event_id" };
  const urlHost = typeof eventSourceUrl === "string" ? hostOf(eventSourceUrl) : undefined;
  if (!urlHost || !isAllowedHost(urlHost)) return { status: 400, reason: "url" };

  const ev: IncomingEvent = {
    eventName: eventName as IncomingEvent["eventName"],
    eventId,
    eventSourceUrl: eventSourceUrl as string,
  };

  if (customData && typeof customData === "object") {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(customData)) if (typeof v === "string") clean[k] = v.slice(0, 100);
    ev.customData = clean;
  }

  // Lo que no es un hash conocido se descarta en silencio: un teléfono en claro que se colara acá
  // NO debe llegar a Meta, y rechazar el evento entero perdería la conversión.
  if (userData && typeof userData === "object") {
    const clean: Partial<HashedUserData> = {};
    for (const key of USER_DATA_KEYS) {
      const v = (userData as Record<string, unknown>)[key];
      if (typeof v === "string" && SHA256_HEX.test(v)) clean[key] = v;
    }
    ev.userData = clean;
  }

  return ev;
}

export function buildCapiPayload(ev: IncomingEvent, ctx: RequestContext): { data: object[]; test_event_code?: string } {
  const userData: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(ev.userData ?? {})) userData[k] = [v];
  if (ctx.ip) userData.client_ip_address = ctx.ip;
  if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;
  if (ctx.fbp) userData.fbp = ctx.fbp;
  if (ctx.fbc) userData.fbc = ctx.fbc;

  const event: Record<string, unknown> = {
    event_name: ev.eventName,
    // 🚨 El mismo id que el `eventID` del pixel: es lo único que hace que Meta cuente uno, no dos.
    event_id: ev.eventId,
    event_time: ctx.nowSeconds,
    action_source: "website",
    event_source_url: ev.eventSourceUrl,
    user_data: userData,
  };
  if (ev.customData) event.custom_data = ev.customData;

  const payload: { data: object[]; test_event_code?: string } = { data: [event] };
  if (ctx.testEventCode) payload.test_event_code = ctx.testEventCode;
  return payload;
}

export function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return undefined;
}
