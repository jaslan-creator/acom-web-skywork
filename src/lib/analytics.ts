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

    // Never let analytics break navigation: the click must go through regardless.
    try {
      window.fbq?.("track", "Lead", {
        content_name: anchor.textContent?.trim().slice(0, 60) || "WhatsApp",
        content_category: "whatsapp",
      });
    } catch {
      /* the pixel may be blocked by an ad blocker; that is not an error for the user */
    }
  };

  document.addEventListener("click", handleClick, true);
  return () => document.removeEventListener("click", handleClick, true);
}
