import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { Image } from "@/components/Image";
import { Button } from "@/components/ui/button";
import { CATALOG, catalogPageUrl } from "@/lib/index";
import { fadeInUp, springPresets } from "@/lib/motion";

/**
 * Published catalog viewer.
 *
 * 🚨 Why this page exists: until now there was not a SINGLE product anywhere on the site — no
 * catalog, no PDF, no list, no example. Categories and brands were described in prose, and the
 * portal that holds the real catalog is invite-only. A prospect had to message WhatsApp just to
 * find out whether we sell what they are looking for, and most do not. The catalog was already
 * rendered, uploaded and publicly readable; the only site that did not link it was ours.
 *
 * 🚨 One page at a time, on purpose: the 82 pages are ~5 MB together, and this is read on
 * Venezuelan mobile data. Each page is ~50 KB, and only the next one is prefetched.
 *
 * ⚠️ `CATALOG.PAGES` is hardcoded because the renderer's manifest is never uploaded (see the
 * comment on CATALOG). If a future catalog has fewer pages, the viewer shows a visible
 * "could not load" state instead of a blank frame — which is why <Image> has an onError.
 */
export default function Catalogo() {
  const [page, setPage] = useState(1);
  const [failed, setFailed] = useState(false);

  const goTo = useCallback((next: number) => {
    setPage(Math.min(Math.max(next, 1), CATALOG.PAGES));
    setFailed(false);
  }, []);

  // Prefetch the next page so paging forward feels instant without pulling all 82.
  useEffect(() => {
    if (page >= CATALOG.PAGES) return;
    const preload = new window.Image();
    preload.src = catalogPageUrl(page + 1);
  }, [page]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(page + 1);
      if (event.key === "ArrowLeft") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, goTo]);

  const isFirst = page === 1;
  const isLast = page === CATALOG.PAGES;

  return (
    <div className="flex w-full flex-col">
      <section className="border-b border-border py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl" initial="initial" animate="animate" variants={fadeInUp}>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Catálogo
            </span>
            <h1 className="mb-4 mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {CATALOG.TITLE}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {CATALOG.PAGES} páginas con códigos, presentaciones y unidades por bulto.{" "}
              <span className="font-medium text-foreground">
                Los precios mayoristas te los envía tu asesor
              </span>
              , según el tipo de negocio y el volumen.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Image
                key={page}
                src={catalogPageUrl(page)}
                alt={`${CATALOG.TITLE}, página ${page} de ${CATALOG.PAGES}`}
                ratio="aspect-[1080/1399]"
                priority={page === 1}
                className="object-contain"
                onLoadError={() => setFailed(true)}
                errorFallback={
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">
                      No pudimos cargar la página {page}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Revisa tu conexión y vuelve a intentarlo, o pídele el catálogo a un asesor.
                    </p>
                  </div>
                }
              />
            </div>

            {/*
              Sticky: a page renders ~990 px tall at this width, so a static control bar sits below
              the fold on every screen and paging means scrolling down, clicking, scrolling up.
            */}
            <div className="sticky bottom-4 z-10 mt-5 flex items-center justify-between gap-3 rounded-full border border-border bg-background/90 px-3 py-2 shadow-lg backdrop-blur-sm">
              <Button
                variant="outline"
                className="min-h-11 gap-1.5 rounded-full"
                onClick={() => goTo(page - 1)}
                disabled={isFirst}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <p className="font-mono text-sm font-semibold text-muted-foreground" aria-live="polite">
                {page} <span className="font-normal">de</span> {CATALOG.PAGES}
              </p>

              <Button
                variant="outline"
                className="min-h-11 gap-1.5 rounded-full"
                onClick={() => goTo(page + 1)}
                disabled={isLast}
                aria-label="Página siguiente"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {failed && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                ¿Sigue sin cargar?{" "}
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Volver a la primera página
                </button>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-xl sm:rounded-[2rem] sm:p-10 lg:p-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            viewport={{ once: true }}
          >
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <h2 className="max-w-2xl text-2xl font-bold sm:text-3xl md:text-4xl">
                ¿Te interesa algún producto de este catálogo?
              </h2>
              <p className="max-w-2xl text-lg text-primary-foreground/90">
                Escríbenos con los códigos y un asesor te envía precios mayoristas, disponibilidad y
                condiciones de despacho. También tenemos catálogos de Pelikan, Sanremo y Momentop.
              </p>
              <CTAButton className="border-none bg-white text-primary shadow-xl hover:bg-white/90" showIcon>
                Pedir precios a un asesor
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
