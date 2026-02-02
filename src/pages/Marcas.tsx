import React from 'react';
import { motion } from 'framer-motion';
import { brands } from '../data/index';
import { BrandCard } from '../components/Cards';
import { CTAButton } from '../components/CTAButton';

/**
 * Animation variants for smooth entry following the project standards
 */
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    type: "spring",
    stiffness: 300,
    damping: 35
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

/**
 * Marcas Page
 * Displays detailed information about Acom Trading's portfolio: Bambary, Pelikan, Zanotti, and SanRemo.
 */
const Marcas: React.FC = () => {
  return (
    <motion.main 
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background"
    >
      {/* Header Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            variants={fadeInUp}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Marcas mayoristas con <br />
              <span className="text-primary">demanda comprobada</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Nuestro portafolio está enfocado en productos que rotan, se reponen y generan margen para el canal mayorista venezolano.
            </p>
          </motion.div>
        </div>

        {/* Decorative element mirroring logo curves */}
        <div className="absolute top-0 right-0 -z-0 w-[40%] h-full bg-accent/30 rounded-bl-[200px] opacity-50" />
      </section>

      {/* Brands Display */}
      <section className="py-16 lg:py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {brands.map((brand) => (
              <motion.div key={brand.id} variants={fadeInUp}>
                <BrandCard brand={brand} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Global Call to Action Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="relative overflow-hidden bg-primary rounded-[2rem] p-8 md:p-16 shadow-2xl"
          >
            {/* Decorative Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary-foreground),transparent)]" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                ¿Listo para abastecer tu negocio?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl">
                Solicita nuestros catálogos completos con precios mayoristas y condiciones de despacho para tu zona. Pedido mínimo accesible desde $250.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <CTAButton 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                  showIcon
                >
                  Hablar con un asesor
                </CTAButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Footer Text */}
      <section className="pb-16 text-center">
        <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
          Distribución Confiable • Venezuela 2026
        </p>
      </section>
    </motion.main>
  );
};

export default Marcas;