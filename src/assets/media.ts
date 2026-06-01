/**
 * Curated marketing media. Each value points to a local asset in /public/images.
 *
 * Leave a value as `null` to fall back to the on-brand gradient/text treatment.
 * Set the path (e.g. "/images/hero.webp") once the asset — AI-generated with
 * Higgsfield or a real photo — has been added to /public/images. Keeping assets
 * local preserves the strict `img-src 'self'` CSP in vercel.json.
 */
type MediaKey =
  | "hero"
  | "categoryEscolar"
  | "categoryOficina"
  | "categoryHogar"
  | "sobreAcom";

export const MEDIA: Record<MediaKey, string | null> = {
  hero: null,
  categoryEscolar: null,
  categoryOficina: null,
  categoryHogar: null,
  sobreAcom: null,
};
