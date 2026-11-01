/**
 * Meta Pixel conversion tracking.
 *
 * 🚨 Why this exists. The pixel in index.html only ever fired `init` + `PageView`: zero
 * conversion events, not even the click to WhatsApp — which IS the conversion path of this
 * site, since every CTA on every page ends there. Two consequences, both commercial: any Meta
 * campaign was optimising towards visits instead of towards customers, and nobody knows how
 * many prospects the site produces, so there is no baseline to compare against later.
 *
 * 🚨 One delegated listener, not a call per button. There are eight WhatsApp links spread
 * across CTAButton, the header, the mobile menu, the footer and the floating bubble; wiring
 * each one is exactly the kind of enumeration that rots the next time somebody adds a link.
 * This catches every present and future `wa.me` anchor, including ones rendered by portals.
 *
 * ⚠️ What this canNOT measure, stated plainly: the contact form submit. It lives in an iframe
 * on forms.acom.com.ve — a different origin — so the page cannot observe it. `Lead` here means
 * "clicked through to WhatsApp", nothing more.
 */

import { hashContact, type ContactInput, type HashedUserData } from "./metaMatch";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_PREFIX = "https://wa.me/";

/**
 * Starts listening for WhatsApp clicks. Returns the teardown function.
 * Capture phase, so it still fires if something downstream stops propagation.
 */
export function trackWhatsappLeads(): () => void {
  const handleClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const anchor = target?.closest?.("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href") ?? "";
    if (!href.startsWith(WHATSAPP_PREFIX)) return;

    const customData = {
      content_name: anchor.textContent?.trim().slice(0, 60) || "WhatsApp",
      content_category: "whatsapp",
    };
    const eventId = crypto.randomUUID();
    // Never let analytics break navigation: the click must go through regardless.
    try {
      window.fbq?.("track", "Lead", customData, { eventID: eventId });
    } catch {
      /* the pixel may be blocked by an ad blocker; that is not an error for the user */
    }
    // 🚨 Outside the pixel's try, on purpose: when an ad blocker removes `fbq`, this is the only
    // copy of the conversion that reaches Meta — which is the whole reason the server copy exists.
    sendServerEvent("Lead", eventId, customData);
  };

  document.addEventListener("click", handleClick, true);
  return () => document.removeEventListener("click", handleClick, true);
}

/**
 * El envío del formulario de «Abrir cuenta».
 *
 * 🚨 EVENTO DISTINTO, y no es un detalle. `trackWhatsappLeads` dispara `Lead` en CUALQUIER ancla
 * `wa.me`, presente o futura — y la pantalla de confirmación tiene una, porque invita a escribir
 * por WhatsApp a quien no quiere esperar. Si el envío también emitiera `Lead`, la persona que
 * envía y después toca ese botón contaría DOS, y Meta optimizaría sobre un número inflado. Falla
 * mudo: la campaña simplemente aprende mal.
 *
 * `CompleteRegistration` es el evento estándar de Meta para «completó un formulario de alta», que
 * es literalmente lo que pasó.
 */
export function trackLeadFormSubmit(intent: "account" | "question", contact: ContactInput): void {
  const customData = {
    content_name: intent === "account" ? "Abrir cuenta" : "Consulta",
    content_category: "lead_form",
  };
  const eventId = crypto.randomUUID();
  try {
    window.fbq?.("track", "CompleteRegistration", customData, { eventID: eventId });
  } catch {
    /* el pixel puede estar bloqueado; no es un error para el visitante */
  }
  // Los datos de contacto viajan SOLO cifrados: ver `lib/metaMatch.ts`.
  hashContact(contact)
    .then((userData) => sendServerEvent("CompleteRegistration", eventId, customData, userData))
    .catch(() => {
      /* sin `crypto.subtle` (http, navegador viejo) se pierde solo la copia del servidor */
    });
}

/**
 * La copia del servidor de cada conversión, hacia `/api/meta-event` (Conversions API).
 *
 * 🚨 `sendBeacon`, no `fetch` a secas: el clic a WhatsApp suele sacar a la persona de la página, y
 * un `fetch` común se cancela al descargarse la página. El beacon sobrevive a la navegación. Va
 * mismo origen, así que el CSP (`connect-src 'self'`) no se toca.
 */
export function sendServerEvent(
  eventName: "Lead" | "CompleteRegistration",
  eventId: string,
  customData: Record<string, string>,
  userData?: HashedUserData,
): void {
  try {
    const body = JSON.stringify({ eventName, eventId, eventSourceUrl: window.location.href, customData, userData });
    if (navigator.sendBeacon?.("/api/meta-event", body)) return;
    void fetch("/api/meta-event", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    /* la analítica nunca rompe la página */
  }
}
