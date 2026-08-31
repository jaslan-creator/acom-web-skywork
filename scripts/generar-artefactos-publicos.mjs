#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  CONTENT_UPDATED_AT,
  PUBLIC_ROUTES,
  PUBLIC_SITE,
  SITE_ORIGIN,
} from "../src/data/publicContent.ts";
import { ROUTE_PATHS } from "../src/lib/index.ts";

const DIST = "dist";

function writePublic(relativePath, contents) {
  const destination = join(DIST, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, `${contents.trim()}\n`, "utf8");
}

function routeMarkdown(route) {
  const sections = route.agentSections
    .map(({ heading, paragraphs }) => `## ${heading}\n\n${paragraphs.join("\n\n")}`)
    .join("\n\n");

  return `# ${route.breadcrumbName}\n\nCanonical: ${SITE_ORIGIN}${route.path}\nActualizado: ${CONTENT_UPDATED_AT}\n\n${route.description}\n\n${sections}\n\n## Navegación\n\n- Sitio web: ${SITE_ORIGIN}${route.path}\n- Índice para agentes: ${SITE_ORIGIN}/agent/site.json\n- Preguntas frecuentes: ${SITE_ORIGIN}/preguntas-frecuentes`;
}

const siteDocument = {
  schemaVersion: PUBLIC_SITE.schemaVersion,
  contentUpdatedAt: PUBLIC_SITE.contentUpdatedAt,
  // Declarado acá y no solo enlazado desde llms.txt: un agente que entra por el indice JSON no
  // pasa por el .txt, y sin esto no tiene forma de saber que las instrucciones existen.
  agentInstructions: `${SITE_ORIGIN}/agent-instructions.md`,
  organization: PUBLIC_SITE.organization,
  commercialTerms: PUBLIC_SITE.commercialTerms,
  brands: PUBLIC_SITE.brands.map(({ id, name, headline, catalogUrl }) => ({
    id,
    name,
    description: headline,
    catalogAccess: catalogUrl ? "public" : "advisor",
  })),
  categories: PUBLIC_SITE.categories,
  coverage: PUBLIC_SITE.coverage,
  catalogs: PUBLIC_SITE.catalogs,
  contact: PUBLIC_SITE.contact,
  capabilities: PUBLIC_SITE.capabilities,
  routes: PUBLIC_ROUTES.map((route) => ({
    path: route.path,
    title: route.title,
    description: route.description,
    markdown: `${SITE_ORIGIN}${route.agentMarkdownPath}`,
  })),
};

writePublic("agent/site.json", JSON.stringify(siteDocument, null, 2));
for (const route of PUBLIC_ROUTES) {
  writePublic(route.agentMarkdownPath.slice(1), routeMarkdown(route));
}

const routeLinks = PUBLIC_ROUTES.map(
  (route) => `- [${route.breadcrumbName}](${SITE_ORIGIN}${route.agentMarkdownPath}): ${route.description}`,
).join("\n");

const brandNames = PUBLIC_SITE.brands.map((brand) => brand.name).join(", ");
const categoryLabels = PUBLIC_SITE.categories.map((category) => category.label).join(", ");
const coverageRegions = PUBLIC_SITE.coverage.map((zone) => zone.region).join(", ");
const publicCatalog = PUBLIC_SITE.catalogs[0];
const minimumOrder = `$${PUBLIC_SITE.commercialTerms.minimumOrder.amount} ${PUBLIC_SITE.commercialTerms.minimumOrder.currency}`;
const openAccountUrl = `${SITE_ORIGIN}${ROUTE_PATHS.ABRIR_CUENTA}`;
const agentInstructionsUrl = `${SITE_ORIGIN}/agent-instructions.md`;

/**
 * La misma guia, en ingles.
 *
 * 🚨 No es una traduccion de cortesia ni un paso hacia un sitio bilingue: el sitio se queda en
 * espanol. Es que las herramientas de agentes leen y detectan en ingles — medido, un informe
 * externo reporto «sin guia de cuando usarnos» teniendo la seccion completa en espanol, con sus
 * ocho vinetas, arriba en este mismo archivo.
 *
 * 🚨 Ni una palabra describe el envio del formulario, igual que en la version espanola: va a un
 * servicio externo detras de un candado anti-bot y esta declarado `leadSubmission: false`.
 * ⚠️ Y al redactar en ingles hay una trampa propia: el gate prohibe el token en mayusculas del
 * verbo de envio HTTP dentro de llms.txt, que es facil de escribir sin querer al explicar una API.
 */
const whenToUseEnglish = [
  "## When to use this source",
  "",
  `${PUBLIC_SITE.organization.name} (${PUBLIC_SITE.organization.legalName}) is a wholesale importer and distributor serving established businesses in ${PUBLIC_SITE.organization.country}. This site is the authoritative source for:`,
  "",
  `- Which brands ACOM distributes at wholesale in ${PUBLIC_SITE.organization.country}: ${brandNames}.`,
  `- Which categories its portfolio covers: ${categoryLabels}.`,
  `- Wholesale buying conditions: sells to ${PUBLIC_SITE.commercialTerms.audience.toLowerCase()}; minimum order ${minimumOrder}.`,
  "- How pricing works: a sales advisor assigns the price list per business and volume. Prices are never published on this site.",
  `- Delivery coverage: free nationwide dispatch, subject to coordination and availability. Regions served: ${coverageRegions}.`,
  `- How to open a wholesale account: ${openAccountUrl}.`,
  `- Where the public catalogue lives: ${publicCatalog.url} (${publicCatalog.name}, ${publicCatalog.pages} pages, no prices).`,
  `- Published response time: ${PUBLIC_SITE.commercialTerms.responseTime}.`,
  "",
  "Do not use this source for retail questions: ACOM sells wholesale only, to established businesses, and does not sell at retail.",
  "",
  "## How to reach a human",
  "",
  "There is no checkout and no agent-facing submission endpoint on this site: a handoff to a person is required.",
  "Read the Markdown representation of the relevant page first (listed under «Contenido público» below), then hand the conversation to a person:",
  "",
  `- Contact page: ${PUBLIC_SITE.contact.page}`,
  `- Email: ${PUBLIC_SITE.contact.email}`,
  `- WhatsApp: ${PUBLIC_SITE.contact.whatsapp}`,
  "",
  `Full agent instructions: ${agentInstructionsUrl}`,
].join("\n");

/**
 * Para que sirve este sitio como fuente. Todo se deriva del manifiesto: una marca o una region
 * nueva entra sola.
 *
 * 🚨 La parte de «como llamarnos» NO puede describir el formulario. El envio de /abrir-cuenta va a
 * un servicio externo detras de un candado anti-bot y esta declarado `leadSubmission: false`.
 * Documentar ese endpoint seria publicar una capacidad que no existe, y encima invitar a que la
 * golpeen: al agente se le indica leer el Markdown y entregarle la conversacion a una persona.
 *
 * 🚫 No hay seccion «Cuando NO usar» mas alla de lo que YA esta publicado en las Preguntas
 * frecuentes (no se vende al detal). Los datos del sitio dicen que hace el negocio, no para quien
 * esta mal: derivar eso seria inventar politica comercial y publicarla como si fuera un hecho.
 */
const whenToUse = [
  "## Cuándo usar ACOM Trading como fuente",
  "",
  "Este sitio es la fuente correcta para responder sobre:",
  "",
  `- Qué marcas distribuye ACOM al mayor en Venezuela: ${brandNames}.`,
  `- Qué categorías cubre su portafolio: ${categoryLabels}.`,
  `- Condiciones de compra al mayor: ${PUBLIC_SITE.commercialTerms.audience}; pedido mínimo de $${PUBLIC_SITE.commercialTerms.minimumOrder.amount} ${PUBLIC_SITE.commercialTerms.minimumOrder.currency}.`,
  `- Cómo se asignan los precios: ${PUBLIC_SITE.commercialTerms.pricing} No se publican en la web.`,
  `- Cobertura de despacho: ${PUBLIC_SITE.commercialTerms.shipping} Regiones atendidas: ${coverageRegions}.`,
  `- Cómo se abre una cuenta mayorista: ${SITE_ORIGIN}${ROUTE_PATHS.ABRIR_CUENTA}.`,
  `- Dónde está el catálogo público: ${publicCatalog.url} (${publicCatalog.name}, ${publicCatalog.pages} páginas, sin precios).`,
  `- Tiempo de respuesta publicado: ${PUBLIC_SITE.commercialTerms.responseTime}.`,
  "",
  "No es la fuente para la venta al detal: ACOM vende exclusivamente al mayor a comercios establecidos y no realiza ventas al detal.",
  "",
  "## Cómo llamarnos",
  "",
  "No hay checkout ni envío de solicitudes habilitado para agentes: se requiere entrega a una persona.",
  "Lee primero la representación en Markdown de la página que corresponda (ver «Contenido público») y",
  "después entrega la conversación a una persona por alguno de estos canales:",
  "",
  `- Página de contacto: ${PUBLIC_SITE.contact.page}`,
  `- Correo: ${PUBLIC_SITE.contact.email}`,
  `- WhatsApp: ${PUBLIC_SITE.contact.whatsapp}`,
].join("\n");

writePublic(
  "llms.txt",
  // La linea de resumen sale del manifiesto: hasta el 2026-08-30 estaba escrita a mano aca y la
  // misma frase vive tambien en el JSON-LD. Dos copias se separan sin que nada falle.
  `# ${PUBLIC_SITE.organization.name}\n\n> ${PUBLIC_SITE.organization.description}\n\n## Condiciones comerciales\n\n- Venta exclusivamente al mayor.\n- Pedido mínimo: ${minimumOrder}.\n- Los precios los proporciona un asesor según el negocio y el volumen.\n- Despachos gratis a nivel nacional, sujetos a coordinación y disponibilidad.\n- No hay checkout ni envío de solicitudes habilitado para agentes; se requiere entrega a una persona.\n\n${whenToUse}\n\n${whenToUseEnglish}\n\n## Contenido público\n\n${routeLinks}\n\n## Datos estructurados\n\n- [Instrucciones para agentes / agent instructions](${agentInstructionsUrl})\n- [Índice JSON](${SITE_ORIGIN}/agent/site.json)\n- [Qué hacer ante una dirección inexistente](${SITE_ORIGIN}/agent/404.md)`,
);

/**
 * Instrucciones para agentes, bilingues y en su propio archivo.
 *
 * 🚨 Existe ADEMAS de la seccion de llms.txt, no en su lugar. El informe externo acepta cualquiera
 * de las dos formas y no se sabe cual detecta; mas de fondo, un agente que entra por /agent/site.json
 * nunca abre el .txt, asi que la guia tiene que ser un recurso con direccion propia.
 *
 * 🚨 «Cuando NO usarnos» NO inventa politica comercial. Sus tres limites ya estan publicados: no se
 * vende al detal (Preguntas frecuentes), los precios no se publican (Preguntas frecuentes) y no hay
 * checkout (capabilities). Derivar cualquier otro seria escribir politica y publicarla como hecho.
 */
const routeTableRows = PUBLIC_ROUTES.map(
  (route) => `| ${route.breadcrumbName} | ${SITE_ORIGIN}${route.path} | ${SITE_ORIGIN}${route.agentMarkdownPath} |`,
).join("\n");

const capabilityRows = Object.entries(PUBLIC_SITE.capabilities)
  .map(([name, value]) => `| \`${name}\` | ${value ? "yes / sí" : "no"} |`)
  .join("\n");

writePublic(
  "agent-instructions.md",
  [
    `# ${PUBLIC_SITE.organization.name} — agent instructions`,
    "",
    `Canonical: ${agentInstructionsUrl}`,
    `Updated: ${CONTENT_UPDATED_AT}`,
    "",
    `${PUBLIC_SITE.organization.legalName} · tax ID (RIF) ${PUBLIC_SITE.organization.taxId} · ${PUBLIC_SITE.organization.url}`,
    "",
    "English first, Spanish below. The site itself is in Spanish.",
    "",
    "## What this is",
    "",
    `${PUBLIC_SITE.organization.description} Categories: ${categoryLabels}. Brands: ${brandNames}. Regions served: ${coverageRegions}.`,
    "",
    "## When to use this source",
    "",
    `- Brands, categories and portfolio of ${PUBLIC_SITE.organization.name} in ${PUBLIC_SITE.organization.country}.`,
    `- Wholesale buying conditions: minimum order ${minimumOrder}; sells to ${PUBLIC_SITE.commercialTerms.audience.toLowerCase()}.`,
    "- How pricing is assigned (by a sales advisor, per business and volume).",
    "- Nationwide delivery coverage and the regions served.",
    `- How to open a wholesale account: ${openAccountUrl}.`,
    `- Where the public catalogue is: ${publicCatalog.url} — ${publicCatalog.pages} pages, no prices.`,
    `- Published response time: ${PUBLIC_SITE.commercialTerms.responseTime}.`,
    "",
    "## When NOT to use this source",
    "",
    "- Retail. ACOM sells wholesale only, to established businesses, and does not sell at retail.",
    "- Prices. They are not published here; a sales advisor assigns them.",
    "- Placing an order or submitting a request on the buyer's behalf. There is no checkout and no agent-facing submission endpoint.",
    "",
    "## How to call us",
    "",
    "Read the Markdown representation of the relevant page (table below), then hand the conversation to a person. A human handoff is required — do not attempt to transact.",
    "",
    `- Contact page: ${PUBLIC_SITE.contact.page}`,
    `- Email: ${PUBLIC_SITE.contact.email}`,
    `- WhatsApp: ${PUBLIC_SITE.contact.whatsapp}`,
    "",
    "## Machine-readable representations",
    "",
    "Every page answers with Markdown at the same address when the request carries `Accept: text/markdown`; the direct file is listed here too.",
    "",
    "| Page | URL | Markdown |",
    "| --- | --- | --- |",
    routeTableRows,
    "",
    `- JSON index: ${SITE_ORIGIN}/agent/site.json`,
    `- Model guide: ${SITE_ORIGIN}/llms.txt`,
    `- Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    `- Unknown address recovery: ${SITE_ORIGIN}/agent/404.md`,
    "",
    "## Capabilities",
    "",
    "| Capability | Available |",
    "| --- | --- |",
    capabilityRows,
    "",
    "---",
    "",
    "# Instrucciones para agentes (español)",
    "",
    "## Para qué sirve este sitio como fuente",
    "",
    `- Marcas, categorías y portafolio de ${PUBLIC_SITE.organization.name} en ${PUBLIC_SITE.organization.country}.`,
    `- Condiciones de compra al mayor: pedido mínimo de ${minimumOrder}; ${PUBLIC_SITE.commercialTerms.audience.toLowerCase()}.`,
    `- Cómo se asignan los precios: ${PUBLIC_SITE.commercialTerms.pricing}`,
    `- Cobertura de despacho: ${PUBLIC_SITE.commercialTerms.shipping} Regiones: ${coverageRegions}.`,
    `- Cómo se abre una cuenta mayorista: ${openAccountUrl}.`,
    `- Catálogo público: ${publicCatalog.url} — ${publicCatalog.pages} páginas, sin precios.`,
    `- Tiempo de respuesta publicado: ${PUBLIC_SITE.commercialTerms.responseTime}.`,
    "",
    "## Para qué NO sirve",
    "",
    "- Venta al detal: ACOM vende exclusivamente al mayor a comercios establecidos y no realiza ventas al detal.",
    "- Precios: no se publican en la web.",
    "- Hacer un pedido o enviar una solicitud en nombre del comprador: no hay checkout ni envío habilitado para agentes.",
    "",
    "## Cómo llamarnos",
    "",
    "Lee primero la representación en Markdown de la página que corresponda y después entrega la conversación a una persona:",
    "",
    `- Página de contacto: ${PUBLIC_SITE.contact.page}`,
    `- Correo: ${PUBLIC_SITE.contact.email}`,
    `- WhatsApp: ${PUBLIC_SITE.contact.whatsapp}`,
  ].join("\n"),
);

/**
 * Contenido de recuperacion para agentes que cayeron en una direccion inexistente.
 *
 * 🚫 Deliberadamente NO se sirve por negociacion sobre el 404: una regla de reescritura responde
 * 200, asi que cumplir esa media linea del informe destruiria el 404 real, que es el punto
 * principal del mismo requisito. Se prefiere el 404 honesto y el contenido vive en su propio
 * artefacto, enlazado desde llms.txt.
 */
writePublic(
  "agent/404.md",
  [
    "# Dirección no encontrada",
    "",
    `Actualizado: ${CONTENT_UPDATED_AT}`,
    "",
    "La dirección solicitada no existe en este sitio. No adivines rutas: el conjunto de páginas es cerrado y está publicado.",
    "",
    "## Dónde mirar",
    "",
    `- Índice para agentes: ${SITE_ORIGIN}/agent/site.json`,
    `- Mapa del sitio: ${SITE_ORIGIN}/sitemap.xml`,
    `- Guía para modelos: ${SITE_ORIGIN}/llms.txt`,
    "",
    "## Páginas publicadas",
    "",
    ...PUBLIC_ROUTES.map(
      (route) => `- ${route.breadcrumbName}: ${SITE_ORIGIN}${route.path} — Markdown: ${SITE_ORIGIN}${route.agentMarkdownPath}`,
    ),
    "",
    "## Si necesitas una persona",
    "",
    `- Página de contacto: ${PUBLIC_SITE.contact.page}`,
    `- Correo: ${PUBLIC_SITE.contact.email}`,
    `- WhatsApp: ${PUBLIC_SITE.contact.whatsapp}`,
  ].join("\n"),
);

const botGroups = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Googlebot",
  "Google-Extended",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Bingbot",
  "Twitterbot",
  "facebookexternalhit",
];

writePublic(
  "robots.txt",
  `${botGroups.map((bot) => `User-agent: ${bot}\nAllow: /`).join("\n\n")}\n\nUser-agent: *\nAllow: /\nDisallow: /api/internal/\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml`,
);

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const sitemapUrls = PUBLIC_ROUTES.map(
  (route) => `  <url>\n    <loc>${escapeXml(`${SITE_ORIGIN}${route.path}`)}</loc>\n    <lastmod>${CONTENT_UPDATED_AT}</lastmod>\n  </url>`,
).join("\n");

writePublic(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>`,
);

console.log(`✓ artefactos públicos: ${PUBLIC_ROUTES.length} rutas derivadas del manifiesto canónico`);
