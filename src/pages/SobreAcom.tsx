import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Target, Users, Truck } from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function SobreAcom() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-secondary/30 border-b border-border overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-mono font-bold tracking-widest uppercase bg-primary/10 text-primary rounded-full">
              Nuestra Empresa
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Más que un proveedor, <br />
              <span className="text-primary">un aliado comercial</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Impulsamos el canal minorista y mayorista en Venezuela a través de una cadena de suministro eficiente y marcas de prestigio.
            </p>
          </motion.div>
        </div>
        {/* Decorative element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Main Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-foreground">Trayectoria y Enfoque</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Acom Trading es una empresa dedicada a la importación y distribución mayorista de productos escolares, de oficina y hogar en Venezuela.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trabajamos con marcas exclusivas y un modelo de atención directa que garantiza continuidad de suministro, asesoría comercial y procesos claros.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nuestro enfoque es apoyar el crecimiento de librerías, papelerías y distribuidores a través de un portafolio confiable y una operación eficiente.
              </p>
              <div className="pt-4">
                <CTAButton href="/marcas" variant="primary" showIcon>
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
                  className="p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
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
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold font-mono">$250</div>
              <p className="text-primary-foreground/80 font-medium">Pedido Mínimo Accesible</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold font-mono">100%</div>
              <p className="text-primary-foreground/80 font-medium">Venta Exclusiva B2B</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold font-mono">24h</div>
              <p className="text-primary-foreground/80 font-medium">Respuesta Comercial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-24">
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
            <div className="pt-8">
              <CTAButton href="/contacto" variant="secondary">
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
    description: 'Representamos nombres líderes como Pelikan y Bambary con total respaldo.',
    icon: <Target className="w-6 h-6" />
  },
  {
    title: 'Suministro Continuo',
    description: 'Garantizamos stock constante para que su negocio nunca se detenga.',
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
