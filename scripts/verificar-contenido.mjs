#!/usr/bin/env node
/**
 * Content guard: things that must NOT come back, and things that must stay.
 *
 * WHY IT RUNS OVER dist/ AND NOT src/: it checks what is actually served. Source comments
 * legitimately explain why a brand was removed or why a portal died — grepping src/ would flag
 * those and force per-case exemptions, and a guard that needs exemptions stops being read.
 * The built output has the comments stripped, so a hit here is a hit a visitor can see.
 *
 * WHY IT EXISTS AT ALL: every item below is a failure that already happened and that nothing
 * could catch. The footer advertised an archived brand on all 7 pages for months; the meta
 * description named it for every route; the primary CTA pointed at a portal that had been
 * retired. None of it produced an error anywhere.
 *
 *   npm run build && npm run verify
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";

/** Strings that must not appear in anything we serve, with why they are banned. */
const BANNED = [
  ["b2b.acomve.com", "portal retirado el 2026-08-02; responde 307 a /catalogo/cerrado"],
  ["Zanotti", "marca archivada en Odoo el 2026-08-22"],
  ["SanRemo", "grafía incorrecta; la marca es «Sanremo»"],
  ["Newell", "marca NO comercializada"],
  ["Sanford", "marca NO comercializada"],
  ["Cotizar en línea", "el portal no es autoservicio: es por invitación"],
  ["Cotiza y compra en línea", "idem"],
  ["8a1f1d", "rojo viejo; el del manual es #A5002B"],
  ["Plus Jakarta", "tipografía anterior; el manual fija Montserrat"],
  ["US$250 - US$5,000", "cifra de crédito sin respaldo (hay cupos reales de $10.000 y $12.000)"],
  ["Cuatro categorías", "el número quedó derivado de los datos"],
  ["Atención Inmediata", "era un tercer tiempo de respuesta que contradecía a los otros dos"],
];

/** Strings that must be present, so a regression that DELETES content is caught too. */
const REQUIRED = [
  ["cliente.acomve.com", "el portal vivo"],
  ["Momentop", "marca publicada desde el 2026-08-22"],
  ["Sanremo", "grafía correcta"],
  ["Termos y Cavas", "la 5.ª categoría"],
  ["catalogos.acomve.com", "el catálogo enlazado"],
  ["Montserrat", "tipografía del manual"],
  ["IBM Plex Mono", "la mono se conserva: sostiene el banner, los $250 y las stats"],
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(html|js|css|txt|xml|json)$/.test(entry)) out.push(full);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error(`✗ No existe ${DIST}/. Corré "npm run build" primero: este guard mira lo que se sirve, no el código fuente.`);
  process.exit(1);
}

const files = walk(DIST);
const contents = files.map((f) => [f, readFileSync(f, "utf8")]);
let failed = 0;

for (const [needle, why] of BANNED) {
  const hits = contents.filter(([, text]) => text.includes(needle)).map(([f]) => f);
  if (hits.length) {
    failed++;
    console.error(`✗ PROHIBIDO «${needle}» — ${why}\n    en: ${hits.join(", ")}`);
  }
}

for (const [needle, why] of REQUIRED) {
  if (!contents.some(([, text]) => text.includes(needle))) {
    failed++;
    console.error(`✗ FALTA «${needle}» — ${why}`);
  }
}

if (failed) {
  console.error(`\n${failed} comprobación(es) en rojo sobre ${files.length} archivos de ${DIST}/.`);
  process.exit(1);
}
console.log(`✓ ${BANNED.length} prohibidas ausentes y ${REQUIRED.length} requeridas presentes, sobre ${files.length} archivos de ${DIST}/.`);
