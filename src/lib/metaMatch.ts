/**
 * Datos de contacto normalizados y cifrados para la Conversions API de Meta.
 *
 * 🚨 SE CIFRA EN EL NAVEGADOR, no en el servidor. Así el email y el teléfono en claro no salen
 * nunca de la página: ni hacia `/api/meta-event` ni hacia Meta. Lo que viaja es un SHA-256 que
 * Meta compara contra el suyo, y que no se puede revertir.
 *
 * 🚨 La normalización ES el emparejamiento. Meta cifra «584141234567»; si nosotros ciframos
 * «0414 123 4567», los dos hashes no se parecen en nada y el evento llega sin persona — falla
 * mudo, solo baja la calidad de coincidencia en Events Manager.
 *
 * Sin alias `@/` a propósito: lo importan `node --test` y la función de Vercel.
 */

export type ContactInput = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
};

export type HashedUserData = {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  country: string;
};

export function normalizeEmail(raw: string): string | undefined {
  const v = raw.trim().toLowerCase();
  return v.includes("@") ? v : undefined;
}

/**
 * Venezuela: 58 + 10 dígitos (código de área de 3 + número de 7). Lo que no cuadra no se manda:
 * un teléfono mal formado cifrado no empareja con nadie y solo ensucia.
 */
export function normalizePhoneVe(raw: string): string | undefined {
  const d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("58")) return d;
  if (d.length === 11 && d.startsWith("0")) return `58${d.slice(1)}`;
  if (d.length === 10) return `58${d}`;
  return undefined;
}

/** Meta acepta UTF-8: los acentos se conservan. */
export function normalizeName(raw: string): string | undefined {
  const v = raw.trim().toLowerCase();
  return v === "" ? undefined : v;
}

function normalizePlace(raw: string): string | undefined {
  return normalizeName(raw)?.replace(/\s+/g, "");
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashContact(input: ContactInput): Promise<HashedUserData> {
  const normalized: Omit<HashedUserData, "country"> = {
    em: input.email ? normalizeEmail(input.email) : undefined,
    ph: input.phone ? normalizePhoneVe(input.phone) : undefined,
    fn: input.firstName ? normalizeName(input.firstName) : undefined,
    ln: input.lastName ? normalizeName(input.lastName) : undefined,
    ct: input.city ? normalizePlace(input.city) : undefined,
    st: input.state ? normalizePlace(input.state) : undefined,
  };

  const out: HashedUserData = { country: await sha256Hex("ve") };
  for (const [key, value] of Object.entries(normalized)) {
    if (value !== undefined) out[key as keyof typeof normalized] = await sha256Hex(value);
  }
  return out;
}
