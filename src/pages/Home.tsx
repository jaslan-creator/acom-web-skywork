import { motion } from "framer-motion";
import {
  DollarSign,
  Briefcase,
  Star,
  UserCheck,
  Truck,
  GraduationCap,
  Palette,
  Home as HomeIcon,
} from "lucide-react";
import { brands, categories, processSteps, benefits } from "../data/index.ts";
import { CTAButton } from "../components/CTAButton.tsx";
import { BrandCard, BenefitCard, ProcessCard, CategoryCard, PROCESS_ICONS } from "../components/Cards.tsx";
import { springPresets, fadeInUp, staggerContainer } from "../lib/motion.ts";
import { MEDIA } from "../assets/media.ts";
import { cn } from "../lib/utils.ts";

const BENEFIT_ICONS = [
  <DollarSign className="w-6 h-6 text-primary" />,
  <Briefcase className="w-6 h-6 text-primary" />,
  <Star className="w-6 h-6 text-primary" />,
  <UserCheck className="w-6 h-6 text-primary" />,
  <Truck className="w-6 h-6 text-primary" />,
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  escolar: <GraduationCap className="h-5 w-5" />,
  oficina: <Briefcase className="h-5 w-5" />,
  manualidades: <Palette className="h-5 w-5" />,
  hogar: <HomeIcon className="h-5 w-5" />,
};

const CATEGORY_IMAGES: Record<string, string | null> = {
  escolar: MEDIA.categoryEscolar,
  oficina: MEDIA.categoryOficina,
  manualidades: MEDIA.categoryManualidades,
  hogar: MEDIA.categoryHogar,
};

export default function Home() {
  const hasHero = Boolean(MEDIA.hero);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section
        className={cn(
          "relative flex items-center overflow-hidden border-b border-border",
          hasHero ? "bg-foreground sm:min-h-[68vh]" : "bg-background"
        )}
      >
        {/* Background layer: hero image with legibility scrim, or on-brand ambient gradient */}
        {hasHero ? (
          <>
            <img
              src={MEDIA.hero ?? undefined}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/92 via-foreground/75 to-foreground/35" />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 h-full w-1/2 -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-1/4 left-0 h-3/4 w-1/3 rounded-full bg-accent/40 blur-3xl" />
          </>
        )}

        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-32">
          <motion.div
            className="max-w-3xl"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1
              className={cn(
                "mb-5 text-3xl font-bold leading-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl",
                hasHero && "text-background"
              )}
            >
              Importamos y distribuimos marcas líderes para abastecer tu negocio en Venezuela
            </h1>
            <p
              className={cn(
                "mb-7 text-base leading-relaxed sm:mb-8 sm:text-lg md:text-xl",
                hasHero ? "text-background/85" : "text-muted-foreground"
              )}
            >
              Productos escolares, de oficina, manualidades y hogar para mayoristas y comercios, desde{" "}
              <span className={cn("font-mono font-semibold", hasHero ? "text-background" : "text-foreground")}>
                $250 por pedido
              </span>
              , con marcas exclusivas y despacho confiable a nivel nacional.
            </p>
            <div className="flex flex-wrap gap-4">
              <CTAButton variant="primary" showIcon>
                Solicitar atención comercial
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 max-w-2xl sm:mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Qué distribuimos
            </span>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">
              Cuatro categorías, una sola logística
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cubrimos el portafolio completo de tu negocio con productos de alta rotación para cada temporada.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                image={CATEGORY_IMAGES[category.id]}
                icon={CATEGORY_ICONS[category.id]}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Marcas Destacadas */}
      <section className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Marcas que impulsan la rotación de tu negocio
              </h2>
              <p className="text-muted-foreground">
                Trabajamos con marcas reconocidas y exclusivas que ya tienen demanda en el mercado venezolano.
              </p>
            </div>
            <CTAButton variant="secondary">
              Solicitar catálogos y precios
            </CTAButton>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Propuesta de Valor */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Un proveedor mayorista en el que puedes confiar
            </h2>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <BenefitCard 
                key={index} 
                title={benefit.title} 
                description={benefit.description} 
                icon={BENEFIT_ICONS[index]}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Proceso */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Así funciona comprar con Acom
            </h2>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {processSteps.map((step, index) => (
              <ProcessCard key={index} step={step} index={index} icon={PROCESS_ICONS[index]} />
            ))}
          </motion.div>

          <div className="text-center">
            <p className="text-lg font-medium italic text-muted-foreground">
              Proceso claro, sin intermediarios ni complicaciones.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-5 sm:mb-6">
                ¿Buscas un proveedor confiable para tu negocio?
              </h2>
              <p className="text-lg sm:text-xl opacity-90 mb-8 sm:mb-10">
                Si tienes una librería, papelería o comercio mayorista, Acom está listo para abastecerte.
              </p>
              <div className="flex justify-center">
                <CTAButton 
                  className="bg-white text-primary hover:bg-white/90 border-none shadow-xl"
                  showIcon
                >
                  Hablar con un asesor comercial
                </CTAButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
