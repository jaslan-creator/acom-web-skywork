import { brands, categories } from "@/data/index";
import { FAQS, PUBLIC_ROUTES, PUBLIC_SITE, SITE_ORIGIN, type PublicRouteDocument } from "@/data/publicContent";

const organizationId = `${SITE_ORIGIN}/#organization`;
const websiteId = `${SITE_ORIGIN}/#website`;

/**
 * Identidad de la empresa, PLANA y en su propio bloque JSON-LD.
 *
 * 🚨 Por qué no vive dentro del `@graph`, que es donde estuvo hasta el 2026-08-30: un parser que
 * hace `json["@type"]` sobre el objeto raíz no encuentra NADA — el raíz de un documento con
 * `@graph` solo tiene `@context` y `@graph`. Medido: un informe externo reportó este marcado como
 * incompleto («falta url, sameAs, logo, address») teniendo los cuatro campos adentro. No faltaban
 * datos: faltaba que el primer objeto que cualquiera abriera fuera la identidad.
 *
 * 🚨 `@type` va como CADENA, jamás como arreglo. `["Organization","WholesaleStore"]` es correcto en
 * la norma y rompe a todo consumidor ingenuo que compare `@type === "Organization"`. El tipado
 * múltiple se conserva en `additionalType`, que es la escotilla que Schema.org documenta para eso.
 *
 * Se emite en TODAS las páginas a propósito: es la identidad del sitio, no del documento, y ya se
 * repetía igual dentro del `@graph`. El `@id` la funde en una sola entidad con el segundo bloque.
 */
function organizationNode() {
  return {
    "@id": organizationId,
    "@type": "Organization",
    additionalType: "https://schema.org/WholesaleStore",
    name: PUBLIC_SITE.organization.name,
    alternateName: [...PUBLIC_SITE.organization.alternateName],
    legalName: PUBLIC_SITE.organization.legalName,
    description: PUBLIC_SITE.organization.description,
    taxID: PUBLIC_SITE.organization.taxId,
    url: PUBLIC_SITE.organization.url,
    logo: `${SITE_ORIGIN}/images/logo-rojo-8.png`,
    email: PUBLIC_SITE.organization.email,
    telephone: PUBLIC_SITE.organization.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Urb. Industrial Castillito, Calle 97, Centro Comercial Valencia (CCCV II), Local 18",
      addressLocality: "Valencia",
      addressRegion: "Carabobo",
      addressCountry: "VE",
    },
    areaServed: { "@type": "Country", name: "Venezuela" },
    // Derivado de PUBLIC_SITE, nunca re-tipeado: un contacto escrito a mano acá se pudre
    // respecto del resto del sitio sin que nada falle. Va DENTRO de este nodo, no como un
    // segundo bloque JSON-LD (el gate exige exactamente uno por página).
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: PUBLIC_SITE.organization.email,
        telephone: PUBLIC_SITE.organization.telephone,
        areaServed: "VE",
        availableLanguage: ["es"],
      },
    ],
    sameAs: Object.values(PUBLIC_SITE.organization.socialMedia),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Categorías de distribución mayorista",
      itemListElement: categories.map((category) => ({
        "@type": "OfferCatalog",
        name: category.label,
        description: category.description,
      })),
    },
  };
}

function websiteNode() {
  return {
    "@id": websiteId,
    "@type": "WebSite",
    url: `${SITE_ORIGIN}/`,
    name: "ACOM Trading",
    inLanguage: "es-VE",
    publisher: { "@id": organizationId },
  };
}

function breadcrumbNode(route: PublicRouteDocument) {
  if (route.path === "/") return null;
  // A nested route (/catalogo/pelikan) goes through its parent, which is also a public route.
  const parent = PUBLIC_ROUTES.find(
    (candidate) => candidate.path !== "/" && route.path.startsWith(`${candidate.path}/`),
  );
  const trail = [
    { name: "Inicio", item: `${SITE_ORIGIN}/` },
    ...(parent ? [{ name: parent.breadcrumbName, item: `${SITE_ORIGIN}${parent.path}` }] : []),
    { name: route.breadcrumbName, item: `${SITE_ORIGIN}${route.path}` },
  ];
  return {
    "@id": `${SITE_ORIGIN}${route.path}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...crumb,
    })),
  };
}

function routeSpecificNodes(route: PublicRouteDocument): object[] {
  if (route.id === "home") {
    return [
      {
        "@type": "Service",
        name: "Importación y distribución mayorista en Venezuela",
        provider: { "@id": organizationId },
        areaServed: { "@type": "Country", name: "Venezuela" },
        audience: { "@type": "BusinessAudience", audienceType: "Comercios y compradores mayoristas" },
      },
    ];
  }

  if (route.id === "marcas") {
    return [
      {
        "@type": "ItemList",
        name: "Marcas distribuidas por ACOM Trading",
        itemListElement: brands.map((brand, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Brand",
            name: brand.name,
            description: brand.headline,
          },
        })),
      },
    ];
  }

  const catalogNode = (catalog: (typeof PUBLIC_SITE.catalogs)[number]) => ({
    "@type": "CreativeWork",
    name: catalog.name,
    url: catalog.url,
    isAccessibleForFree: true,
    inLanguage: "es-VE",
    publisher: { "@id": organizationId },
    numberOfPages: catalog.pages,
  });

  if (route.id === "catalogo") {
    return [
      {
        "@type": "ItemList",
        name: "Catálogos mayoristas de ACOM Trading",
        itemListElement: PUBLIC_SITE.catalogs.map((catalog, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: catalogNode(catalog),
        })),
      },
    ];
  }

  const catalog = PUBLIC_SITE.catalogs.find((candidate) => candidate.url === `${SITE_ORIGIN}${route.path}`);
  if (catalog) {
    return [catalogNode(catalog)];
  }

  if (route.id === "faq") {
    return [
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ];
  }

  return [];
}

export function structuredDataForRoute(route: PublicRouteDocument) {
  const pageUrl = `${SITE_ORIGIN}${route.path}`;
  const breadcrumb = breadcrumbNode(route);
  const pageNode = {
    "@type": route.schemaType,
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: route.title,
    description: route.description,
    inLanguage: "es-VE",
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
    ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
  };

  // FAQPage is already the page node's most specific type; keep its questions on that same node
  // instead of publishing two FAQPage entities for one URL.
  if (route.id === "faq") {
    Object.assign(pageNode, {
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  const extras = route.id === "faq" ? [] : routeSpecificNodes(route);
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode(), pageNode, ...(breadcrumb ? [breadcrumb] : []), ...extras],
  };
}

/**
 * Los bloques JSON-LD de una página, EN ORDEN. Uno por `<script type="application/ld+json">`.
 *
 * Son dos y no uno: el primero es la identidad plana (ver `organizationNode`) y el segundo el grafo
 * de la página, que referencia a la organización SOLO por `@id`. Cero duplicación — JSON-LD funde
 * por `@id`, así que la entidad sigue siendo una— y el primer objeto que cualquier consumidor abre
 * ya es `{"@type":"Organization", …}`.
 *
 * 🚨 La organización NO puede volver a aparecer con datos propios dentro del grafo. Si vuelve, hay
 * dos fuentes de verdad para la misma entidad y se separan sin que nada falle. Lo afirma el gate.
 */
export function structuredDataDocumentsForRoute(route: PublicRouteDocument) {
  return [
    { "@context": "https://schema.org", ...organizationNode() },
    structuredDataForRoute(route),
  ];
}
