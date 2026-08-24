import type { LeadIntent } from "./leadApi";

/**
 * Las reglas del formulario de captación, PURAS y fuera de React.
 *
 * 🚨 POR QUÉ VIVEN ACÁ Y NO EN EL COMPONENTE. Este repo compila con `strict: false`
 * (`tsconfig.app.json`), así que un `intent` en `null` pasado donde va un `LeadIntent` **compila
 * limpio**: el build no atrapa el estado «todavía no eligió». Y el formulario corre con
 * `noValidate`, o sea que el navegador tampoco. La única red que queda es un predicado que se
 * pueda leer de un vistazo y que el guard de `scripts/verificar-formulario.mjs` pueda custodiar.
 *
 * 🚨 Y LA REGLA CAMBIA CON LA OPCIÓN, que es lo que hace real la diferencia entre las dos:
 *   · `account` → el negocio es obligatorio (nace una ficha en la app, y una ficha sin nombre de
 *     negocio no se puede fusionar con Odoo después);
 *   · `question` → el mensaje es obligatorio y el negocio no, porque quien pregunta puede no tener
 *     ninguno. El servidor exige `businessName` con `min(1)` y la columna es NOT NULL ⇒ cuando no
 *     hay negocio se manda el nombre de la persona, nunca una cadena vacía.
 */

export interface LeadDraft {
  /** `null` = todavía no eligió. NO se marca ninguna sola: la opción que CREA una ficha jamás
   *  viene marcada, o el que no lee mete un prospecto que nadie pidió. */
  intent: LeadIntent | null;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
}

/** Nombre y apellido unidos, cortado a la cota del servidor (120). */
export function nombreCompleto(d: Pick<LeadDraft, "firstName" | "lastName">): string {
  return [d.firstName.trim(), d.lastName.trim()].filter(Boolean).join(" ").slice(0, 120);
}

/**
 * Qué se guarda como «negocio».
 *
 * 🚨 En una consulta sin negocio va el NOMBRE DE LA PERSONA, no una cadena vacía: el servidor lo
 * exige (`min(1)`) y la columna es NOT NULL, así que vacío = 400 «revisa los datos» sobre un
 * formulario donde todo lo visible está bien. En la bandeja esa tarjeta se titula con su nombre.
 */
export function negocioAEnviar(d: LeadDraft): string {
  const negocio = d.businessName.trim();
  if (negocio) return negocio.slice(0, 160);
  return nombreCompleto(d).slice(0, 160);
}

/**
 * Qué falta para poder enviar — **el motivo, no un booleano**.
 *
 * 🚨 Un botón gris sin explicación deja al visitante trabado: el formulario tiene un solo cartel
 * global y a 390 px el campo que falta puede estar fuera de pantalla. Devuelve `null` cuando se
 * puede enviar. El orden de los chequeos sigue el orden VISUAL de los campos, para que el motivo
 * apunte al primero que falta y no al último.
 */
export function motivoBloqueo(d: LeadDraft): string | null {
  if (!d.intent) return "Elige arriba qué necesitas.";

  const negocio = negocioAEnviar(d);
  // 🚨 `length < 1`, no `<= 1`: el servidor valida `min(1)` sobre el texto ya recortado. Con `> 1`
  // —lo que había— un negocio o un nombre de UNA letra quedaba bloqueado sin ninguna explicación.
  if (negocio.length < 1) {
    return d.intent === "account"
      ? "Falta el nombre del negocio."
      : "Escribe tu nombre o el de tu negocio.";
  }

  if (d.phone.trim() === "" && d.email.trim() === "") {
    return "Deja un teléfono o un correo para poder responderte.";
  }

  if (d.intent === "question" && d.message.trim() === "") {
    return "Escribe tu consulta.";
  }

  return null;
}

/**
 * La llave de idempotencia del envío.
 *
 * 🚨 INCLUYE LA OPCIÓN, y no es cosmético. El servidor deduplica por `(tenantId, submissionKey)`
 * **sin mirar `intent`**. Modo de fallo real en 3G: mandas «cuenta» → la fila y la ficha se
 * escriben → la respuesta se pierde → cambias a «consulta» y reenvías → 200 `deduped`, «Recibimos
 * tus datos», y lo que quedó es un prospecto que nadie pidió. Al revés es peor: nunca hay ficha ni
 * push, y la persona espera un asesor al que no se avisó.
 *
 * NO reabre el doble clic —que es lo que la llave única vino a cerrar—: un doble clic no cambia de
 * opción, así que las dos llamadas siguen compartiendo llave.
 */
export function llaveDeEnvio(base: string, intent: LeadIntent | null): string {
  return intent ? `${base}:${intent}` : base;
}
