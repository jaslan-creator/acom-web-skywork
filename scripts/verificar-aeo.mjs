#!/usr/bin/env node
/**
 * Gate AEO sobre lo que se publica, no sobre componentes React.
 *
 * Protege cuatro fallos silenciosos: HTML vacio para crawlers sin JS, metadata repetida,
 * representaciones de agentes que divergen del sitio y exposicion accidental de la API de leads.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PUBLIC_ROUTES, PUBLIC_SITE, SITE_ORIGIN } from "../src/data/publicContent.ts";

const DIST = "dist";
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (path) => readFileSync(path, "utf8");
const htmlFile = (path) =>
  path === "/" ? join(DIST, "index.html") : join(DIST, `${path.slice(1)}.html`);
const count = (text, pattern) => [...text.matchAll(pattern)].length;
const jsonLdBlocks = (html) =>
  [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    ([, source]) => {
      try {
        return JSON.parse(source.replace(/&quot;/g, '"'));
      } catch {
        return null;
      }
    },
  );

/**
 * Los campos que el informe externo busca en la identidad. Estaban TODOS desde antes, dentro del
 * `@graph`, y se reportaban como faltantes: el raiz de un documento con `@graph` no tiene `@type`,
 * asi que un consumidor que abre el primer bloque y pregunta por el tipo no encuentra nada.
 */
const ORGANIZATION_REQUIRED = ["name", "description", "url", "logo", "address", "sameAs", "alternateName", "taxID"];

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

  // 🚨 DOS bloques, y el ORDEN es el contrato: identidad plana primero, grafo despues. Ver
  //    src/lib/structuredData.ts. Que sean dos no es cosmetico: el primer objeto que abre un
  //    consumidor tiene que ser `{"@type":"Organization", …}`, no un `@graph` que no sabe recorrer.
  const blocks = jsonLdBlocks(html);
  check(
    blocks.length === 2,
    `${route.path}: debe tener exactamente dos bloques JSON-LD (identidad + grafo), tiene ${blocks.length}`,
  );
  check(
    blocks.every((block) => block?.["@context"] === "https://schema.org"),
    `${route.path}: hay un bloque JSON-LD invalido o con @context incorrecto`,
  );

  const [identity, graphDocument] = blocks;
  // `@type` como CADENA: `["Organization","WholesaleStore"]` es valido en la norma y rompe a todo
  // consumidor ingenuo que compare por igualdad. El tipado multiple va en `additionalType`.
  check(
    identity?.["@type"] === "Organization",
    `${route.path}: el 1er bloque JSON-LD debe ser "@type": "Organization" como cadena`,
  );
  for (const field of ORGANIZATION_REQUIRED) {
    const value = identity?.[field];
    check(
      Array.isArray(value) ? value.length > 0 : Boolean(value),
      `${route.path}: la identidad JSON-LD no trae ${field}`,
    );
  }

  const graph = graphDocument?.["@graph"];
  check(Array.isArray(graph) && graph.length > 0, `${route.path}: el 2do bloque JSON-LD debe traer @graph`);
  // Y la organizacion NO puede volver a aparecer como nodo propio del grafo: seria una segunda
  // fuente de verdad de la misma entidad, y se separarian sin que nada falle. Va solo por @id.
  for (const node of Array.isArray(graph) ? graph : []) {
    check(
      !String(node?.["@id"] ?? "").endsWith("#organization"),
      `${route.path}: la organizacion vuelve a aparecer en el @graph; ahi va SOLO referenciada por @id`,
    );
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
    check(
      site.agentInstructions === `${SITE_ORIGIN}/agent-instructions.md`,
      "/agent/site.json: no declara donde viven las instrucciones para agentes",
    );
    check(
      site.organization?.taxId === PUBLIC_SITE.organization.taxId,
      "/agent/site.json: el identificador fiscal no coincide con el manifiesto",
    );
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
  // Lo que se prohibe es que la pagina imprima SU PROPIA direccion: se renderiza en /404 y se sirve
  // desde /loquesea, asi que un enlace a /404 mentiria y la hidratacion discreparia en el primer
  // render. 🚨 Hasta el 2026-08-30 esto era una comparacion de subcadena, y por eso atrapaba a
  // `/agent/404.md`, que NO es su direccion sino otro recurso — el documento de recuperacion. La
  // excepcion es exactamente esa y va expresada, no listada aparte: cualquier `/404` que no cuelgue
  // de /agent sigue prohibido.
  check(!/(?<!\/agent)\/404/.test(html), "404.html: no debe imprimir una ruta fija que rompa la hidratacion");
}

// ---------------------------------------------------------------------------------------------
// Negociacion de contenido, alias y recuperacion del 404.
//
// ⚠️ LIMITE DE ESTE GATE, y hay que leerlo antes de confiar en el verde: estas aserciones leen el
// vercel.json DEL REPOSITORIO, no lo que Vercel sirve. Un route puesto a mano en el panel puede
// pisarlo sin ningun deploy => verde aca NO prueba vivo en produccion. Toda asercion de
// enrutamiento se acompaña de una comprobacion contra el dominio (ver docs/plans/).
//
// 🚨 Por que `routes` y no `rewrites`: medido contra un preview el 2026-08-30, un rewrite cuyo
// `source` es una pagina existente NO dispara nunca — la documentacion de Vercel lo dice
// («precedence is given to the filesystem prior to rewrites being applied») y el preview lo
// confirmo devolviendo text/html. `routes` corre antes del filesystem y responde 200 en la misma
// direccion, que es justo lo que se buscaba.
// ---------------------------------------------------------------------------------------------
const ACCEPTS_MARKDOWN = ".*text/markdown.*";
const REJECTS_MARKDOWN = ".*text/markdown *; *q=0(\\.0+)?([,;].*)?";

const vercelConfigPath = "vercel.json";
check(existsSync(vercelConfigPath), "falta vercel.json");
if (existsSync(vercelConfigPath)) {
  let vercelConfig = null;
  try {
    vercelConfig = JSON.parse(read(vercelConfigPath));
  } catch {
    failures.push("vercel.json no es JSON valido");
  }

  if (vercelConfig) {
    const allRoutes = vercelConfig.routes ?? [];

    // 0. La ULTIMA entrada de `routes` es el 404 en Markdown; las anteriores, las del manifiesto.
    //
    //    🚨 NO hay marcador de fase, y esto se midio contra un preview el 2026-08-30 en vez de
    //    razonarlo: agregar `{"handle":"error"}` DESACTIVA en silencio los `redirects` y el bloque
    //    `headers` enteros. Control corrido en el MISMO dominio de preview con el commit anterior:
    //    con el marcador, /faq daba 404 y las cabeceras globales 0 de 3; sin el, 307 y 3 de 3.
    //    Nada fallaba: el sitio se veia igual y se quedaba sin CSP, sin Permissions-Policy y sin
    //    sus siete alias. Por eso este guard vigila que no vuelva a aparecer un `handle`.
    const routes = allRoutes.slice(0, -1);
    const markdown404 = allRoutes[allRoutes.length - 1];
    check(
      allRoutes.every((rule) => rule.handle === undefined),
      "vercel.json: ningun route puede llevar `handle`: desactiva los redirects y las cabeceras globales",
    );

    // 1. Una regla por CADA ruta del manifiesto y ninguna de mas. Las 10 son explicitas a
    //    proposito: `/` es el unico caso asimetrico (su Markdown es inicio.md), asi que una regla
    //    que derivara el destino transformando el path se romperia solo en la home, que es la que
    //    nadie prueba.
    //    🚨 Y van ANTES del marcador: una regla de pagina que quedara despues caeria en la fase de
    //    error y no dispararia NUNCA, sin dar ningun error.
    check(
      routes.length === PUBLIC_ROUTES.length,
      `vercel.json: ${routes.length} reglas de pagina para ${PUBLIC_ROUTES.length} rutas del manifiesto`,
    );
    for (const route of PUBLIC_ROUTES) {
      const rule = routes.find((candidate) => candidate.src === route.path);
      check(Boolean(rule), `vercel.json: falta la regla de Markdown de ${route.path}`);
      if (!rule) continue;
      check(
        rule.dest === route.agentMarkdownPath,
        `vercel.json: ${route.path} apunta a ${rule.dest} y su Markdown es ${route.agentMarkdownPath}`,
      );
      check(
        rule.has?.some((c) => c.type === "header" && c.key === "accept" && c.value === ACCEPTS_MARKDOWN),
        `vercel.json: ${route.path} no condiciona por Accept: text/markdown`,
      );
      // 2. `;q=0` significa RECHAZADO en la norma, no «aceptable con peso cero»: servir Markdown
      //    ahi seria violarla. Se expresa con `missing` y no con un lookahead negativo porque el
      //    motor de expresiones del enrutador no esta documentado como PCRE completo.
      check(
        rule.missing?.some((c) => c.type === "header" && c.key === "accept" && c.value === REJECTS_MARKDOWN),
        `vercel.json: ${route.path} no excluye el rechazo explicito ;q=0`,
      );
      // 3. `Vary: Accept` va EN LA REGLA, no solo en el bloque global: medido, cuando un `routes`
      //    empareja, las cabeceras globales no se aplican a esa respuesta. Sin esto una cache
      //    intermedia puede mezclar variantes y una persona recibiria texto plano.
      check(rule.headers?.Vary === "Accept", `vercel.json: ${route.path} sin Vary: Accept en la regla`);
    }
    for (const rule of routes) {
      check(
        PUBLIC_ROUTES.some((route) => route.path === rule.src),
        `vercel.json: regla de Markdown para ${rule.src}, que no esta en el manifiesto`,
      );
    }

    // 3-ter. El comodin del final entrega el 404 en Markdown, y con estado 404 DE VERDAD.
    //
    //    🚨 Esto se habia descartado en la ronda del 2026-08-30 por una razon que resulto ser del
    //    mecanismo y no del objetivo: un `rewrite` responde 200, asi que servir Markdown ahi
    //    destruia el 404 real, que es el punto principal del mismo requisito. Una entrada de
    //    `routes` acepta `status`, asi que devuelve las dos cosas a la vez.
    //
    //    🚨 Corre ANTES del filesystem, asi que NO detecta un 404: lo AFIRMA. Lo que lo vuelve
    //    seguro es que no puede tapar ningun archivo real — exige que la ruta no tenga NI UN punto,
    //    y los 68 archivos de dist/ tienen extension, incluido el manifiesto de hash variable por
    //    build que hundia la version enumerada de esta idea. Las diez paginas las atrapan sus
    //    propias reglas, que van antes.
    //
    //    🚨 Y la lista de exclusiones se DERIVA de los `redirects`, jamas se escribe a mano: un
    //    alias nuevo sin actualizar el comodin dejaria de redirigir y empezaria a devolver «no
    //    encontrado» en Markdown, callado y solo para agentes, que son quienes no reportan.
    const aliasSources = (vercelConfig.redirects ?? []).map((entry) => entry.source.replace(/^\//, "")).sort();
    const expectedWildcard = `^/(?!${aliasSources.map((alias) => `${alias}$`).join("|")})[^.]*[^./]$`;
    if (markdown404) {
      check(
        markdown404.src === expectedWildcard,
        `vercel.json: el comodin del 404 no excluye exactamente los alias de redirects\n      esperado: ${expectedWildcard}\n      esta:     ${markdown404.src}`,
      );
      check(markdown404.status === 404, "vercel.json: el 404 en Markdown debe responder con estado 404, no 200");
      check(markdown404.dest === "/agent/404.md", `vercel.json: el 404 en Markdown apunta a ${markdown404.dest}`);
      check(
        markdown404.has?.some((c) => c.type === "header" && c.key === "accept" && c.value === ACCEPTS_MARKDOWN),
        "vercel.json: el 404 en Markdown no condiciona por Accept: text/markdown",
      );
      check(
        markdown404.missing?.some((c) => c.type === "header" && c.key === "accept" && c.value === REJECTS_MARKDOWN),
        "vercel.json: el 404 en Markdown no excluye el rechazo explicito ;q=0",
      );
      check(markdown404.headers?.Vary === "Accept", "vercel.json: el 404 en Markdown sin Vary: Accept en la regla");
    }

    // 3-bis. `Vary: Accept` tambien sobre la variante HTML, que es la que la cache sirve a personas.
    const globalHeaders = (vercelConfig.headers ?? []).find((entry) => entry.source === "/(.*)");
    check(
      globalHeaders?.headers?.some((h) => h.key === "Vary" && h.value === "Accept"),
      "vercel.json: falta Vary: Accept en el bloque global de cabeceras",
    );

    // 7. Los alias en ingles van como redireccion TEMPORAL. Una permanente la cachea el navegador
    //    para siempre: el dia que /faq sea una pagina de verdad, quien haya tocado el alias no
    //    podria llegar nunca. Se endurecen cuando tengan trafico probado.
    const ALIASES = [
      ["/privacy", "/politica-de-privacidad"],
      ["/privacidad", "/politica-de-privacidad"],
      ["/about", "/sobre-acom"],
      ["/contact", "/contacto"],
      ["/terms", "/terminos-y-condiciones"],
      ["/faq", "/preguntas-frecuentes"],
    ];
    for (const [source, destination] of ALIASES) {
      const redirect = (vercelConfig.redirects ?? []).find((entry) => entry.source === source);
      check(Boolean(redirect), `vercel.json: falta el alias ${source}`);
      if (!redirect) continue;
      check(redirect.destination === destination, `vercel.json: ${source} deberia ir a ${destination}`);
      check(redirect.permanent === false, `vercel.json: ${source} debe ser 307, nunca 308`);
      check(
        !PUBLIC_ROUTES.some((route) => route.path === source),
        `vercel.json: ${source} es un alias y no puede ser una ruta del manifiesto`,
      );
    }
    // Y los alias NUNCA entran al sitemap: el sitemap trae exactamente el manifiesto.
    if (existsSync(sitemapPath)) {
      const sitemap = read(sitemapPath);
      for (const [source] of ALIASES) {
        check(!sitemap.includes(`<loc>${SITE_ORIGIN}${source}</loc>`), `sitemap: el alias ${source} no debe publicarse`);
      }
    }
  }
}

// 4. El 404 tiene que poder recuperarse, y los enlaces de recuperacion van como <a href> PLANO.
//    🚨 El router registra PUBLIC_ROUTES + 404 + comodin: un <Link to="/llms.txt"> lo intercepta,
//    empareja el comodin y vuelve a dibujar la misma pagina 404 — el enlace no recupera nada y no
//    da ningun error. En el HTML compilado un <Link> se ve identico a un <a>, asi que este
//    invariante SOLO es observable en el codigo fuente: por eso este guard lee las dos caras.
const notFoundSource = "src/pages/not-found/Index.tsx";
const RECOVERY_TARGETS = ["/sitemap.xml", "/llms.txt", "/agent/site.json"];
check(existsSync(notFoundSource), `falta ${notFoundSource}`);
if (existsSync(notFoundSource)) {
  // Se miran el CODIGO y no la prosa: el comentario del propio archivo explica la trampa citando
  // un <Link to="/llms.txt"> de ejemplo, y un guard que se dispara con su propia documentacion
  // obliga a una excepcion — y un guard con excepciones deja de leerse.
  const source = read(notFoundSource)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
  for (const target of RECOVERY_TARGETS) {
    check(source.includes(`href: "${target}"`) || source.includes(`href="${target}"`), `404: falta el enlace a ${target}`);
    check(!source.includes(`to="${target}"`) && !source.includes(`to: "${target}"`), `404: ${target} va en <a href>, jamas en <Link>`);
  }
}
if (existsSync(notFoundPath)) {
  const html = read(notFoundPath);
  for (const target of RECOVERY_TARGETS) {
    check(html.includes(`href="${target}"`), `404.html: no se renderizo el enlace a ${target}`);
  }
  // Descubrimiento, no enrutamiento: el 404 en Markdown lo entrega vercel.json a quien negocia, y
  // esto le dice donde mirar al agente que recibio HTML porque no mando la cabecera.
  check(
    /rel=["']alternate["'][^>]*href=["']\/agent\/404\.md["']/.test(html) ||
      /href=["']\/agent\/404\.md["'][^>]*rel=["']alternate["']/.test(html),
    "404.html: falta el <link rel=alternate> a /agent/404.md",
  );
}

// 5. llms.txt tiene que decir para que sirve este sitio y nombrar el traspaso a una persona.
const llmsPath = join(DIST, "llms.txt");
check(existsSync(llmsPath), "falta llms.txt");
if (existsSync(llmsPath)) {
  const llms = read(llmsPath);
  check(llms.includes("## Cuándo usar ACOM Trading como fuente"), "llms.txt: falta la seccion «Cuando usar»");
  // 🚨 La misma guia en ingles, y no es cortesia: el sitio se queda en espanol. Las herramientas de
  //    agentes detectan en ingles — medido, un informe externo reporto «sin guia de cuando usarnos»
  //    teniendo la seccion espanola completa, con sus ocho vinetas, en este mismo archivo.
  check(llms.includes("## When to use this source"), "llms.txt: falta la guia «When to use» en ingles");
  check(llms.includes("## How to reach a human"), "llms.txt: la guia en ingles no nombra el traspaso a una persona");
  check(llms.includes(`${SITE_ORIGIN}/agent-instructions.md`), "llms.txt: no enlaza las instrucciones para agentes");
  check(llms.includes("entrega la conversación a una persona"), "llms.txt: no nombra el traspaso a una persona");
  check(llms.includes("no realiza ventas al detal"), "llms.txt: falta el unico limite ya publicado (no se vende al detal)");
  check(llms.includes(`${SITE_ORIGIN}/agent/404.md`), "llms.txt: no enlaza el contenido de recuperacion");
  // El formulario NO se documenta: su envio va a un servicio externo tras un candado anti-bot y
  // esta declarado leadSubmission:false. Publicarlo seria anunciar una capacidad que no existe.
  for (const token of ["/api/lead", "turnstile", "Turnstile", "POST"]) {
    check(!llms.includes(token), `llms.txt: no debe documentar el envio del formulario (${token})`);
  }
}

// 5-bis. Las instrucciones para agentes existen ADEMAS de la seccion de llms.txt, no en su lugar:
//        un agente que entra por /agent/site.json nunca abre el .txt.
//        🚨 Y arrastran la MISMA prohibicion: no se documenta el envio del formulario. Va a un
//        servicio externo tras un candado anti-bot y esta declarado leadSubmission:false.
//        ⚠️ En ingles la trampa es propia: el token en mayusculas del verbo de envio HTTP se
//        escribe sin querer al explicar una API, y este archivo es mitad ingles.
const FORBIDDEN_AGENT_TOKENS = ["/api/lead", "turnstile", "Turnstile", "POST"];
const instructionsPath = join(DIST, "agent-instructions.md");
check(existsSync(instructionsPath), "falta /agent-instructions.md");
if (existsSync(instructionsPath)) {
  const instructions = read(instructionsPath);
  check(instructions.includes("## When to use this source"), "/agent-instructions.md: falta «When to use»");
  check(instructions.includes("## When NOT to use this source"), "/agent-instructions.md: falta «When NOT to use»");
  check(instructions.includes("A human handoff is required"), "/agent-instructions.md: no exige el traspaso a una persona");
  check(instructions.includes("# Instrucciones para agentes (español)"), "/agent-instructions.md: falta la mitad en espanol");
  check(instructions.includes(PUBLIC_SITE.organization.taxId), "/agent-instructions.md: no publica el identificador fiscal");
  for (const route of PUBLIC_ROUTES) {
    check(
      instructions.includes(`${SITE_ORIGIN}${route.agentMarkdownPath}`),
      `/agent-instructions.md: falta el Markdown de ${route.path}`,
    );
  }
  for (const token of FORBIDDEN_AGENT_TOKENS) {
    check(!instructions.includes(token), `/agent-instructions.md: no debe documentar el envio del formulario (${token})`);
  }
}

const recoveryPath = join(DIST, "agent/404.md");
check(existsSync(recoveryPath), "falta /agent/404.md");
if (existsSync(recoveryPath)) {
  const recovery = read(recoveryPath);
  for (const route of PUBLIC_ROUTES) {
    check(recovery.includes(`${SITE_ORIGIN}${route.agentMarkdownPath}`), `/agent/404.md: falta ${route.path}`);
  }
}

// 6. La identidad del JSON-LD sale de PUBLIC_SITE, JAMAS re-tipeada: un dato escrito a mano ahi se
//    pudre respecto del resto del sitio sin que nada falle. Vale para el contacto (que ya se
//    vigilaba) y ahora tambien para la descripcion, las grafias alternas y el identificador fiscal,
//    que son los tres campos nuevos.
const homeHtml = htmlFile("/");
if (existsSync(homeHtml)) {
  const identity = jsonLdBlocks(read(homeHtml))[0];
  check(Boolean(identity), "/: no se pudo leer la identidad JSON-LD");
  if (identity) {
    const points = identity.contactPoint ?? [];
    check(points.length > 0, "JSON-LD: la identidad no trae contactPoint");
    check(
      points.some((point) => point.email === PUBLIC_SITE.organization.email),
      "JSON-LD: el correo de contactPoint no coincide con PUBLIC_SITE",
    );
    check(
      points.some((point) => point.telephone === PUBLIC_SITE.organization.telephone),
      "JSON-LD: el telefono de contactPoint no coincide con PUBLIC_SITE",
    );
    check(
      identity.description === PUBLIC_SITE.organization.description,
      "JSON-LD: la descripcion de la identidad no coincide con PUBLIC_SITE",
    );
    check(
      identity.taxID === PUBLIC_SITE.organization.taxId,
      "JSON-LD: el identificador fiscal no coincide con PUBLIC_SITE",
    );
    check(
      JSON.stringify(identity.alternateName) === JSON.stringify([...PUBLIC_SITE.organization.alternateName]),
      "JSON-LD: las grafias alternas no coinciden con PUBLIC_SITE",
    );
    // La misma frase vive en llms.txt. Si las dos copias se separan, el sitio se describe distinto
    // segun por donde entres, y ninguna de las dos falla.
    const llmsForIdentity = existsSync(llmsPath) ? read(llmsPath) : "";
    check(
      llmsForIdentity.includes(PUBLIC_SITE.organization.description),
      "llms.txt: su linea de resumen no es la descripcion del manifiesto",
    );
  }
}

if (failures.length) {
  console.error("✗ gate AEO:");
  for (const failure of failures) console.error(`  · ${failure}`);
  process.exit(1);
}

console.log(`✓ AEO: ${PUBLIC_ROUTES.length} rutas prerenderizadas, metadata unica y artefactos publicos coherentes`);
