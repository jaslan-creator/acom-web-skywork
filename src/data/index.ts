import { Brand, ProcessStep, Benefit } from "../lib/index.ts";

/**
 * Data for the brands distributed by Acom Trading
 * Copy exactly as provided in the project requirements.
 */
export const brands: Brand[] = [
  {
    id: "bambary",
    name: "Bambary",
    headline: "Productos escolares y de manualidades diseñados para alta rotación.",
    description: "Ideal para librerías y papelerías que buscan volumen, variedad y reposición constante.",
    cta: "Solicitar catálogo Bambary"
  },
  {
    id: "pelikan",
    name: "Pelikan",
    headline: "Marca internacional reconocida en escritura y oficina.",
    description: "Confianza, calidad y prestigio que facilitan la venta en punto comercial.",
    cta: "Solicitar catálogo Pelikan"
  },
  {
    id: "zanotti",
    name: "Zanotti",
    headline: "Productos prácticos para el uso diario.",
    description: "Excelente complemento para ampliar ticket promedio.",
    cta: "Solicitar catálogo Zanotti"
  },
  {
    id: "sanremo",
    name: "SanRemo",
    headline: "Soluciones funcionales para el hogar.",
    description: "Productos de alta utilidad y buena rotación.",
    cta: "Solicitar catálogo SanRemo"
  }
];

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
