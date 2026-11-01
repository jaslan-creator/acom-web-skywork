#!/usr/bin/env node
/**
 * Checks that every published catalog still has exactly the number of pages the site claims.
 *
 * WHY: the renderer writes its `pages.json` manifest to disk only — it is never uploaded to R2 —
 * so each `pages` in CATALOGS (src/lib/index.ts) is a hardcoded number with nothing behind it.
 * Re-rendering a catalog with a different length would leave the viewer offering pages that 404,
 * and nothing would report it. This is the detector. It reads CATALOGS directly, so the claimed
 * counts are never copied here.
 *
 * Needs network, so it is NOT part of `npm run build`. Run it after re-rendering a catalog.
 *
 *   npm run verify:catalogo
 */
import { CATALOGS, catalogPageUrl } from "../src/lib/index.ts";

const status = async (catalog, n) => (await fetch(catalogPageUrl(catalog, n), { method: "HEAD" })).status;

let failed = 0;
const check = (ok, msg) => { console[ok ? "log" : "error"](`${ok ? "✓" : "✗"} ${msg}`); if (!ok) failed++; };

for (const catalog of CATALOGS) {
  const claimed = catalog.pages;
  const [first, last, beyond] = await Promise.all([
    status(catalog, 1),
    status(catalog, claimed),
    status(catalog, claimed + 1),
  ]);
  check(first === 200, `${catalog.slug}: la página 1 responde 200 (dio ${first})`);
  check(last === 200, `${catalog.slug}: la página ${claimed} responde 200 (dio ${last}) — si no, el catálogo tiene MENOS páginas de las que el sitio ofrece`);
  check(beyond === 404, `${catalog.slug}: la página ${claimed + 1} responde 404 (dio ${beyond}) — si diera 200, el catálogo tiene MÁS páginas y el visor las esconde`);
}

process.exit(failed ? 1 : 0);
