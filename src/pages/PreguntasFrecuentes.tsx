import { Link } from "react-router-dom";

import { FAQS } from "@/data/publicContent";
import { ROUTE_PATHS } from "@/lib/index";

export default function PreguntasFrecuentes() {
  return (
    <article className="w-full">
      <header className="border-b border-border bg-secondary/30 py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            Información mayorista
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl md:text-5xl">
            Preguntas frecuentes sobre comprar al mayor
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Respuestas directas sobre pedidos, marcas, catálogos, precios, despachos y apertura de cuenta con ACOM.
          </p>
        </div>
      </header>

      <section className="py-12 sm:py-16" aria-labelledby="faq-list-title">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 id="faq-list-title" className="sr-only">Respuestas comerciales</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-border bg-card p-5 sm:p-6">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-foreground marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <aside className="border-t border-border bg-muted/30 py-12" aria-labelledby="faq-help-title">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 id="faq-help-title" className="text-2xl font-bold text-foreground">¿Tu pregunta no aparece aquí?</h2>
          <p className="mt-3 text-muted-foreground">Nuestro equipo comercial puede orientarte según tu negocio y tu ciudad.</p>
          <Link
            to={ROUTE_PATHS.CONTACTO}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
          >
            Contactar a ACOM
          </Link>
        </div>
      </aside>
    </article>
  );
}
