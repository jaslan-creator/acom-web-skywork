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
  | "heroMobile"
  | "categoryEscolar"
  | "categoryOficina"
  | "categoryManualidades"
  | "categoryHogar"
  | "categoryTermosCavas"
  | "comoTrabajamos"
  | "sobreAcom";

export const MEDIA: Record<MediaKey, string | null> = {
  hero: "/images/hero.webp",
  // 🚨 La misma foto a 1280 px (58 KB contra 129 KB): es la imagen más grande de la primera
  // pantalla en celular, y medida con red de celular su descarga eran 3,7 s de los 4,4 s del LCP.
  // Si se cambia `hero`, regenerar esta también o el celular sigue viendo la foto vieja.
  heroMobile: "/images/hero-mobile.webp",
  categoryEscolar: "/images/category-escolar.webp",
  categoryOficina: "/images/category-oficina.webp",
  categoryManualidades: "/images/category-manualidades.webp",
  categoryHogar: "/images/category-hogar.webp",
  // Generada con las fotos reales de producto de Momentop (Drive) como referencia, así que
  // muestra solo SKUs que vendemos: botellas 32/40 oz y tumblers 12/20/40 oz.
  categoryTermosCavas: "/images/category-termos-cavas.webp",
  comoTrabajamos: "/images/como-trabajamos.webp",
  sobreAcom: "/images/sobre-acom.webp",
};
