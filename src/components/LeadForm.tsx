import { useMemo, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { CheckCircle2 } from "lucide-react";

import { BUSINESS_CONFIG } from "@/lib/index";
import { cn } from "@/lib/utils";
import { trackLeadFormSubmit } from "@/lib/analytics";
import {
  newSubmissionKey,
  submitLead,
  type LeadError,
  type LeadIntent,
} from "@/lib/leadApi";
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
 * con Odoo de los dos, en silencio y para siempre.
 */

const WHATSAPP = `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`;

const MENSAJES_ERROR: Record<LeadError, string> = {
  // Cada uno dice algo DISTINTO: un formulario que solo dice «error» manda a la persona a la
  // competencia. Y en los tres queda el botón de WhatsApp a la vista.
  rate_limited: "Recibimos varios intentos seguidos. Espera un minuto y vuelve a enviar.",
  invalid: "Revisa los datos: falta algo o hay un campo mal escrito.",
  offline: "No pudimos conectar. Revisa tu conexión e intenta de nuevo.",
  unknown: "No pudimos enviar tu solicitud. Intenta de nuevo en un momento.",
};

const label = "block text-sm font-medium text-foreground mb-1.5";
const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function LeadForm({ className }: { className?: string }) {
  // Una por montaje del formulario. Ver el encabezado.
  const submissionKey = useRef(newSubmissionKey()).current;

  const [intent, setIntent] = useState<LeadIntent>("account");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<LeadError | null>(null);

  // La lista de ciudades depende del estado elegido: «San Carlos» existe en Cojedes Y en Zulia, y
  // «Caracas» en Distrito Capital Y en Miranda. Sin el estado, la ciudad es ambigua.
  const ciudades = useMemo(() => (state ? citiesForState(state) : []), [state]);

  const puedeEnviar = businessName.trim().length > 1 && (phone.trim() !== "" || email.trim() !== "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || sent) return;
    setSending(true);
    setError(null);

    const res = await submitLead({
      submissionKey,
      intent,
      businessName: businessName.trim(),
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      state: state || undefined,
      city: city || undefined,
      // El id solo existe si eligió del catálogo. Sin él, el lead queda sin zona — que es un
      // residuo declarado, no una zona inventada.
      geoCityId: state && city ? veCityId(state as VeState, city) : null,
      message: message.trim() || undefined,
      hp_website: honeypot || undefined,
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
      {/* La pregunta que rutea. Va primero: decide si esto crea una cuenta o solo una consulta. */}
      <fieldset className="mb-5">
        <legend className={label}>¿Qué necesitas?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { id: "account", t: "Abrir cuenta y comprar al mayor" },
              { id: "question", t: "Tengo otra consulta" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setIntent(o.id)}
              aria-pressed={intent === o.id}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                intent === o.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {o.t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="lf-business">
            Nombre del negocio *
          </label>
          <input
            id="lf-business"
            className={input}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            maxLength={160}
            required
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
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            maxLength={120}
            autoComplete="name"
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

        <div className="sm:col-span-2">
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
            {intent === "account" ? "¿Qué productos te interesan?" : "Tu consulta"}
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

      {error ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {MENSAJES_ERROR[error]}{" "}
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="underline">
            O escríbenos por WhatsApp
          </a>
          .
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={sending || !puedeEnviar}
          className="inline-flex items-center rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {sending ? "Enviando…" : intent === "account" ? "Solicitar mi cuenta" : "Enviar consulta"}
        </button>
        <span className="text-xs text-muted-foreground">
          Te respondemos en {BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}.
        </span>
      </div>
    </form>
  );
}
