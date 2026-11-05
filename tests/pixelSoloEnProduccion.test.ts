import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

import { ALLOWED_HOSTS } from "../api/_lib/capi.ts";

/**
 * El pixel de Meta solo arranca en el sitio de producción.
 *
 * 🚨 Por qué existe. El snippet de `index.html` cargaba e inicializaba el pixel en CUALQUIER host:
 * medido en Meta el 2026-11-04, entraban eventos de `localhost` y de las URLs de preview de Vercel
 * mezclados con los de www.acomve.com. No falla nada: las estadísticas y las audiencias de
 * visitantes simplemente se ensucian cada día de desarrollo.
 *
 * Se EJECUTA el script de verdad (no se busca un texto): una condición que se lee bien pero no
 * corta nada pasaría un test de texto en verde.
 */

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function pixelScript(): string {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const pixel = scripts.filter((s) => s.includes("fbevents.js"));
  assert.equal(pixel.length, 1, "tiene que haber exactamente un <script> inline con el pixel");
  return pixel[0];
}

function runOn(hostname: string) {
  const inserted: string[] = [];
  const sandbox: Record<string, unknown> = {
    location: { hostname },
    document: {
      createElement: () => ({}),
      getElementsByTagName: () => [
        { parentNode: { insertBefore: (el: { src?: string }) => inserted.push(el.src ?? "") } },
      ],
    },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(pixelScript(), sandbox);
  const fbq = sandbox.fbq as { queue?: ArrayLike<ArrayLike<unknown>> } | undefined;
  // `Array.from` del lado del test: un arreglo nacido dentro del sandbox tiene otro prototipo y la
  // comparación estricta lo rechaza aunque el contenido sea idéntico.
  return { fbq, inserted, calls: Array.from(fbq?.queue ?? [], (args) => Array.from(args)) };
}

test("en producción el pixel carga, se inicializa y registra la visita", () => {
  for (const host of ALLOWED_HOSTS) {
    const { fbq, inserted, calls } = runOn(host);
    assert.ok(fbq, `${host}: fbq tiene que existir`);
    assert.deepEqual(inserted, ["https://connect.facebook.net/en_US/fbevents.js"], host);
    assert.deepEqual(calls, [["init", "1274191492980071"], ["track", "PageView"]], host);
  }
});

test("fuera de producción no se descarga el script ni se dispara nada", () => {
  for (const host of [
    "localhost",
    "127.0.0.1",
    "acom-web-skywork-37zjytk2v-jaslan-creators-projects.vercel.app",
    "acomve.com.evil.example",
  ]) {
    const { fbq, inserted } = runOn(host);
    assert.equal(fbq, undefined, `${host}: fbq no puede existir`);
    assert.deepEqual(inserted, [], `${host}: no se puede descargar fbevents.js`);
  }
});

test("la lista de hosts del pixel es la misma que acepta la CAPI", () => {
  const gate = pixelScript().match(/if\s*\(\s*\[([^\]]*)\]\s*\.indexOf\(\s*location\.hostname\s*\)\s*!==\s*-1\s*\)/);
  assert.ok(gate, "el snippet tiene que abrir con el chequeo de host");
  const hosts = [...gate[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2]);
  assert.deepEqual(hosts, ALLOWED_HOSTS);
});
