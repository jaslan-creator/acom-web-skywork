import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { springPresets } from '@/lib/motion';

/**
 * Página de contacto de Acom Trading.
 * Enfoque: Generación de leads B2B (Librerías, Papelerías, Cadenas).
 * CTA Principal: Formulario de Zapier y WhatsApp.
 */
export default function Contacto() {

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6">
              Conecta con nuestro equipo comercial
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Déjanos tus datos y un asesor de Acom se pondrá en contacto contigo para enviarte catálogos, precios y condiciones mayoristas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Información de Contacto Rápida */}
      <section className="py-12 md:py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springPresets.gentle, delay: 0 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-xl text-primary w-fit mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
              <a
                href="https://wa.me/584244567154"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                +58 424 456-7154
              </a>
              <p className="text-sm text-muted-foreground mt-2">Atención inmediata</p>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springPresets.gentle, delay: 0.1 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-xl text-primary w-fit mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <a
                href="mailto:ventas@acomve.com"
                className="text-primary font-medium hover:underline"
              >
                ventas@acomve.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">Respuesta en 24 hrs</p>
            </motion.div>

            {/* Dirección */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springPresets.gentle, delay: 0.2 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-xl text-primary w-fit mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ubicación</h3>
              <p className="text-muted-foreground text-sm">
                Urb. Industrial Castillito<br />
                CCCV II, Local 18<br />
                Valencia, Venezuela
              </p>
            </motion.div>

            {/* Tiempo de Respuesta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springPresets.gentle, delay: 0.3 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-xl text-primary w-fit mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Horario</h3>
              <p className="text-muted-foreground text-sm">
                Lunes a Viernes<br />
                8:00 AM - 5:00 PM
              </p>
            </motion.div>

          </div>

          {/* CTA WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springPresets.gentle, delay: 0.4 }}
            className="text-center mt-8"
          >
            <CTAButton showIcon variant="primary" className="mx-auto">
              Hablar con un asesor ahora
            </CTAButton>
          </motion.div>
        </div>
      </section>

      {/* Formulario de Zapier - Ancho Completo */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Solicita información comercial
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Completa el formulario y recibirás catálogos, listas de precios y condiciones mayoristas.
            </p>
          </motion.div>

          <iframe
            src="https://interfaces.zapier.com/embed/page/cml4l4nc8000413b0v2i56l34?allowQueryParams=true&noBackground=true"
            style={{ maxWidth: '900px', width: '100%', height: '900px', display: 'block', margin: '0 auto' }}
            data-testid="cml4l4nc8000413b0v2i56l34-zapier-interfaces-page-embed-iframe"
            title="Formulario de contacto ACOM"
          />

          {/* Condiciones Mayoristas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springPresets.gentle, delay: 0.2 }}
            className="max-w-3xl mx-auto mt-8"
          >
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Pedido mínimo: <strong className="text-foreground">$250 USD</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Venta exclusiva al mayor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Despacho a nivel nacional</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ciudades */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">
            Distribución Nacional
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-6">Abastecemos negocios en toda Venezuela</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-60">
            {['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Puerto Ordaz', 'San Cristóbal'].map((city) => (
              <span key={city} className="text-base md:text-lg font-semibold">{city}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
