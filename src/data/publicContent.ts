import { brands, categories, categoriesProse, coverage } from "./index.ts";
import { BUSINESS_CONFIG, CATALOG, ROUTE_PATHS } from "../lib/index.ts";

export const SITE_ORIGIN = "https://www.acomve.com";
export const CONTENT_UPDATED_AT = "2026-08-24";

export type PublicRouteId =
  | "home"
  | "marcas"
  | "catalogo"
  | "como-trabajamos"
  | "sobre-acom"
  | "abrir-cuenta"
  | "contacto"
  | "faq"
  | "terminos"
  | "privacidad";

export type PageSchemaType =
  | "WebPage"
  | "CollectionPage"
  | "AboutPage"
  | "ContactPage"
  | "FAQPage";

export interface AgentSection {
  heading: string;
  paragraphs: readonly string[];
}

export interface PublicRouteDocument {
  id: PublicRouteId;
  path: string;
  slug: string;
  breadcrumbName: string;
  title: string;
  description: string;
  image: string;
  schemaType: PageSchemaType;
  htmlMustContain: string;
  agentMustContain: string;
  agentMarkdownPath: string;
  agentSections: readonly AgentSection[];
}

export interface PublicFaq {
  question: string;
  answer: string;
}

const categoriesText = categoriesProse();
const brandsText = brands.map((brand) => brand.name).join(", ");

export const FAQS: readonly PublicFaq[] = [
  {
    question: "¿Quién puede comprar en ACOM Trading?",
    answer:
      "ACOM Trading vende exclusivamente al mayor a librerías, papelerías, distribuidores, cadenas y otros comercios establecidos en Venezuela. No realiza ventas al detal.",
  },
  {
    question: "¿Cuál es el pedido mínimo?",
    answer: `El pedido mínimo es de $${BUSINESS_CONFIG.MIN_ORDER_USD} USD por compra mayorista.`,
  },
  {
    question: "¿Qué categorías distribuye ACOM?",
    answer: `ACOM distribuye productos ${categoriesText}.`,
  },
  {
    question: "¿Qué marcas distribuye ACOM?",
    answer: `El portafolio publicado incluye ${brandsText}.`,
  },
  {
    question: "¿Dónde puedo consultar los precios mayoristas?",
    answer:
      "Los precios no se publican en la web. Un asesor asigna la lista de precios y las ofertas vigentes según el tipo de negocio y el volumen.",
  },
  {
    question: "¿Hay un catálogo público?",
    answer: `Sí. El ${CATALOG.TITLE} se puede consultar sin registro. Tiene ${CATALOG.PAGES} páginas con códigos, descripciones, presentaciones y unidades por bulto, pero no incluye precios.`,
  },
  {
    question: "¿ACOM realiza despachos nacionales?",
    answer:
      "Sí. ACOM publica despachos gratis a nivel nacional y coordina cada entrega con aliados logísticos según la ubicación y disponibilidad.",
  },
  {
    question: "¿Cómo abro una cuenta mayorista?",
    answer:
      "Completa el formulario de Abrir cuenta o escribe por WhatsApp con el nombre de tu negocio y tu ciudad. Un asesor revisará la solicitud y te indicará los siguientes pasos.",
  },
  {
    question: "¿Cuándo solicitan el RIF y el registro mercantil?",
    answer:
      "El RIF y el registro mercantil se solicitan durante el proceso de apertura de la cuenta, no en el formulario inicial de contacto.",
  },
  {
    question: "¿ACOM ofrece línea de crédito?",
    answer:
      "La línea de crédito se evalúa después de la apertura de la cuenta según el volumen, el historial y el comportamiento de pago. No está garantizada.",
  },
  {
    question: "¿Cuánto tarda ACOM en responder?",
    answer: `La expectativa publicada de respuesta es de ${BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}.`,
  },
] as const;

const commercialSummary = `Venta exclusiva al mayor, pedido mínimo de $${BUSINESS_CONFIG.MIN_ORDER_USD} USD y despacho nacional.`;

export const PUBLIC_ROUTES: readonly PublicRouteDocument[] = [
  {
    id: "home",
    path: ROUTE_PATHS.HOME,
    slug: "inicio",
    breadcrumbName: "Inicio",
    title: "ACOM Trading | Distribuidora mayorista en Venezuela",
    description: `Distribuidora mayorista en Venezuela de productos ${categoriesText}. ${brandsText}. Pedido mínimo de $${BUSINESS_CONFIG.MIN_ORDER_USD} USD.`,
    image: "/images/hero.webp",
    schemaType: "WebPage",
    htmlMustContain: "Importamos y distribuimos marcas líderes",
    agentMustContain: `Pedido mínimo: $${BUSINESS_CONFIG.MIN_ORDER_USD} USD`,
    agentMarkdownPath: "/agent/pages/inicio.md",
    agentSections: [
      { heading: "Qué hace ACOM", paragraphs: [`Importa y distribuye productos ${categoriesText} para comercios y mayoristas en Venezuela.`] },
      { heading: "Condiciones esenciales", paragraphs: [`Pedido mínimo: $${BUSINESS_CONFIG.MIN_ORDER_USD} USD. ${commercialSummary}`] },
      { heading: "Marcas", paragraphs: [brandsText] },
    ],
  },
  {
    id: "marcas",
    path: ROUTE_PATHS.MARCAS,
    slug: "marcas",
    breadcrumbName: "Marcas",
    title: "Marcas mayoristas que distribuimos | ACOM Trading",
    description: `Portafolio mayorista de ${brandsText} para comercios en Venezuela. Consulta categorías, catálogos y acceso a precios.`,
    image: "/images/hero.webp",
    schemaType: "CollectionPage",
    htmlMustContain: "Marcas mayoristas",
    agentMustContain: brands[0].name,
    agentMarkdownPath: "/agent/pages/marcas.md",
    agentSections: [
      { heading: "Portafolio publicado", paragraphs: brands.map((brand) => `${brand.name}: ${brand.headline}`) },
      { heading: "Precios", paragraphs: ["Los precios mayoristas los proporciona un asesor según el negocio y el volumen."] },
    ],
  },
  {
    id: "catalogo",
    path: ROUTE_PATHS.CATALOGO,
    slug: "catalogo",
    breadcrumbName: "Catálogo",
    title: `${CATALOG.TITLE} | ACOM Trading`,
    description: `Consulta gratis el ${CATALOG.TITLE}: ${CATALOG.PAGES} páginas con códigos, presentaciones y unidades por bulto. Precios por asesor.`,
    image: "/images/category-escolar.webp",
    schemaType: "CollectionPage",
    htmlMustContain: CATALOG.TITLE,
    agentMustContain: `${CATALOG.PAGES} páginas`,
    agentMarkdownPath: "/agent/pages/catalogo.md",
    agentSections: [
      { heading: "Catálogo disponible", paragraphs: [`${CATALOG.TITLE}, ${CATALOG.PAGES} páginas, acceso público y sin registro.`] },
      { heading: "Contenido", paragraphs: ["Incluye códigos, descripciones, presentaciones y unidades por bulto. No incluye precios."] },
    ],
  },
  {
    id: "como-trabajamos",
    path: ROUTE_PATHS.COMO_TRABAJAMOS,
    slug: "como-trabajamos",
    breadcrumbName: "Cómo trabajamos",
    title: "Cómo comprar al mayor con ACOM Trading",
    description: `Conoce el proceso mayorista de ACOM: contacto, evaluación del negocio, catálogo y precios, pedido y despacho nacional desde $${BUSINESS_CONFIG.MIN_ORDER_USD}.`,
    image: "/images/como-trabajamos.webp",
    schemaType: "WebPage",
    htmlMustContain: "Un proceso mayorista claro y eficiente",
    agentMustContain: "evaluación del negocio",
    agentMarkdownPath: "/agent/pages/como-trabajamos.md",
    agentSections: [
      { heading: "Proceso", paragraphs: ["Contacto inicial, evaluación del negocio, envío de catálogos y precios, pedido y despacho."] },
      { heading: "Crédito", paragraphs: ["La línea de crédito se evalúa; no está garantizada y depende del historial comercial."] },
    ],
  },
  {
    id: "sobre-acom",
    path: ROUTE_PATHS.SOBRE_ACOM,
    slug: "sobre-acom",
    breadcrumbName: "Sobre ACOM",
    title: "Sobre ACOM Trading | Distribución mayorista",
    description: `ACOM Trading importa y distribuye productos ${categoriesText} para el canal comercial venezolano.`,
    image: "/images/sobre-acom.webp",
    schemaType: "AboutPage",
    htmlMustContain: "Más que un proveedor",
    agentMustContain: "importación y distribución mayorista",
    agentMarkdownPath: "/agent/pages/sobre-acom.md",
    agentSections: [
      { heading: "Empresa", paragraphs: [`ACOM Trading C.A. se dedica a la importación y distribución mayorista de productos ${categoriesText} en Venezuela.`] },
      { heading: "Cobertura", paragraphs: ["Atiende nueve regiones comerciales con despacho nacional."] },
    ],
  },
  {
    id: "abrir-cuenta",
    path: ROUTE_PATHS.ABRIR_CUENTA,
    slug: "abrir-cuenta",
    breadcrumbName: "Abrir cuenta",
    title: "Abrir cuenta mayorista | ACOM Trading",
    description: `Solicita una cuenta mayorista de ACOM para tu comercio. Pedido mínimo de $${BUSINESS_CONFIG.MIN_ORDER_USD} USD y respuesta estimada en ${BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}.`,
    image: "/images/hero.webp",
    schemaType: "WebPage",
    htmlMustContain: "Abre tu cuenta con Acom",
    agentMustContain: "RIF y registro mercantil",
    agentMarkdownPath: "/agent/pages/abrir-cuenta.md",
    agentSections: [
      { heading: "Requisitos", paragraphs: [`Negocio establecido, compra mínima de $${BUSINESS_CONFIG.MIN_ORDER_USD} USD y documentación comercial vigente. El RIF y registro mercantil se solicitan durante la apertura, no en el formulario inicial.`] },
      { heading: "Acción humana", paragraphs: [`Formulario: ${SITE_ORIGIN}${ROUTE_PATHS.ABRIR_CUENTA}. WhatsApp: https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}.`] },
    ],
  },
  {
    id: "contacto",
    path: ROUTE_PATHS.CONTACTO,
    slug: "contacto",
    breadcrumbName: "Contacto",
    title: "Contacto comercial | ACOM Trading",
    description: `Contacta al equipo comercial de ACOM para solicitar catálogos, precios y condiciones mayoristas en Venezuela. Respuesta en ${BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}.`,
    image: "/images/hero.webp",
    schemaType: "ContactPage",
    htmlMustContain: "Conecta con nuestro equipo comercial",
    agentMustContain: BUSINESS_CONFIG.EMAIL,
    agentMarkdownPath: "/agent/pages/contacto.md",
    agentSections: [
      { heading: "Contacto", paragraphs: [`Correo: ${BUSINESS_CONFIG.EMAIL}. WhatsApp: +${BUSINESS_CONFIG.WHATSAPP_PHONE}.`] },
      { heading: "Dirección", paragraphs: [BUSINESS_CONFIG.ADDRESS] },
      { heading: "Tiempo de respuesta", paragraphs: [BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION] },
    ],
  },
  {
    id: "faq",
    path: ROUTE_PATHS.FAQ,
    slug: "preguntas-frecuentes",
    breadcrumbName: "Preguntas frecuentes",
    title: "Preguntas frecuentes mayoristas | ACOM Trading",
    description: "Respuestas sobre pedido mínimo, marcas, catálogos, precios, cobertura, apertura de cuenta y crédito mayorista con ACOM Trading.",
    image: "/images/hero.webp",
    schemaType: "FAQPage",
    htmlMustContain: "Preguntas frecuentes sobre comprar al mayor",
    agentMustContain: FAQS[0].question,
    agentMarkdownPath: "/agent/pages/preguntas-frecuentes.md",
    agentSections: FAQS.map((faq) => ({ heading: faq.question, paragraphs: [faq.answer] })),
  },
  {
    id: "terminos",
    path: ROUTE_PATHS.TERMINOS,
    slug: "terminos-y-condiciones",
    breadcrumbName: "Términos y condiciones",
    title: "Términos y condiciones | ACOM Trading",
    description: "Condiciones de uso, compra mayorista, pagos, facturación, envíos, garantías y propiedad intelectual de ACOM Trading C.A.",
    image: "/images/hero.webp",
    schemaType: "WebPage",
    htmlMustContain: "Términos y Condiciones",
    agentMustContain: "venta es exclusivamente mayorista",
    agentMarkdownPath: "/agent/pages/terminos-y-condiciones.md",
    agentSections: [
      { heading: "Alcance", paragraphs: ["El servicio se dirige a comercios y empresas que cumplan los requisitos de ACOM."] },
      { heading: "Compra", paragraphs: [`La venta es exclusivamente mayorista y el pedido mínimo es de $${BUSINESS_CONFIG.MIN_ORDER_USD} USD.`] },
    ],
  },
  {
    id: "privacidad",
    path: ROUTE_PATHS.PRIVACIDAD,
    slug: "politica-de-privacidad",
    breadcrumbName: "Política de privacidad",
    title: "Política de privacidad | ACOM Trading",
    description: "Cómo ACOM Trading C.A. recopila, utiliza, protege y conserva los datos enviados mediante sus canales comerciales.",
    image: "/images/hero.webp",
    schemaType: "WebPage",
    htmlMustContain: "Política de Privacidad",
    agentMustContain: "datos personales",
    agentMarkdownPath: "/agent/pages/politica-de-privacidad.md",
    agentSections: [
      { heading: "Datos", paragraphs: ["ACOM recopila la información necesaria para atender solicitudes y prestar sus servicios de distribución mayorista."] },
      { heading: "Derechos", paragraphs: [`Las consultas sobre datos personales se atienden en ${BUSINESS_CONFIG.EMAIL}.`] },
    ],
  },
] as const;

export const PUBLIC_SITE = {
  schemaVersion: "1.0",
  contentUpdatedAt: CONTENT_UPDATED_AT,
  organization: {
    name: "ACOM Trading",
    legalName: "ACOM Trading C.A.",
    url: `${SITE_ORIGIN}/`,
    email: BUSINESS_CONFIG.EMAIL,
    telephone: `+${BUSINESS_CONFIG.WHATSAPP_PHONE}`,
    address: BUSINESS_CONFIG.ADDRESS,
    country: BUSINESS_CONFIG.COUNTRY,
    socialMedia: BUSINESS_CONFIG.SOCIAL_MEDIA,
  },
  commercialTerms: {
    audience: "Comercios y compradores mayoristas",
    minimumOrder: { amount: BUSINESS_CONFIG.MIN_ORDER_USD, currency: "USD" },
    pricing: "Los precios se asignan por asesor según el negocio y el volumen.",
    shipping: "Despachos gratis a nivel nacional, sujetos a coordinación y disponibilidad.",
    responseTime: BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION,
  },
  brands,
  categories,
  coverage,
  catalogs: [
    {
      name: CATALOG.TITLE,
      url: `${SITE_ORIGIN}${ROUTE_PATHS.CATALOGO}`,
      pages: CATALOG.PAGES,
      public: true,
      includesPrices: false,
    },
  ],
  contact: {
    page: `${SITE_ORIGIN}${ROUTE_PATHS.CONTACTO}`,
    openAccountPage: `${SITE_ORIGIN}${ROUTE_PATHS.ABRIR_CUENTA}`,
    email: BUSINESS_CONFIG.EMAIL,
    whatsapp: `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`,
  },
  capabilities: {
    contentRetrieval: true,
    leadSubmission: false,
    checkout: false,
    humanHandoffRequired: true,
  },
} as const;

export function publicRouteByPath(pathname: string): PublicRouteDocument | undefined {
  return PUBLIC_ROUTES.find((route) => route.path === pathname);
}
