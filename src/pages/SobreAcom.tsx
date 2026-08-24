import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Target, Users, Truck } from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { brands, categoriesProse, coverage } from '@/data/index';
import { PageHero } from '@/components/PageHero';
import { MEDIA } from '@/assets/media';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function SobreAcom() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <PageHero
        image={MEDIA.sobreAcom ?? ""}
        eyebrow="Nuestra Empresa"
        title={<>Más que un proveedor,<br className="hidden sm:block" /> un aliado comercial</>}
        subtitle="Impulsamos el canal minorista y mayorista en Venezuela a través de una cadena de suministro eficiente y marcas de prestigio."
      />

      {/* Main Content Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-foreground">Trayectoria y Enfoque</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Acom Trading es una empresa dedicada a la importación y distribución mayorista de productos {categoriesProse()} en Venezuela.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trabajamos con marcas exclusivas y un modelo de atención directa que garantiza continuidad de suministro, asesoría comercial y procesos claros.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nuestro enfoque es apoyar el crecimiento de librerías, papelerías y distribuidores a través de un portafolio confiable y una operación eficiente.
              </p>
              <div className="pt-4">
                <CTAButton href="/marcas" variant="primary" showIcon={false}>
                  Conocer nuestras marcas
                </CTAButton>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {pillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    {pillar.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Highlights Section */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          {/*
            Three stats, so the md:grid-cols-3 grid stays full — a fourth would hang centred on the
            most visible red band of the page. Two of the previous three were slogans, and the third
            ("24h") contradicted the 48-hour commitment on /contacto.

            🚨 "+700" is a FLOOR, not a count, and deliberately so. At least four live product
            counts coexist across the ERP (695 · 779 · 942 · 1.201), none of them carrying its own
            definition, and the figure moved by 84 in a single day when Momentop was unhidden. A
            hard integer in a static site with no detector rots in silence. The definition used
            here: products in the catalogue a sales rep can actually sell (779 today). The floor has
            to survive archiving the 74 SKUs of the brand that is no longer commercialised and is
            still pending removal in the ERP, which would leave ~705. 700 survives that; 750 would not.
            ⚠️ Not re-measured against PROD from this machine: the anon key returns 0 rows (RLS
            doing its job) and there is no service-role key on disk.

            The other two are derived from the data, so they cannot drift.
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold font-mono">+700</div>
              <p className="text-primary-foreground/80 font-medium">Productos en catálogo</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold font-mono">{brands.length}</div>
              <p className="text-primary-foreground/80 font-medium">Marcas distribuidas</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold font-mono">{coverage.length}</div>
              <p className="text-primary-foreground/80 font-medium">Regiones atendidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Comprometidos con el mercado venezolano
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed italic">
              "En Acom Trading, entendemos los desafíos del mercado local. Por eso, no solo entregamos productos, sino que aseguramos la rotación de inventario y el éxito comercial de nuestros aliados."
            </p>
            {/* ✅ De paso se arregla una mentira viva: este botón apuntaba a `/contacto` y salía
                con el logo de WhatsApp, o sea un botón de WhatsApp que no abre WhatsApp. */}
            <div className="flex flex-wrap justify-center gap-3 pt-8">
              <CTAButton href="/abrir-cuenta" icon={null}>
                Abrir cuenta
              </CTAButton>
              <CTAButton href="/contacto" variant="secondary" icon={null}>
                Hablar con un asesor
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const pillars = [
  {
    title: 'Marcas Exclusivas',
    description: 'Representamos a Bambary, Pelikan, Sanremo y Momentop con total respaldo.',
    icon: <Target className="w-6 h-6" />
  },
  {
    title: 'Suministro Continuo',
    // Softened: the Terms say "disponibilidad sujeta a inventario existente" and there are
    // products visible with stock <= 0. Guaranteeing constant stock contradicted our own legals.
    description: 'Reposición planificada y cobertura de inventario para las líneas de mayor rotación.',
    icon: <Truck className="w-6 h-6" />
  },
  {
    title: 'Asesoría Directa',
    description: 'Un equipo experto le acompaña en la selección del portafolio ideal.',
    icon: <Users className="w-6 h-6" />
  },
  {
    title: 'Solidez Logística',
    description: 'Despachamos a nivel nacional con procesos claros y confiables.',
    icon: <Building2 className="w-6 h-6" />
  }
];
