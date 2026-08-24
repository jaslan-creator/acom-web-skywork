import { useEffect, useRef } from "react";

/**
 * El candado de Cloudflare (Turnstile) del formulario de captación.
 *
 * 🚨 FALLA ABIERTO, y es deliberado. Si el script no carga —un bloqueador, una red corporativa, el
 * CSP mal puesto— este componente no entrega token y **el formulario sigue pudiendo enviar**: quien
 * decide es el servidor. Al revés (bloquear el botón hasta tener token) un problema de la defensa
 * se convertiría en una captación caída, que es justo lo que este módulo existe para evitar.
 *
 * 🚨 El sitekey es PÚBLICO: viaja en el HTML de cualquier página que muestre el widget. Va como
 * constante y no como variable de entorno a propósito — una variable ausente en el build no da
 * ningún error, simplemente no dibuja el candado, y nadie se entera de que la defensa no está.
 * El SECRETO es otra cosa y vive solo en el servidor (`WEB_LEAD_TURNSTILE_SECRET`).
 *
 * Widget «acomve — abrir cuenta», emitido para `acomve.com` y `www.acomve.com`. 🚨 NO es el de
 * Zentral (`zentralapp.ai`, `b2b.acomve.com`): Turnstile valida por dominio, así que el de Zentral
 * no puede emitir un token válido para este sitio.
 */
export const TURNSTILE_SITEKEY = "0x4AAAAAAEaQin0RTAIZKBPh";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}

function api(): TurnstileApi | null {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile ?? null;
}

/**
 * Una sola carga por pestaña aunque se monten dos formularios. Se guarda la promesa, no un
 * booleano: con un booleano, dos montajes casi simultáneos insertan dos veces el `<script>`.
 */
let cargando: Promise<boolean> | null = null;

function cargarScript(): Promise<boolean> {
  if (api()) return Promise.resolve(true);
  if (cargando) return cargando;
  cargando = new Promise<boolean>((resolve) => {
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve(Boolean(api()));
    // No se reintenta: si el script está bloqueado, lo va a estar todas las veces, y reintentar
    // solo retrasa el envío de alguien que ya escribió todo.
    el.onerror = () => resolve(false);
    document.head.appendChild(el);
  });
  return cargando;
}

interface Props {
  /** Recibe el token, o `""` cuando no hay uno utilizable (falló, venció, o nunca cargó). */
  onToken: (token: string) => void;
  className?: string;
}

export function TurnstileWidget({ onToken, className }: Props) {
  const contenedor = useRef<HTMLDivElement | null>(null);
  // El callback se lee de una ref para que un `onToken` nuevo en cada render del padre no
  // desmonte y vuelva a dibujar el widget —que además reinicia el desafío y pierde el token.
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let vivo = true;
    let id: string | null = null;

    cargarScript().then((listo) => {
      if (!vivo || !listo || !contenedor.current) return;
      const t = api();
      if (!t) return;
      id = t.render(contenedor.current, {
        sitekey: TURNSTILE_SITEKEY,
        callback: (token: string) => cb.current(token),
        // 🚨 Los tres estados de fallo LIMPIAN el token en vez de dejar el anterior. Un token
        // vencido se rechaza igual que uno vacío, pero además hace creer que el candado está bien.
        "error-callback": () => cb.current(""),
        "timeout-callback": () => cb.current(""),
        "expired-callback": () => {
          cb.current("");
          // El token dura 5 minutos. Quien llena el formulario despacio lo pierde, así que se
          // vuelve a pedir uno solo en vez de dejarlo trabado.
          if (id) t.reset(id);
        },
      });
    });

    return () => {
      vivo = false;
      const t = api();
      if (id && t) t.remove(id);
    };
  }, []);

  return <div ref={contenedor} className={className} />;
}
