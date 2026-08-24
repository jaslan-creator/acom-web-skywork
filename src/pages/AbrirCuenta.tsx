import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { FileCheck2, PackageCheck, Truck } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { Cobertura } from "@/components/Cobertura";
import { BUSINESS_CONFIG } from "@/lib/index";
import { MEDIA } from "@/assets/media";
import { isCaptureEnabled } from "@/lib/leadApi";

/**
 * «Abrir cuenta» — la puerta que el sitio no tenía.
 *
 * 🚨 EL INTERRUPTOR MANDA, y por eso esta página consulta al servidor antes de dibujar el
 * formulario. Nace apagado (decisión del founder, 2026-08-23: nadie es dueño todavía de contestar
 * los leads que ya llegan), y mientras lo esté se muestran los requisitos y el camino de WhatsApp
 * — que es exactamente como se comporta el sitio hoy. Sin esto, o se publica un formulario que no
 * puede enviar, o encenderlo dejaría de ser un clic y necesitaría un despliegue.
 *
 * 🚨 FALLA CERRADA: si la consulta no responde, se muestra el camino de WhatsApp. Fallar abierta
 * dibujaría un formulario que va a fallar al enviar, y el visitante perdería lo que escribió.
 */

const WHATSAPP = `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`;

/**
 * Los requisitos salen de lo que el sitio YA publica en sus Términos y en «Cómo trabajamos»: no se
 * inventa ninguno. El texto definitivo lo decide el founder — hasta entonces, esto es lo único que
 * se puede afirmar sin contradecir las otras páginas.
 */
const REQUISITOS = [
  {
    icon: FileCheck2,
    title: "Documentación comercial vigente",
    body: "RIF y registro mercantil del negocio. Se piden al abrir la cuenta, no ahora.",
  },
  {
    icon: PackageCheck,
    title: `Compra mínima de $${BUSINESS_CONFIG.MIN_ORDER_USD}`,
    body: "Vendemos exclusivamente al mayor: no hacemos ventas al detal.",
  },
  {
    icon: Truck,
    title: "Un negocio establecido",
    body: "Tiendas, papelerías, distribuidores, cadenas y mayoristas en todo el país.",
  },
];

export default function AbrirCuenta() {
  // `null` = todavía no se sabe. NO es `false`: dibujar el camino de WhatsApp durante el primer
  // render y cambiarlo medio segundo después sería un parpadeo que confunde.
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void isCaptureEnabled(ac.signal).then((v) => setEnabled(v));
    return () => ac.abort();
  }, []);

  return (
    <div>
      <PageHero
        image={MEDIA.hero ?? ""}
        eyebrow="Distribución mayorista"
        title="Abre tu cuenta con Acom"
        subtitle="Déjanos tus datos y un asesor te contacta para darte de alta, asignarte tu lista de precios y evaluar tu línea de crédito."
      />

      <section className="border-b border-border py-14 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                ¿Puedo comprarles?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Es la pregunta que más nos hacen por WhatsApp. Esto es lo que hace falta:
              </p>
              <ul className="mt-6 flex flex-col gap-5">
                {REQUISITOS.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-foreground">{r.title}</div>
                      <p className="text-sm text-muted-foreground">{r.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {enabled === true ? (
                <LeadForm />
              ) : (
                <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-foreground">Hablemos por WhatsApp</h3>
                  <p className="mt-2 text-muted-foreground">
                    Escríbenos con el nombre de tu negocio y tu ciudad, y un asesor te responde en{" "}
                    {BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}.
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
                  {/* En `null` no se anuncia nada: todavía no se sabe si el formulario existe. */}
                  {enabled === false ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                      También puedes escribirnos a {BUSINESS_CONFIG.EMAIL}.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Cobertura className="bg-muted/30" />
    </div>
  );
}
