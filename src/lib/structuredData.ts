import { brands, categories } from "@/data/index";
import { FAQS, PUBLIC_SITE, SITE_ORIGIN, type PublicRouteDocument } from "@/data/publicContent";

const organizationId = `${SITE_ORIGIN}/#organization`;
const websiteId = `${SITE_ORIGIN}/#website`;

function organizationNode() {
  return {
    "@id": organizationId,
    "@type": ["Organization", "WholesaleStore"],
    name: PUBLIC_SITE.organization.name,
    legalName: PUBLIC_SITE.organization.legalName,
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
  return {
    "@id": `${SITE_ORIGIN}${route.path}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: route.breadcrumbName,
        item: `${SITE_ORIGIN}${route.path}`,
      },
    ],
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

  if (route.id === "catalogo") {
    return [
      {
        "@type": "CreativeWork",
        name: PUBLIC_SITE.catalogs[0].name,
        url: PUBLIC_SITE.catalogs[0].url,
        isAccessibleForFree: true,
        inLanguage: "es-VE",
        publisher: { "@id": organizationId },
        numberOfPages: PUBLIC_SITE.catalogs[0].pages,
      },
    ];
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
    "@graph": [organizationNode(), websiteNode(), pageNode, ...(breadcrumb ? [breadcrumb] : []), ...extras],
  };
}
