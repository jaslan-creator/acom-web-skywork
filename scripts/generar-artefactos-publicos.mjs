#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  CONTENT_UPDATED_AT,
  PUBLIC_ROUTES,
  PUBLIC_SITE,
  SITE_ORIGIN,
} from "../src/data/publicContent.ts";

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

writePublic(
  "llms.txt",
  `# ACOM Trading\n\n> Importador y distribuidor mayorista para comercios en Venezuela.\n\n## Condiciones comerciales\n\n- Venta exclusivamente al mayor.\n- Pedido mínimo: $${PUBLIC_SITE.commercialTerms.minimumOrder.amount} ${PUBLIC_SITE.commercialTerms.minimumOrder.currency}.\n- Los precios los proporciona un asesor según el negocio y el volumen.\n- Despachos gratis a nivel nacional, sujetos a coordinación y disponibilidad.\n- No hay checkout ni envío de solicitudes habilitado para agentes; se requiere entrega a una persona.\n\n## Contenido público\n\n${routeLinks}\n\n## Datos estructurados\n\n- [Índice JSON](${SITE_ORIGIN}/agent/site.json)`,
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
