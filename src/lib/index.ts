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
  ABRIR_CUENTA: "/abrir-cuenta",
  CONTACTO: "/contacto",
  FAQ: "/preguntas-frecuentes",
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
  /**
   * Wide product banner for the rotating carousel on /marcas, in /public/images/banners.
   * A `-mobile` variant with the same name must sit next to it. Generated with Higgsfield from
   * the brand's real product photos; the left side is left empty on purpose for the overlay text.
   */
  banner?: string;
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
 * Published product catalogs, each served as one WEBP per page from the R2 CDN.
 *
 * Produced by `zentral-erp-sync/scripts/render_catalog_pages.py --doc <slug>` from the sales
 * PDF, at `catalog_pages/<slug>/p-NNN.webp`. None of them carries prices — photo, features and
 * codes / units per pack — which is what makes them publishable here. Checked page by page
 * before upload (2026-11-01); a catalog WITH prices must never be added to this list.
 *
 * `id` is the public URL (`/catalogo/<id>`) and is stable; `slug` is the R2 key and changes
 * with every re-render (`bambary-2027`). Keeping them apart means a new edition is a one-line
 * change here, not a broken link everywhere the old URL was shared.
 *
 * 🚨 `pages` is hardcoded because the renderer writes its `pages.json` manifest to disk only:
 * it is NOT uploaded to R2, so there is nothing to read the count from at runtime. Verified
 * 2026-11-01 with `npm run verify:catalogo` (last page 200, next one 404, for all five).
 * A re-render with a different page count rots the number, so the viewer treats a failed page
 * as a visible end, not as a blank frame.
 *
 * `ratio` is per catalog because they are not all portrait: Momentop is a landscape deck.
 *
 * 🚨 The CDN host must stay listed in `img-src` in vercel.json or the browser never even
 * issues the request — and a blocked image is silent, not an error.
 */
export const CATALOG_BASE_URL = "https://catalogos.acomve.com/catalog_pages";

export const CATALOGS = [
  {
    id: "bambary",
    brandId: "bambary",
    slug: "bambary-2026",
    title: "Catálogo Bambary General 2026",
    pages: 82,
    ratio: "aspect-[1080/1399]",
  },
  {
    id: "pelikan",
    brandId: "pelikan",
    slug: "pelikan-2022",
    title: "Catálogo Pelikan",
    pages: 24,
    ratio: "aspect-[1080/1398]",
  },
  {
    id: "sanremo",
    brandId: "sanremo",
    slug: "sanremo-2022",
    title: "Catálogo Sanremo",
    pages: 19,
    ratio: "aspect-[1080/1398]",
  },
  {
    id: "momentop",
    brandId: "momentop",
    slug: "momentop-2026",
    title: "Catálogo Momentop",
    pages: 20,
    ratio: "aspect-[1080/603]",
  },
  {
    id: "beifa",
    brandId: "beifa",
    slug: "beifa-2026",
    title: "Catálogo Beifa 2026",
    pages: 9,
    ratio: "aspect-[1080/1398]",
  },
] as const;

export type Catalog = (typeof CATALOGS)[number];
export type CatalogId = Catalog["id"];

/** Public route of a catalog's viewer. */
export function catalogPath(catalog: Catalog): string {
  return `${ROUTE_PATHS.CATALOGO}/${catalog.id}`;
}

/** URL of a single catalog page (1-indexed), matching the renderer's `p-NNN.webp` key. */
export function catalogPageUrl(catalog: Catalog, page: number): string {
  return `${CATALOG_BASE_URL}/${catalog.slug}/p-${String(page).padStart(3, "0")}.webp`;
}

/** Total pages across every published catalog. */
export const CATALOG_TOTAL_PAGES = CATALOGS.reduce((sum, catalog) => sum + catalog.pages, 0);
