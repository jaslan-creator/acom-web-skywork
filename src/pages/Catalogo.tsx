import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CTAButton } from "@/components/CTAButton";
import { Image } from "@/components/Image";
import { CATALOGS, catalogPageUrl, catalogPath } from "@/lib/index";
import { fadeInUp, springPresets } from "@/lib/motion";

/**
 * Index of every published catalog: one cover per catalog, each linking to its own viewer.
 *
 * Only the covers load here (one ~100 KB page each), never a whole catalog: this is read on
 * Venezuelan mobile data. The covers share one frame ratio with `object-contain` so the
 * landscape Momentop deck sits in the same grid as the portrait ones.
 */
export default function Catalogo() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-b border-border py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl" initial="initial" animate="animate" variants={fadeInUp}>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Catálogos
            </span>
            <h1 className="mb-4 mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Catálogos mayoristas
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {CATALOGS.length} catálogos con códigos, presentaciones y unidades por bulto, sin registro.{" "}
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
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOGS.map((catalog, index) => (
              <li key={catalog.id}>
                <Link
                  to={catalogPath(catalog)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <Image
                    src={catalogPageUrl(catalog, 1)}
                    alt={`Portada del ${catalog.title}`}
                    ratio="aspect-[3/4]"
                    priority={index < 3}
                    wrapperClassName="bg-muted/40"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="flex flex-1 items-center justify-between gap-3 border-t border-border p-5">
                    <div>
                      <h2 className="text-lg font-bold">{catalog.title}</h2>
                      <p className="font-mono text-sm text-muted-foreground">{catalog.pages} páginas</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
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
                ¿Te interesa algún producto de estos catálogos?
              </h2>
              <p className="max-w-2xl text-lg text-primary-foreground/90">
                Escríbenos con los códigos y un asesor te envía precios mayoristas, disponibilidad y
                condiciones de despacho.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <CTAButton
                  href="/abrir-cuenta"
                  className="border-none bg-white text-primary shadow-xl hover:bg-white/90"
                  icon={null}
                >
                  Abrir cuenta
                </CTAButton>
                <CTAButton
                  className="border-2 border-white/60 bg-white/10 text-white hover:bg-white/20"
                  showIcon
                >
                  Pedir precios a un asesor
                </CTAButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
