import { Brand, ProcessStep, Benefit, Category, ROUTE_PATHS } from "../lib/index.ts";

/**
 * Data for the brands distributed by Acom Trading.
 *
 * 🚨 This array is the single source for the brand list. The footer in Layout.tsx used to
 * hard-code its own copy and drifted: it still advertised Zanotti on all 7 pages after the
 * brand was archived. Anything that lists brands reads from here.
 *
 * Zanotti was archived in Odoo on 2026-08-22 (120 templates) and discontinued commercially
 * back in nov-2024; Momentop took its slot (84 live SKUs, prefix MT-, since 2026-08-22).
 * Newell/Sanford is NOT commercialised and does not belong here.
 */
export const brands: Brand[] = [
  {
    id: "bambary",
    name: "Bambary",
    headline: "Productos escolares y de manualidades diseñados para alta rotación.",
    description: "Ideal para librerías y papelerías que buscan volumen, variedad y reposición constante.",
    cta: "Ver el catálogo Bambary",
    catalogUrl: ROUTE_PATHS.CATALOGO
  },
  {
    id: "pelikan",
    name: "Pelikan",
    headline: "Marca internacional reconocida en escritura y oficina.",
    description: "Confianza, calidad y prestigio que facilitan la venta en punto comercial.",
    cta: "Solicitar catálogo Pelikan"
  },
  {
    id: "sanremo",
    name: "Sanremo",
    headline: "Soluciones funcionales para el hogar.",
    description: "Productos de alta utilidad y buena rotación.",
    cta: "Solicitar catálogo Sanremo"
  },
  {
    id: "momentop",
    name: "Momentop",
    headline: "Termos, vasos térmicos, cavas y neveras portátiles.",
    description: "Una categoría de ticket alto y venta durante todo el año, para ampliar tu portafolio.",
    cta: "Solicitar catálogo Momentop"
  }
];

/**
 * Product categories distributed by Acom Trading.
 *
 * `as const satisfies` closes the union: `CategoryId` below is derived from these ids, and the
 * icon/image maps in Home.tsx are keyed by it. Adding a category without its icon stops
 * compiling instead of rendering an empty white badge at runtime.
 *
 * 🚫 "Confección y Mercería" is deliberately absent (founder, 2026-08-23): 121 real SKUs that
 * speak to a different buyer. Recorded so nobody re-discovers it as a bug.
 */
export const categories = [
  {
    id: "escolar",
    label: "Escolar",
    prose: "escolares",
    description: "Cuadernos, lápices y útiles de alta rotación para la temporada escolar."
  },
  {
    id: "oficina",
    label: "Oficina",
    prose: "de oficina",
    description: "Escritura, organización y suministros para abastecer al canal corporativo."
  },
  {
    id: "manualidades",
    label: "Manualidades",
    prose: "manualidades",
    description: "Pinturas, marcadores y materiales creativos con gran salida en aula y hogar."
  },
  {
    id: "hogar",
    label: "Hogar",
    prose: "hogar",
    description: "Productos funcionales de uso diario que amplían tu ticket promedio."
  },
  {
    id: "termos-cavas",
    label: "Termos y Cavas",
    prose: "termos y cavas",
    description: "Botellas y vasos térmicos, cavas y neveras portátiles que se venden todo el año."
  }
] as const satisfies readonly Category[];

/** Closed union of category ids, derived from the array above. */
export type CategoryId = (typeof categories)[number]["id"];

/**
 * The category list as it reads inside a sentence, with a Spanish list join.
 * Every prose enumeration on the site uses this, so it cannot fall out of sync with the grid.
 */
export function categoriesProse(): string {
  const parts = categories.map((c) => c.prose);
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}

/**
 * Where ACOM ships, grouped by the 9 real sales regions.
 *
 * Mirrored from the territory map that the ERP actually uses
 * (`zentral-erp-sync/core/zone_map.py`: 9 regions, 38 zones) so the site never names a plaza
 * that is not served. Cities — not regions — because "distribuidora mayorista Maracaibo" is
 * what people search; "Región Insular" is not.
 *
 * This adds no promise: the top banner already commits to free nationwide shipping on every
 * page, and that stands (founder, 2026-08-23).
 */
export const coverage = [
  { region: "Capital", cities: ["Caracas", "Los Teques", "La Guaira"] },
  { region: "Central", cities: ["Valencia", "Maracay", "Puerto Cabello"] },
  { region: "Centro Occidente", cities: ["Barquisimeto", "San Felipe", "Punto Fijo", "Acarigua"] },
  { region: "Zuliana", cities: ["Maracaibo", "Cabimas", "Ciudad Ojeda"] },
  { region: "Andina", cities: ["Mérida", "Valera", "San Cristóbal", "El Vigía"] },
  { region: "Oriental", cities: ["Barcelona", "Puerto La Cruz", "Maturín", "Cumaná", "El Tigre"] },
  { region: "Los Llanos", cities: ["Barinas", "Valle de la Pascua", "San Fernando de Apure"] },
  { region: "Guayana", cities: ["Puerto Ordaz", "Ciudad Bolívar"] },
  { region: "Insular", cities: ["Porlamar"] }
] as const;

/**
 * Steps explaining the wholesale purchasing process
 */
export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Contacto Inicial",
    description: "Contáctanos por WhatsApp o formulario para iniciar la gestión."
  },
  {
    number: 2,
    title: "Evaluación de Negocio",
    description: "Un asesor evalúa tu tipo de negocio para ofrecerte la mejor solución."
  },
  {
    number: 3,
    title: "Catálogos y Precios",
    description: "Recibes catálogos actualizados y precios competitivos para mayoristas."
  },
  {
    number: 4,
    title: "Pedido y Despacho",
    description: "Realizas tu pedido y coordinamos el despacho confiable a nivel nacional."
  }
];

/**
 * Key value propositions for Acom Trading
 */
export const benefits: Benefit[] = [
  {
    title: "Pedido mínimo accesible",
    description: "Abastece tu negocio desde tan solo $250 por pedido."
  },
  {
    title: "Venta exclusiva al mayor",
    description: "Enfoque total en el canal B2B: librerías, papelerías y cadenas."
  },
  {
    title: "Portafolio probado",
    description: "Marcas con demanda comprobada y alta rotación en el mercado venezolano."
  },
  {
    title: "Atención comercial directa",
    description: "Asesoría personalizada sin intermediarios ni complicaciones."
  },
  {
    title: "Distribución nacional",
    description: "Logística eficiente y despacho garantizado a toda Venezuela."
  }
];
