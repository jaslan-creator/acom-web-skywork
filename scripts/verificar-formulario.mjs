#!/usr/bin/env node
/**
 * Guard del formulario de captación — sobre el CÓDIGO FUENTE, y por una razón.
 *
 * 🚨 ESTE REPO COMPILA CON `strict: false` (`tsconfig.app.json`), así que `npm run build` NO
 * atrapa nada de lo que hay acá abajo: pasar un `intent` en `null` donde va un `LeadIntent`
 * compila limpio. Y el formulario corre con `noValidate`, o sea que el navegador tampoco valida.
 * Los tres invariantes que este guard custodia fallan MUDOS: el visitante ve «revisa los datos»
 * sobre un formulario donde todo lo visible está bien, o —peor— recibe «Recibimos tus datos» por
 * un envío que nunca se escribió.
 *
 * Corre dentro de `npm run build`, que es lo que ejecuta Vercel: un guard que hay que acordarse de
 * correr es un guard que ya falló.
 */
import { readFileSync } from "node:fs";

const FORM = readFileSync("src/components/LeadForm.tsx", "utf8");
const REGLAS = readFileSync("src/lib/leadForm.ts", "utf8");
const CONTACTO = readFileSync("src/pages/Contacto.tsx", "utf8");
const CTA = readFileSync("src/components/CTAButton.tsx", "utf8");

const fallos = [];
function exigir(cond, mensaje) {
  if (!cond) fallos.push(mensaje);
}

/**
 * 🚨 LAS REGLAS SE EJERCEN DE VERDAD, no se buscan en el texto. `src/lib/leadForm.ts` no importa
 * nada más que un tipo, así que Node lo carga tal cual (le quita los tipos solo) y acá se le
 * pueden pasar casos. Un guard que solo mira literales certifica la forma y no el comportamiento —
 * y estos tres casos son de comportamiento: en los tres el formulario ENVÍA algo equivocado.
 */
const { motivoBloqueo, negocioAEnviar, llaveDeEnvio } = await import("../src/lib/leadForm.ts");

const BASE = {
  intent: null,
  businessName: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  message: "",
};
const con = (extra) => ({ ...BASE, ...extra });

// Abrir cuenta SIN nombre de negocio no se puede enviar — aunque la persona haya puesto su nombre.
// La ficha nace en la app con ese texto como razón social, y el nombre de una persona ahí es una
// ficha que después nadie reconoce.
exigir(
  motivoBloqueo(con({ intent: "account", firstName: "Juan", phone: "04141234567" })) !== null,
  "abrir cuenta sin nombre de negocio tiene que quedar bloqueado, aunque haya nombre de persona",
);
exigir(
  negocioAEnviar(con({ intent: "account", firstName: "Juan" })) === "",
  "el respaldo al nombre de la persona es SOLO para una consulta, nunca para abrir cuenta",
);
// Una consulta sí puede no tener negocio: se manda el nombre de la persona, porque el servidor lo
// exige y la columna es NOT NULL.
exigir(
  negocioAEnviar(con({ intent: "question", firstName: "Ana", lastName: "Pérez" })) === "Ana Pérez",
  "una consulta sin negocio tiene que viajar con el nombre de la persona",
);
exigir(
  motivoBloqueo(con({ intent: "question", firstName: "Ana", phone: "04141234567" })) !== null,
  "una consulta sin texto no se puede enviar: deja una tarjeta sin nada que contestar",
);
exigir(
  motivoBloqueo(
    con({ intent: "question", firstName: "Ana", phone: "04141234567", message: "hola" }),
  ) === null,
  "una consulta completa tiene que poder enviarse",
);
// Un negocio de UNA letra pasa: el servidor valida `min(1)`, y el cliente exigía `> 1`.
exigir(
  motivoBloqueo(con({ intent: "account", businessName: "A", email: "a@b.com" })) === null,
  "un nombre de una sola letra no puede quedar bloqueado sin explicación (el servidor lo acepta)",
);
// Sin forma de contestarle, no se envía.
exigir(
  motivoBloqueo(con({ intent: "account", businessName: "Papelería X" })) !== null,
  "sin teléfono ni correo no se puede enviar",
);
// Y la llave lleva la opción pegada.
exigir(
  llaveDeEnvio("k1", "account") !== llaveDeEnvio("k1", "question"),
  "la llave de idempotencia tiene que cambiar con la opción",
);

// ── 1. El guard vive en la TRANSACCIÓN, no en el `disabled` ────────────────────────────────────
// Enter en cualquier input dispara el submit aunque el botón esté gris. Sin esta línea el POST
// sale con `intent: null`, el `z.enum` del servidor lo rechaza con un 400 y el visitante lee
// «revisa los datos» sobre un formulario que se ve correcto.
{
  const i = FORM.indexOf("async function handleSubmit");
  const guardIntent = FORM.indexOf("if (!intent) return;", i);
  const guardFalta = FORM.indexOf("if (falta) return;", i);
  const envio = FORM.indexOf("await submitLead(", i);
  exigir(i > -1, "no se encontró handleSubmit en LeadForm.tsx");
  exigir(
    guardIntent > -1 && guardIntent < envio,
    "handleSubmit debe cortar con `if (!intent) return;` ANTES de enviar",
  );
  exigir(
    guardFalta > -1 && guardFalta < envio,
    "handleSubmit debe cortar con `if (falta) return;` ANTES de enviar (Enter saltea el botón gris)",
  );
}

// ── 2. Nada viene marcado por defecto en el formulario que crea la ficha ───────────────────────
// La opción que CREA una ficha nunca viene marcada; la que no crea nada puede venir marcada en la
// página que la promete. `/contacto` es la única que puede, y solo con "question".
exigir(
  /useState<LeadIntent \| null>\(defaultIntent \?\? null\)/.test(FORM),
  "`intent` debe arrancar en null (o en el `defaultIntent` que pase la página)",
);
{
  const usos = [...CONTACTO.matchAll(/defaultIntent="([^"]+)"/g)].map((m) => m[1]);
  exigir(
    usos.length === 1 && usos[0] === "question",
    'Contacto.tsx solo puede pasar defaultIntent="question": la opción que crea ficha jamás viene marcada',
  );
}
exigir(
  !/defaultIntent="account"/.test(FORM + CONTACTO),
  'nadie puede pre-marcar "account": es la opción que crea un prospecto en la app',
);

// ── 3. La llave de idempotencia incluye la opción ──────────────────────────────────────────────
// El servidor deduplica por (tenantId, submissionKey) SIN mirar `intent`: sin esto, mandar
// «cuenta», perder la respuesta y reenviar como «consulta» devuelve 200 `deduped` y deja un
// prospecto que nadie pidió — o al revés, ninguna ficha y nadie avisado.
exigir(
  /submissionKey: llaveDeEnvio\(/.test(FORM),
  "el envío debe usar `llaveDeEnvio(base, intent)`, no la llave pelada",
);
exigir(
  /return intent \? `\$\{base\}:\$\{intent\}` : base;/.test(REGLAS),
  "`llaveDeEnvio` debe pegarle la opción a la llave",
);

// ── 4. El botón apagado dice qué falta ─────────────────────────────────────────────────────────
exigir(
  /\{falta && !sending \? \(/.test(FORM),
  "el motivo por el que el botón está gris tiene que dibujarse: sin eso el visitante queda trabado",
);
// Y el motivo tiene que ser un texto, no un booleano.
exigir(
  /export function motivoBloqueo\(d: LeadDraft\): string \| null/.test(REGLAS),
  "`motivoBloqueo` debe devolver el MOTIVO (string|null), no un booleano",
);

// ── 5. Un botón que no abre WhatsApp no lleva el logo de WhatsApp ──────────────────────────────
// `showIcon` no tenía un estado «sin icono»: false pintaba un globo de mensaje. Un «Abrir cuenta»
// con el logo verde al lado del botón que sí abre WhatsApp es la peor confusión posible.
exigir(
  /const iconoDeclarado = icon !== undefined;/.test(CTA),
  "CTAButton debe soportar `icon={null}` (sin icono), no solo elegir entre dos iconos",
);
// Todo CTA interno debe declarar su icono explícitamente, o hereda el logo de WhatsApp.
for (const archivo of [
  "src/pages/Home.tsx",
  "src/pages/SobreAcom.tsx",
  "src/pages/ComoTrabajamos.tsx",
  "src/pages/Catalogo.tsx",
]) {
  const src = readFileSync(archivo, "utf8");
  for (const m of src.matchAll(/<CTAButton\b[^>]*href="\/[^"]*"[^>]*>/g)) {
    // Basta con que NO herede el logo verde: `icon={...}` (incluido null) o `showIcon={false}`.
    exigir(
      /icon=\{/.test(m[0]) || /showIcon=\{false\}/.test(m[0]),
      `${archivo}: un CTAButton con href interno no puede salir con el logo de WhatsApp — declara \`icon\` o \`showIcon={false}\``,
    );
  }
  exigir(
    src.includes('href="/abrir-cuenta"'),
    `${archivo}: falta el camino a /abrir-cuenta — hasta el 2026-08-24 el único enlace vivo era el ítem del menú`,
  );
}

// ── 6. El envoltorio del enlace interno es inline ──────────────────────────────────────────────
exigir(
  /<motion\.div\s+className="inline-flex"/.test(CTA),
  "el envoltorio del enlace interno va `inline-flex`: como bloque se estira o se apila",
);

if (fallos.length > 0) {
  console.error("✗ guard del formulario de captación:");
  for (const f of fallos) console.error("  ·", f);
  process.exit(1);
}
console.log(`✓ formulario de captación: ${6} invariantes en verde`);
