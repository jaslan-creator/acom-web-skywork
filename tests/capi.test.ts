import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCapiPayload, readCookie, validateEvent, type IncomingEvent } from "../api/_lib/capi.ts";

const UUID = "3b241101-e2bb-4255-8caf-4136c566a962";
const HEX = "a".repeat(64);
const SITE = "https://www.acomve.com";

const body = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ eventName: "Lead", eventId: UUID, eventSourceUrl: `${SITE}/marcas`, ...over });

const isRejection = (r: unknown, status: number) =>
  typeof r === "object" && r !== null && (r as { status?: number }).status === status;

test("origen: solo acomve.com y previews de Vercel", () => {
  assert.ok(isRejection(validateEvent(body(), "https://evil.example"), 403));
  assert.ok(isRejection(validateEvent(body(), null), 403));
  assert.equal((validateEvent(body(), SITE) as IncomingEvent).eventName, "Lead");
  assert.equal(
    (validateEvent(body({ eventSourceUrl: "https://acom-web-xyz.vercel.app/" }), "https://acom-web-xyz.vercel.app") as IncomingEvent).eventId,
    UUID,
  );
});

test("cuerpo: tamaño, JSON, evento, id y URL", () => {
  assert.ok(isRejection(validateEvent("x".repeat(4097), SITE), 413));
  assert.ok(isRejection(validateEvent("{roto", SITE), 400));
  assert.ok(isRejection(validateEvent(body({ eventName: "Purchase" }), SITE), 400));
  assert.ok(isRejection(validateEvent(body({ eventId: "123" }), SITE), 400));
  assert.ok(isRejection(validateEvent(body({ eventSourceUrl: "https://evil.example/" }), SITE), 400));
});

test("userData: se descartan claves ajenas y valores que no son hash", () => {
  const ev = validateEvent(body({ userData: { em: HEX, ph: "584141234567", zz: HEX } }), SITE) as IncomingEvent;
  assert.deepEqual(ev.userData, { em: HEX });
});

test("buildCapiPayload arma el evento de servidor", () => {
  const ev = validateEvent(body({ userData: { em: HEX } }), SITE) as IncomingEvent;
  const p = buildCapiPayload(ev, { ip: "1.2.3.4", userAgent: "UA", fbp: "fb.1.x", nowSeconds: 1700000000 });
  const d = p.data[0] as Record<string, any>;
  assert.equal(d.event_name, "Lead");
  assert.equal(d.event_id, UUID);
  assert.equal(d.event_time, 1700000000);
  assert.equal(d.action_source, "website");
  assert.equal(d.event_source_url, `${SITE}/marcas`);
  assert.equal(d.user_data.client_ip_address, "1.2.3.4");
  assert.equal(d.user_data.client_user_agent, "UA");
  assert.equal(d.user_data.fbp, "fb.1.x");
  assert.deepEqual(d.user_data.em, [HEX]);
  assert.equal("fbc" in d.user_data, false);
  assert.equal("test_event_code" in p, false);
});

test("readCookie", () => {
  assert.equal(readCookie("a=1; _fbp=fb.1.2.3; b=2", "_fbp"), "fb.1.2.3");
  assert.equal(readCookie("a=1", "_fbp"), undefined);
  assert.equal(readCookie(null, "_fbp"), undefined);
});
