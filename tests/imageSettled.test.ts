import { test } from "node:test";
import assert from "node:assert/strict";

import { settledStatus } from "../src/lib/imageSettled.ts";

test("imagen que terminó de cargar antes de hidratar: loaded", () => {
  assert.equal(settledStatus({ complete: true, naturalWidth: 800 }), "loaded");
});

test("imagen que falló antes de hidratar: error", () => {
  assert.equal(settledStatus({ complete: true, naturalWidth: 0 }), "error");
});

test("imagen todavía en camino: no decide, espera al onLoad", () => {
  assert.equal(settledStatus({ complete: false, naturalWidth: 0 }), null);
});
