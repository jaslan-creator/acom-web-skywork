import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  hashContact,
  normalizeEmail,
  normalizeName,
  normalizePhoneVe,
  sha256Hex,
} from "../src/lib/metaMatch.ts";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

test("normalizeEmail: minúsculas y sin espacios; sin arroba no se manda", () => {
  assert.equal(normalizeEmail("  Ventas@ACOM.com "), "ventas@acom.com");
  assert.equal(normalizeEmail("sin-arroba"), undefined);
  assert.equal(normalizeEmail(""), undefined);
});

test("normalizePhoneVe: los formatos que escribe la gente dan 58 + 10 dígitos", () => {
  for (const raw of ["0414 123 4567", "0414-1234567", "+58 414 123 4567", "584141234567", "4141234567"]) {
    assert.equal(normalizePhoneVe(raw), "584141234567", raw);
  }
  assert.equal(normalizePhoneVe("(0212) 555 1234"), "582125551234");
  for (const raw of ["123", "", "0414"]) {
    assert.equal(normalizePhoneVe(raw), undefined, raw);
  }
});

test("normalizeName: minúsculas, conserva acentos, vacío no se manda", () => {
  assert.equal(normalizeName("  José "), "josé");
  assert.equal(normalizeName("   "), undefined);
});

test("sha256Hex coincide con node:crypto", async () => {
  assert.equal(await sha256Hex("ve"), sha("ve"));
});

test("hashContact omite lo vacío y siempre lleva país", async () => {
  const ud = await hashContact({ email: "A@B.co", phone: "" });
  assert.equal(ud.em, sha("a@b.co"));
  assert.equal(ud.country, sha("ve"));
  assert.equal("ph" in ud, false);
});

test("hashContact: la ciudad va sin espacios", async () => {
  const ud = await hashContact({ city: "San Cristóbal" });
  assert.equal(ud.ct, sha("sancristóbal"));
});
