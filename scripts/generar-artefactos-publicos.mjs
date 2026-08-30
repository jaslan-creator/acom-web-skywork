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
  `# ACOM Trading\n\n> Importador y distribuidor mayorista para comercios en Venezuela.\n\n## Condiciones comerciales\n\n- Venta exclusivamente al mayor.\n- Pedido mínimo: $${PUBLIC_SITE.commercialTerms.minimumOrder.amount} ${PUBLIC_SITE.commercialTerms.minimumOrder.currency}.\n- Los precios los proporciona un asesor según el negocio y el volumen.\n- Despachos gratis a nivel nacional, sujetos a coordinación y disponibilidad.\n- No hay checkout ni envío de solicitudes habilitado para agentes; se requiere entrega a una persona.\n\n${whenToUse}\n\n## Contenido público\n\n${routeLinks}\n\n## Datos estructurados\n\n- [Índice JSON](${SITE_ORIGIN}/agent/site.json)\n- [Qué hacer ante una dirección inexistente](${SITE_ORIGIN}/agent/404.md)`,
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
