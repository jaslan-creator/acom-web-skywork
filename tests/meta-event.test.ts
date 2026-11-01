import { test } from "node:test";
import assert from "node:assert/strict";

import { handle } from "../api/meta-event.ts";

const SITE = "https://www.acomve.com";
const BODY = JSON.stringify({
  eventName: "Lead",
  eventId: "3b241101-e2bb-4255-8caf-4136c566a962",
  eventSourceUrl: `${SITE}/`,
});

function req(origin: string, body = BODY) {
  return new Request(`${SITE}/api/meta-event`, {
    method: "POST",
    body,
    headers: {
      origin,
      "content-type": "text/plain",
      "x-forwarded-for": "1.2.3.4, 10.0.0.1",
      "user-agent": "UA",
      cookie: "_fbp=fb.1.2.3; otra=1",
    },
  });
}

function fakeSend(result = { ok: true, status: 200 }) {
  const calls: { payload: any; token: string }[] = [];
  const send = async (payload: object, token: string) => {
    calls.push({ payload, token });
    return result;
  };
  return { calls, send };
}

test("origen ajeno: 403 y no sale nada a Meta", async () => {
  const { calls, send } = fakeSend();
  const res = await handle(req("https://evil.example"), { token: "T" }, send);
  assert.equal(res.status, 403);
  assert.equal(calls.length, 0);
});

test("evento válido: 204 y se reenvía con IP, user agent y _fbp", async () => {
  const { calls, send } = fakeSend();
  const res = await handle(req(SITE), { token: "T" }, send);
  assert.equal(res.status, 204);
  assert.equal(calls.length, 1);
  const ud = calls[0].payload.data[0].user_data;
  assert.equal(ud.client_ip_address, "1.2.3.4");
  assert.equal(ud.client_user_agent, "UA");
  assert.equal(ud.fbp, "fb.1.2.3");
  assert.equal(calls[0].token, "T");
});

test("sin token: 204 al visitante y no se intenta enviar", async () => {
  const { calls, send } = fakeSend();
  const res = await handle(req(SITE), {}, send);
  assert.equal(res.status, 204);
  assert.equal(calls.length, 0);
});

test("Meta caído: el visitante igual recibe 204", async () => {
  const { send } = fakeSend({ ok: false, status: 0 });
  const res = await handle(req(SITE), { token: "T" }, send);
  assert.equal(res.status, 204);
});

test("con código de prueba, el payload lo lleva", async () => {
  const { calls, send } = fakeSend();
  await handle(req(SITE), { token: "T", testEventCode: "TEST123" }, send);
  assert.equal(calls[0].payload.test_event_code, "TEST123");
});

test("método distinto de POST: 405", async () => {
  const { send } = fakeSend();
  const res = await handle(new Request(`${SITE}/api/meta-event`), { token: "T" }, send);
  assert.equal(res.status, 405);
});
