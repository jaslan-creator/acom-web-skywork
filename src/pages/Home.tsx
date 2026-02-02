import { motion } from "framer-motion";
import { 
  DollarSign, 
  Briefcase, 
  Star, 
  UserCheck, 
  Truck 
} from "lucide-react";
import { brands, processSteps, benefits } from "../data/index.ts";
import { CTAButton } from "../components/CTAButton.tsx";
import { BrandCard, BenefitCard, ProcessCard } from "../components/Cards.tsx";
import { springPresets, fadeInUp, staggerContainer } from "../lib/motion.ts";

const BENEFIT_ICONS = [
  <DollarSign className="w-6 h-6 text-primary" />,
  <Briefcase className="w-6 h-6 text-primary" />,
  <Star className="w-6 h-6 text-primary" />,
  <UserCheck className="w-6 h-6 text-primary" />,
  <Truck className="w-6 h-6 text-primary" />,
];

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Importamos y distribuimos marcas líderes para librerías y papelerías en Venezuela
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Abastece tu negocio con productos escolares, de oficina y hogar, desde <span className="font-mono font-semibold text-foreground">$250 por pedido</span>, con marcas exclusivas y despacho confiable a nivel nacional.
            </p>
            <div className="flex flex-wrap gap-4">
              <CTAButton variant="primary" showIcon>
                Solicitar atención comercial
              </CTAButton>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-1/2 h-full bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Marcas Destacadas */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Un proveedor mayorista en el que puedes confiar
            </h2>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8"
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
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Así funciona comprar con Acom
            </h2>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {processSteps.map((step, index) => (
              <ProcessCard key={index} step={step} index={index} />
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
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                ¿Buscas un proveedor confiable para tu negocio?
              </h2>
              <p className="text-xl opacity-90 mb-10">
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
