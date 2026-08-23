import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { coverage } from "@/data/index";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Nationwide coverage, grouped by the 9 real sales regions.
 *
 * 🚨 One component, two placements. This used to be six grey spans at 60% opacity buried at the
 * bottom of /contacto — the LAST block of the LAST page, below the form — which is the single
 * piece of geographic copy on the site and the founder did not know it existed. It now also
 * runs on the Home, where the visitor actually decides. Same component in both, so the two can
 * never say different things.
 */
export function Cobertura({ className }: { className?: string }) {
  return (
    <section className={cn("py-14 sm:py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            Distribución nacional
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">
            Abastecemos negocios en las 9 regiones del país
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Despachamos a toda Venezuela con aliados logísticos de confianza. Estas son algunas de
            las plazas donde ya entregamos.
          </p>
        </div>

        <motion.ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {coverage.map((zone) => (
            <motion.li
              key={zone.region}
              variants={staggerItem}
              className="rounded-xl border border-border bg-card/60 p-4 sm:p-5"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {zone.region}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {zone.cities.join(" · ")}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
