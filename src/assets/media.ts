/**
 * Curated marketing media. Each value points to a local asset in /public/images.
 *
 * Leave a value as `null` to fall back to the on-brand gradient/text treatment.
 * Set the path (e.g. "/images/hero.webp") once the asset — AI-generated with
 * Higgsfield or a real photo — has been added to /public/images. Keeping assets
 * local preserves the strict `img-src 'self'` CSP in vercel.json.
 *
 * 🚨 The extension is part of the path. Converting a file without updating the value here
 * yields a 404, and a 404 is INVISIBLE: <Image> starts at opacity-0 and only fades in on
 * load, so a missing image reads exactly like one that is still loading. That is why
 * <Image> now has an onError — but the path still has to be right.
 *
 * 🚨 `MediaKey` is a closed union on purpose: `MEDIA` is a Record over it, so adding an entry
 * without declaring the key (or vice versa) fails the typecheck instead of returning
 * undefined at runtime.
 */
type MediaKey =
  | "hero"
  | "categoryEscolar"
  | "categoryOficina"
  | "categoryManualidades"
  | "categoryHogar"
  | "categoryTermosCavas"
  | "comoTrabajamos"
  | "sobreAcom";

export const MEDIA: Record<MediaKey, string | null> = {
  hero: "/images/hero.webp",
  categoryEscolar: "/images/category-escolar.webp",
  categoryOficina: "/images/category-oficina.webp",
  categoryManualidades: "/images/category-manualidades.webp",
  categoryHogar: "/images/category-hogar.webp",
  // Deliberately null: no real Momentop product photo yet, and an AI-generated stand-in would
  // be a picture of nothing we sell. CategoryCard falls back to the on-brand gradient, which
  // is a designed state, not a failure. Swap in the photo when it exists.
  categoryTermosCavas: null,
  comoTrabajamos: "/images/como-trabajamos.webp",
  sobreAcom: "/images/sobre-acom.webp",
};
