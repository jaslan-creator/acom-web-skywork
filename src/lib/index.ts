/**
 * Acom Trading - Constants and Type Definitions
 * This file centralizes routing and core data structures used across the application.
 */

export const ROUTE_PATHS = {
  HOME: "/",
  MARCAS: "/marcas",
  CATALOGO: "/catalogo",
  COMO_TRABAJAMOS: "/como-trabajamos",
  SOBRE_ACOM: "/sobre-acom",
  CONTACTO: "/contacto",
  TERMINOS: "/terminos-y-condiciones",
  PRIVACIDAD: "/politica-de-privacidad",
} as const;

/**
 * Represents a wholesale brand distributed by Acom Trading
 */
export interface Brand {
  id: string;
  name: string;
  headline: string;
  description: string;
  cta: string;
  imageKey?: string;
  /**
   * Path to the official brand logo in /public/images/brands.
   * The logo is shown ALONGSIDE the name, never instead of it: the brand names are the
   * highest-value keywords on a SPA that has no per-route metadata. A missing file falls
   * back to the name alone (see BrandCard's onError).
   */
  logo?: string;
  /** Internal route to this brand's published catalog, when one exists. Otherwise the CTA goes to /contacto. */
  catalogUrl?: string;
}

/**
 * Represents a product category shown on the Home page
 */
export interface Category {
  id: string;
  label: string;
  /**
   * The label as it reads inside a flowing sentence ("escolares", "de oficina").
   * Required on purpose: every prose enumeration on the site is built from these, so a new
   * category cannot be added without deciding how it reads — which is how three of the four
   * existing sentences ended up silently missing "manualidades".
   */
  prose: string;
  description: string;
}

/**
 * Represents a step in the wholesale purchasing process
 */
export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

/**
 * Represents a key value proposition or benefit of working with Acom
 */
export interface Benefit {
  title: string;
  description: string;
}

/**
 * Contact information and global business rules
 */
export const BUSINESS_CONFIG = {
  MIN_ORDER_USD: 250,
  WHATSAPP_PHONE: "584244567154",
  EMAIL: "ventas@acomve.com",
  /**
   * Customer portal. INVITE-ONLY: an account is created by the customer's sales rep, it is
   * not self-service. The old b2b.acomve.com was retired on 2026-08-02 and now 307s to a
   * "this moved" page, which is why this link must never be the primary CTA.
   */
  PORTAL_URL: "https://cliente.acomve.com",
  ADDRESS: "Urb. Industrial Castillito, Calle 97, Centro Comercial Valencia (CCCV II). Local 18. Valencia. Venezuela",
  RESPONSE_TIME_EXPECTATION: "48 horas hábiles",
  COUNTRY: "Venezuela",
  SOCIAL_MEDIA: {
    FACEBOOK: "https://www.facebook.com/acom.ve",
    INSTAGRAM: "https://www.instagram.com/acom_ve",
    LINKEDIN: "https://www.linkedin.com/company/acomrading",
  },
} as const;

/**
 * Published product catalog, served as one WEBP per page from the R2 CDN.
 *
 * Produced by `zentral-erp-sync/scripts/render_catalog_pages.py` from the Canva PDF, at
 * `catalog_pages/<slug>/p-NNN.webp`. It carries NO prices — photo, features and a
 * Código / Descripción / Und. x Inner / Bulto table — which is what makes it publishable here.
 *
 * 🚨 `pages` is hardcoded because the renderer writes its `pages.json` manifest to disk only:
 * it is NOT uploaded to R2, so there is nothing to read the count from at runtime. Verified
 * 2026-08-23: p-082 -> 200, p-083 -> 404. Re-rendering the 2027 catalog with a different page
 * count will rot this number, so the viewer treats a failed page as a visible end, not as a
 * blank frame.
 *
 * 🚨 The CDN host must stay listed in `img-src` in vercel.json or the browser never even
 * issues the request — and a blocked image is silent, not an error.
 */
export const CATALOG = {
  BASE_URL: "https://catalogos.acomve.com/catalog_pages",
  SLUG: "bambary-2026",
  TITLE: "Catálogo Bambary General 2026",
  PAGES: 82,
} as const;

/** URL of a single catalog page (1-indexed), matching the renderer's `p-NNN.webp` key. */
export function catalogPageUrl(page: number): string {
  return `${CATALOG.BASE_URL}/${CATALOG.SLUG}/p-${String(page).padStart(3, "0")}.webp`;
}
