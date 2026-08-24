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
  CupSoda,
  BookOpen,
  LogIn,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { brands, categories, categoriesProse, processSteps, benefits } from "../data/index.ts";
import type { CategoryId } from "../data/index.ts";
import { CTAButton } from "../components/CTAButton.tsx";
import { Cobertura } from "../components/Cobertura.tsx";
import { BrandCard, BenefitCard, ProcessCard, CategoryCard, PROCESS_ICONS } from "../components/Cards.tsx";
import { springPresets, fadeInUp, staggerContainer } from "../lib/motion.ts";
import { MEDIA } from "../assets/media.ts";
import { BUSINESS_CONFIG, CATALOG, ROUTE_PATHS, catalogPageUrl } from "../lib/index.ts";
import { cn } from "../lib/utils.ts";

/**
 * What the customer portal actually does. The previous copy described self-service e-commerce
 * ("cotiza y compra en línea") for a portal that is invite-only and whose account is created by
 * the customer's sales rep — so a stranger who clicked it downloaded 1.6 MB to be told their
 * email was not enabled. These are the real features.
 */
const PORTAL_FEATURES = [
  {
    title: "Tu catálogo con tus precios",
    description: "No una lista general: la tarifa que se te asignó, con tus ofertas vigentes.",
  },
  {
    title: "Armas la cotización, tu asesor la aprueba",
    description: "La revisa contigo y al aprobarla se convierte en pedido. «Comprar de nuevo» repite tus habituales.",
  },
  {
    title: "Tus facturas y tu estado de cuenta",
    description: "Descargas el PDF, y ves saldo, límite, crédito disponible y próximo vencimiento.",
  },
];

const BENEFIT_ICONS = [
  <DollarSign className="w-6 h-6 text-primary" />,
  <Briefcase className="w-6 h-6 text-primary" />,
  <Star className="w-6 h-6 text-primary" />,
  <UserCheck className="w-6 h-6 text-primary" />,
  <Truck className="w-6 h-6 text-primary" />,
];

/**
 * 🚨 Keyed by `CategoryId`, not by `string`. As a Record<string, …> a missing key was NOT a type
 * error and the lookup returned a non-optional type, so adding a category silently rendered an
 * empty white badge and a gradient card at runtime. With the union closed, adding a category
 * without its icon stops compiling — which is the only reason the typecheck gate is worth having.
 */
const CATEGORY_ICONS: Record<CategoryId, React.ReactNode> = {
  escolar: <GraduationCap className="h-5 w-5" />,
  oficina: <Briefcase className="h-5 w-5" />,
  manualidades: <Palette className="h-5 w-5" />,
  hogar: <HomeIcon className="h-5 w-5" />,
  "termos-cavas": <CupSoda className="h-5 w-5" />,
};

const CATEGORY_IMAGES: Record<CategoryId, string | null> = {
  escolar: MEDIA.categoryEscolar,
  oficina: MEDIA.categoryOficina,
  manualidades: MEDIA.categoryManualidades,
  hogar: MEDIA.categoryHogar,
  "termos-cavas": MEDIA.categoryTermosCavas,
};

export default function Home() {
  const hasHero = Boolean(MEDIA.hero);
  const portalUrl = BUSINESS_CONFIG.PORTAL_URL;

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
              Productos {categoriesProse()} para mayoristas y comercios, desde{" "}
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
              {categories.length} categorías, una sola logística
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cubrimos el portafolio completo de tu negocio con productos de alta rotación para cada temporada.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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

      {/*
        Catálogo. Hasta hoy el sitio no mostraba NI UN producto: ni catálogo, ni PDF, ni una lista,
        ni un ejemplo. El catálogo ya estaba renderizado y es público; el único sitio que no lo
        enlazaba era el nuestro.
      */}
      <section className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            viewport={{ once: true }}
          >
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Qué vendemos, en concreto
              </span>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">
                Mira el catálogo antes de escribirnos
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {CATALOG.PAGES} páginas de {brands[0].name} con códigos, presentaciones y unidades por
                bulto. Sin registro y sin dejar tus datos.{" "}
                <span className="font-medium text-foreground">Los precios te los envía tu asesor</span>,
                según tu tipo de negocio.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={ROUTE_PATHS.CATALOGO}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                >
                  <BookOpen className="h-5 w-5" />
                  Ver el catálogo
                </Link>
                <Link
                  to={ROUTE_PATHS.MARCAS}
                  className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Ver todas las marcas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <Link
              to={ROUTE_PATHS.CATALOGO}
              className="group mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-border shadow-sm transition-shadow hover:shadow-md"
              aria-hidden="true"
              tabIndex={-1}
            >
              <img
                src={catalogPageUrl(1)}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Portal de cliente — por invitación, no autoservicio */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            viewport={{ once: true }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                  Ya eres cliente
                </span>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">
                  Tu cuenta ACOM, en línea
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Si ya compras con nosotros, tu asesor puede habilitarte el portal: entras con Google
                  o con un código de 6 dígitos que te llega al correo, y también se instala como app
                  en el teléfono.{" "}
                  <span className="font-medium text-foreground">Es por invitación</span>, no se abre
                  cuenta sola.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <CTAButton showIcon>Pedir acceso a mi asesor</CTAButton>
                  <motion.a
                    href={portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springPresets.snappy}
                    className="inline-flex min-h-11 items-center justify-center gap-2 text-base font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    <LogIn className="h-5 w-5" />
                    Ya tengo cuenta · Entrar
                  </motion.a>
                </div>
              </div>

              <ul className="grid gap-4">
                {PORTAL_FEATURES.map((feature) => (
                  <li
                    key={feature.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold leading-none text-foreground">{feature.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
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
            <Link to={ROUTE_PATHS.FAQ} className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary hover:underline">
              Consultar preguntas frecuentes sobre compras mayoristas
            </Link>
          </div>
        </div>
      </section>

      {/*
        Cobertura. Vivía enterrada al pie de /contacto, la última sección de la última página,
        debajo del formulario — el único texto geográfico del sitio, donde nadie llega.
      */}
      <Cobertura className="bg-muted/30" />

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
              {/* 🚨 DOS caminos, no uno. Hasta hoy TODAS las salidas de esta página iban a
                  WhatsApp: a «Abrir cuenta» solo se llegaba por el menú. Va uno por página y en el
                  bloque de cierre — duplicarlo en los 8 CTA que ya tiene convertía la página en
                  una pared de botones. */}
              <div className="flex flex-wrap justify-center gap-3">
                <CTAButton
                  href="/abrir-cuenta"
                  className="bg-white text-primary hover:bg-white/90 border-none shadow-xl"
                  icon={null}
                >
                  Abrir cuenta
                </CTAButton>
                <CTAButton 
                  className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/60"
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
