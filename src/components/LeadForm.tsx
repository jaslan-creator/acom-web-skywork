import { useMemo, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { Check, CheckCircle2 } from "lucide-react";

import { BUSINESS_CONFIG } from "@/lib/index";
import { cn } from "@/lib/utils";
import { trackLeadFormSubmit } from "@/lib/analytics";
import {
  newSubmissionKey,
  submitLead,
  type LeadError,
  type LeadIntent,
} from "@/lib/leadApi";
import { llaveDeEnvio, motivoBloqueo, negocioAEnviar, nombreCompleto } from "@/lib/leadForm";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { VE_STATES, citiesForState, veCityId, type VeState } from "@/data/veGeo";

/**
 * El formulario público de captación (fase 2).
 *
 * 🚨 UNA SOLA PUERTA con una pregunta que rutea, no dos formularios. Decisión del founder
 * (2026-08-23): «abrir cuenta y comprar al mayor» crea el prospecto dentro de la app; «tengo otra
 * consulta» solo avisa a la oficina y no toca la app. Dos formularios separados NO filtran basura
 * —un bot llena el que tenga delante— y parten el embudo en dos lugares que hay que mirar.
 *
 * 🚨 NO se pide el RIF, a propósito: un RIF equivocado ENVENENA la fusión con Odoo, que se hace
 * por RIF. Lo pide la oficina al contactar, cargándolo en la solicitud de crédito.
 *
 * 🚨 La llave de idempotencia se acuña UNA VEZ, al montar. Si se generara en cada envío, un doble
 * clic crearía dos fichas del mismo negocio — y dos prospectos con el mismo RIF apagan la fusión
 * con Odoo de los dos, en silencio y para siempre. **Pero lleva la opción pegada** (`llaveDeEnvio`):
 * el servidor deduplica sin mirar `intent`, así que sin eso cambiar de opción y reenviar devuelve
 * el envío anterior — ver el porqué en `lib/leadForm.ts`.
 *
 * 🚨 NINGUNA OPCIÓN VIENE MARCADA en `/abrir-cuenta` (founder, 2026-08-24). Eran dos botones casi
 * iguales con «abrir cuenta» marcada sola, y quien no lee escribe en ésa: elegir mal por inercia
 * le mete a la vendedora un prospecto que nadie pidió. La regla que lo gobierna, y que es lo que
 * salva a `defaultIntent` de ser configurabilidad suelta: **la opción que CREA una ficha nunca
 * viene marcada; la que no crea nada puede venir marcada en la página que la promete** — por eso
 * `/contacto`, cuya promesa impresa es «déjanos tus datos», pasa `"question"`.
 */

const WHATSAPP = `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`;

const MENSAJES_ERROR: Record<LeadError, string> = {
  // Cada uno dice algo DISTINTO: un formulario que solo dice «error» manda a la persona a la
  // competencia. Y en los tres queda el botón de WhatsApp a la vista.
  rate_limited: "Recibimos varios intentos seguidos. Espera un minuto y vuelve a enviar.",
  invalid: "Revisa los datos: falta algo o hay un campo mal escrito.",
  // 🚨 Dice qué hacer, no solo qué pasó: quien tiene el candado bloqueado no puede arreglar nada
  // dentro del formulario, así que la salida es recargar o el WhatsApp que ya está al lado.
  verification:
    "No pudimos comprobar que no eres un robot. Recarga la página e intenta de nuevo.",
  offline: "No pudimos conectar. Revisa tu conexión e intenta de nuevo.",
  unknown: "No pudimos enviar tu solicitud. Intenta de nuevo en un momento.",
};

/**
 * 🚨 Cada opción dice PARA QUIÉN ES, no solo qué hace. Es lo único que separa a un mayorista de
 * alguien con una duda suelta antes de que escriba, y la de la izquierda —la que crea una ficha en
 * la app— NO viene marcada.
 */
const OPCIONES = [
  {
    id: "account",
    titulo: "Abrir cuenta y comprar al mayor",
    paraQuien: "Para librerías, papelerías y comercios que revenden.",
  },
  {
    id: "question",
    titulo: "Tengo otra consulta",
    paraQuien: "Para cualquier otra pregunta. No abre cuenta.",
  },
] as const;

const label = "block text-sm font-medium text-foreground mb-1.5";
const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function LeadForm({
  className,
  defaultIntent,
}: {
  className?: string;
  /** Solo `"question"` es un valor legítimo acá. Ver el encabezado. */
  defaultIntent?: LeadIntent;
}) {
  // Una por montaje del formulario. Ver el encabezado.
  const submissionKeyBase = useRef(newSubmissionKey()).current;

  const [intent, setIntent] = useState<LeadIntent | null>(defaultIntent ?? null);
  const [businessName, setBusinessName] = useState("");
  // 🚨 Nombre y apellido POR SEPARADO, no un solo «Tu nombre» (founder, 2026-08-24). Con un campo
  // único la gente escribe el nombre de pila y nada más —las dos pruebas reales entraron como
  // «melisa» y «andres»—, y al cliente hay que preguntarle por alguien con apellido. Se guardan
  // unidos porque el contacto es UN nombre, acá y en Odoo.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  // Vacío mientras el candado no haya resuelto —o si nunca cargó—. NO bloquea el envío: el widget
  // falla abierto a propósito y quien decide es el servidor.
  const [turnstileToken, setTurnstileToken] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<LeadError | null>(null);

  // La lista de ciudades depende del estado elegido: «San Carlos» existe en Cojedes Y en Zulia, y
  // «Caracas» en Distrito Capital Y en Miranda. Sin el estado, la ciudad es ambigua.
  const ciudades = useMemo(() => (state ? citiesForState(state) : []), [state]);

  const borrador = { intent, businessName, firstName, lastName, phone, email, message };
  const falta = motivoBloqueo(borrador);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || sent) return;
    // 🚨 EL GUARD VA ACÁ, NO EN EL `disabled`. Enter en cualquier input dispara el submit aunque el
    // botón esté gris, y con `strict: false` un `intent` en null viaja compilando limpio: el POST
    // llega con `intent: null`, el `z.enum` del servidor lo rechaza y el visitante lee «revisa los
    // datos» sobre un formulario donde todo lo visible está bien.
    if (!intent) return;
    // Y la misma regla que pinta el motivo bajo el botón corta acá: si no, Enter saltea las tres
    // condiciones nuevas y el 400 vuelve a ser genérico.
    if (falta) return;
    setSending(true);
    setError(null);

    const res = await submitLead({
      submissionKey: llaveDeEnvio(submissionKeyBase, intent),
      intent,
      // En una consulta sin negocio va el nombre de la persona: el servidor lo exige y la columna
      // es NOT NULL. Ver `negocioAEnviar`.
      businessName: negocioAEnviar(borrador),
      // Cortado a la cota del servidor: dos nombres de 60 la pasarían y el envío volvería como
      // «revisa los datos», que no dice nada de dónde está el problema.
      contactName: nombreCompleto(borrador) || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      state: state || undefined,
      city: city || undefined,
      // El id solo existe si eligió del catálogo. Sin él, el lead queda sin zona — que es un
      // residuo declarado, no una zona inventada.
      geoCityId: state && city ? veCityId(state as VeState, city) : null,
      message: message.trim() || undefined,
      hp_website: honeypot || undefined,
      turnstileToken: turnstileToken || undefined,
    });

    setSending(false);
    // El fallo se maneja PRIMERO y explícito: sin esta rama un error se leería como «no pasó
    // nada» y la persona reenviaría — que es como se fabrican fichas duplicadas.
    if (!res.ok) {
      setError(res.error ?? "unknown");
      return;
    }
    trackLeadFormSubmit(intent);
    setSent(true);
  }

  if (sent) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-background p-6 text-center sm:p-8",
          className,
        )}
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h3 className="mt-3 text-xl font-bold text-foreground">Recibimos tus datos</h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Te contactamos dentro de {BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}. Si prefieres no
          esperar, escríbenos ahora por WhatsApp.
        </p>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/90"
        >
          <SiWhatsapp className="h-5 w-5" aria-hidden="true" />
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-2xl border border-border bg-background p-5 sm:p-6", className)}
      noValidate
    >
      {/* La pregunta que rutea. Va primero: decide si esto crea una cuenta o solo una consulta.
          🚨 Cada opción dice PARA QUIÉN ES, y el estado elegido es un fondo lleno con check, no un
          borde fino: eran dos botones casi iguales y el que no lee escribía en el que venía
          marcado — que además es el que crea la ficha. */}
      <fieldset className="mb-5">
        <legend className={label}>¿Qué necesitas?</legend>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="¿Qué necesitas?">
          {OPCIONES.map((o) => {
            const elegida = intent === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={elegida}
                onClick={() => setIntent(o.id)}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-left transition-colors",
                  elegida
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    elegida ? "border-primary-foreground bg-primary-foreground" : "border-border",
                  )}
                  aria-hidden="true"
                >
                  {elegida ? <Check className="h-3 w-3 text-primary" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{o.titulo}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs",
                      elegida ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {o.paraQuien}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="lf-business">
            {/* En una consulta el negocio deja de ser obligatorio: quien pregunta puede no tener
                ninguno. Sin marcar, se pide igual — hay que elegir antes. */}
            {intent === "question" ? "Nombre del negocio (si tienes)" : "Nombre del negocio *"}
          </label>
          <input
            id="lf-business"
            className={input}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            maxLength={160}
            autoComplete="organization"
          />
        </div>

        <div>
          <label className={label} htmlFor="lf-contact">
            Tu nombre
          </label>
          <input
            id="lf-contact"
            className={input}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={60}
            autoComplete="given-name"
          />
        </div>

        <div>
          <label className={label} htmlFor="lf-lastname">
            Tu apellido
          </label>
          <input
            id="lf-lastname"
            className={input}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={60}
            autoComplete="family-name"
          />
        </div>

        <div>
          <label className={label} htmlFor="lf-phone">
            Teléfono / WhatsApp
          </label>
          <input
            id="lf-phone"
            className={input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
            inputMode="tel"
            autoComplete="tel"
            placeholder="0414 123 4567"
          />
        </div>

        <div>
          <label className={label} htmlFor="lf-email">
            Correo
          </label>
          <input
            id="lf-email"
            className={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            autoComplete="email"
          />
        </div>

        <div>
          <label className={label} htmlFor="lf-state">
            Estado
          </label>
          <select
            id="lf-state"
            className={input}
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              // La ciudad elegida deja de ser válida al cambiar de estado.
              setCity("");
            }}
          >
            <option value="">— Elegir —</option>
            {VE_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="lf-city">
            Ciudad
          </label>
          <select
            id="lf-city"
            className={input}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!state}
          >
            <option value="">{state ? "— Elegir —" : "Elige el estado primero"}</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="lf-message">
            {/* 🚨 Los TRES lugares que preguntaban `intent === "account" ? A : B` ahora contemplan
                el estado «todavía no eligió»: con `null` los tres caían a la rama «consulta» sin
                fallar, o sea que el formulario afirmaba una intención que nadie eligió. */}
            {intent === "account"
              ? "¿Qué productos te interesan?"
              : intent === "question"
                ? "Tu consulta *"
                : "Cuéntanos qué necesitas"}
          </label>
          <textarea
            id="lf-message"
            className={cn(input, "min-h-[96px] resize-y")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
          />
        </div>
      </div>

      {/* Campo trampa: invisible para un humano, irresistible para un bot. `tabIndex={-1}` y
          `aria-hidden` para que un lector de pantalla tampoco se lo ofrezca a nadie. */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="lf-website">No llenar</label>
        <input
          id="lf-website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* El candado. Si no carga, acá no se dibuja nada y el formulario sigue enviando. */}
      <TurnstileWidget onToken={setTurnstileToken} className="mt-4" />

      {error ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {MENSAJES_ERROR[error]}{" "}
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="underline">
            O escríbenos por WhatsApp
          </a>
          .
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={sending || Boolean(falta)}
            className="inline-flex items-center rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {sending
              ? "Enviando…"
              : intent === "account"
                ? "Solicitar mi cuenta"
                : intent === "question"
                  ? "Enviar consulta"
                  : "Enviar"}
          </button>
          <span className="text-xs text-muted-foreground">
            Te respondemos en {BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}.
          </span>
        </div>
        {/* 🚨 El botón gris DICE qué falta. El formulario corre con `noValidate` y un solo cartel
            global; a 390 px el campo que falta puede estar fuera de pantalla, así que un botón
            apagado sin motivo deja al visitante trabado sin nada que leer. */}
        {falta && !sending ? (
          <p className="text-xs text-muted-foreground" role="status">
            {falta}
          </p>
        ) : null}
      </div>
    </form>
  );
}
