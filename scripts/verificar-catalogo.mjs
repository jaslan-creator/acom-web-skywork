#!/usr/bin/env node
/**
 * Checks that the published catalog still has exactly the number of pages the site claims.
 *
 * WHY: the renderer writes its `pages.json` manifest to disk only — it is never uploaded to R2 —
 * so the page count in src/lib/index.ts is a hardcoded number with nothing behind it. Re-rendering
 * next year's catalog with a different length would leave the viewer offering pages that 404,
 * and nothing would report it. This is the detector.
 *
 * Needs network, so it is NOT part of `npm run build`. Run it after re-rendering a catalog.
 *
 *   npm run verify:catalogo
 */
const BASE = "https://catalogos.acomve.com/catalog_pages";
const SLUG = "bambary-2026";
const CLAIMED = 82; // must match CATALOG.PAGES in src/lib/index.ts

const url = (n) => `${BASE}/${SLUG}/p-${String(n).padStart(3, "0")}.webp`;
const status = async (n) => (await fetch(url(n), { method: "HEAD" })).status;

const last = await status(CLAIMED);
const beyond = await status(CLAIMED + 1);
const first = await status(1);

let failed = 0;
const check = (ok, msg) => { console[ok ? "log" : "error"](`${ok ? "✓" : "✗"} ${msg}`); if (!ok) failed++; };

check(first === 200, `la página 1 responde 200 (dio ${first})`);
check(last === 200, `la página ${CLAIMED} responde 200 (dio ${last}) — si no, el catálogo tiene MENOS páginas de las que el sitio ofrece`);
check(beyond === 404, `la página ${CLAIMED + 1} responde 404 (dio ${beyond}) — si diera 200, el catálogo tiene MÁS páginas y el visor las esconde`);

process.exit(failed ? 1 : 0);
