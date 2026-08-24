#!/usr/bin/env node
/**
 * Gate AEO sobre lo que se publica, no sobre componentes React.
 *
 * Protege cuatro fallos silenciosos: HTML vacio para crawlers sin JS, metadata repetida,
 * representaciones de agentes que divergen del sitio y exposicion accidental de la API de leads.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PUBLIC_ROUTES, SITE_ORIGIN } from "../src/data/publicContent.ts";

const DIST = "dist";
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (path) => readFileSync(path, "utf8");
const htmlFile = (path) =>
  path === "/" ? join(DIST, "index.html") : join(DIST, `${path.slice(1)}.html`);
const count = (text, pattern) => [...text.matchAll(pattern)].length;

check(existsSync(DIST), "no existe dist/; ejecuta el build SSG antes del gate AEO");

const titles = new Set();
const descriptions = new Set();

for (const route of PUBLIC_ROUTES) {
  const file = htmlFile(route.path);
  check(existsSync(file), `${route.path}: falta ${file}`);
  if (!existsSync(file)) continue;

  const html = read(file);
  const title = html.match(/<title(?:\s[^>]*)?>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim()
    ?? "";

  check(title === route.title, `${route.path}: title inesperado: ${title || "(vacio)"}`);
  check(description === route.description, `${route.path}: description inesperada`);
  check(!titles.has(title), `${route.path}: title duplicado`);
  check(!descriptions.has(description), `${route.path}: description duplicada`);
  titles.add(title);
  descriptions.add(description);

  check(count(html, /<h1\b/gi) === 1, `${route.path}: debe tener exactamente un h1 en HTML`);
  check(html.includes(route.htmlMustContain), `${route.path}: falta contenido critico prerenderizado`);
  check(
    html.includes(`<link data-rh="true" rel="canonical" href="${SITE_ORIGIN}${route.path}"`) ||
      html.includes(`<link rel="canonical" href="${SITE_ORIGIN}${route.path}"`),
    `${route.path}: canonical ausente o incorrecto`,
  );
  check(html.includes(`href="${route.agentMarkdownPath}"`), `${route.path}: falta alternate Markdown`);

  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  check(jsonLdBlocks.length === 1, `${route.path}: debe tener exactamente un bloque JSON-LD`);
  for (const [, source] of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(source.replace(/&quot;/g, '"'));
      check(parsed?.["@context"] === "https://schema.org", `${route.path}: @context JSON-LD incorrecto`);
    } catch {
      failures.push(`${route.path}: JSON-LD invalido`);
    }
  }

  const markdownFile = join(DIST, route.agentMarkdownPath.slice(1));
  check(existsSync(markdownFile), `${route.path}: falta ${route.agentMarkdownPath}`);
  if (existsSync(markdownFile)) {
    const markdown = read(markdownFile);
    check(markdown.includes(`Canonical: ${SITE_ORIGIN}${route.path}`), `${route.path}: canonical Markdown incorrecto`);
    check(markdown.includes(route.agentMustContain), `${route.path}: Markdown sin el dato critico`);
  }
}

const siteJsonPath = join(DIST, "agent/site.json");
check(existsSync(siteJsonPath), "falta /agent/site.json");
if (existsSync(siteJsonPath)) {
  const siteText = read(siteJsonPath);
  const forbidden = ["/api/lead", "LeadPayload", "turnstileToken", '"method":"POST"', '"checkout":true'];
  for (const token of forbidden) check(!siteText.includes(token), `/agent/site.json expone ${token}`);
  try {
    const site = JSON.parse(siteText);
    check(site.schemaVersion === "1.0", "/agent/site.json: schemaVersion incorrecta");
    check(site.capabilities?.leadSubmission === false, "/agent/site.json: leadSubmission debe ser false");
    check(site.capabilities?.checkout === false, "/agent/site.json: checkout debe ser false");
    check(site.routes?.length === PUBLIC_ROUTES.length, "/agent/site.json: conjunto de rutas incompleto");
  } catch {
    failures.push("/agent/site.json no es JSON valido");
  }
}

const sitemapPath = join(DIST, "sitemap.xml");
check(existsSync(sitemapPath), "falta sitemap.xml");
if (existsSync(sitemapPath)) {
  const sitemap = read(sitemapPath);
  for (const route of PUBLIC_ROUTES) {
    check(sitemap.includes(`<loc>${SITE_ORIGIN}${route.path}</loc>`), `sitemap: falta ${route.path}`);
  }
  check(count(sitemap, /<url>/g) === PUBLIC_ROUTES.length, "sitemap: tiene rutas fuera del manifiesto");
}

const robotsPath = join(DIST, "robots.txt");
check(existsSync(robotsPath), "falta robots.txt");
if (existsSync(robotsPath)) {
  const robots = read(robotsPath);
  for (const bot of ["OAI-SearchBot", "GPTBot", "Google-Extended", "Claude-SearchBot", "PerplexityBot"]) {
    check(robots.includes(`User-agent: ${bot}`), `robots.txt: falta ${bot}`);
  }
}

const notFoundPath = join(DIST, "404.html");
check(existsSync(notFoundPath), "falta 404.html");
if (existsSync(notFoundPath)) {
  const html = read(notFoundPath);
  check(/name=["']robots["'][^>]+noindex/i.test(html), "404.html: falta noindex");
  check(!html.includes("/404"), "404.html: no debe imprimir una ruta fija que rompa la hidratacion");
}

if (failures.length) {
  console.error("✗ gate AEO:");
  for (const failure of failures) console.error(`  · ${failure}`);
  process.exit(1);
}

console.log(`✓ AEO: ${PUBLIC_ROUTES.length} rutas prerenderizadas, metadata unica y artefactos publicos coherentes`);
