import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { springPresets } from '@/lib/motion';

/**
 * Página de contacto de Acom Trading.
 * Enfoque: Generación de leads B2B (Librerías, Papelerías, Cadenas).
 * CTA Principal: Formulario de contacto y WhatsApp.
 */
export default function Contacto() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envío de formulario para producción
    console.log('Formulario enviado');
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Conecta con nuestro equipo comercial
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Déjanos tus datos y un asesor de Acom se pondrá en contacto contigo para enviarte catálogos, precios y condiciones mayoristas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Información de Contacto y Valor B2B */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
              className="lg:col-span-5 space-y-10"
            >
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Expectativa de Respuesta</h3>
                    <p className="text-muted-foreground leading-snug">
                      Tiempo de respuesta promedio: <span className="font-mono font-bold text-primary">24 horas hábiles</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Atención Inmediata</h3>
                    <p className="text-muted-foreground mb-4">
                      Si prefieres atención directa por WhatsApp para agilizar tu solicitud comercial.
                    </p>
                    <CTAButton showIcon variant="primary">
                      Hablar con un asesor
                    </CTAButton>
                  </div>
                </div>
              </div>

              {/* Pedido Mínimo Card */}
              <div className="bg-card border border-primary/20 p-8 rounded-2xl shadow-sm">
                <h4 className="font-mono text-sm uppercase tracking-widest text-primary font-bold mb-4">
                  Condiciones Mayoristas
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-foreground font-medium">Pedido mínimo: <span className="font-mono text-lg font-bold">$250 USD</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-foreground font-medium">Venta exclusiva al mayor</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-foreground font-medium">Despacho a nivel nacional</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <a href="mailto:ventas@acomve.com" className="hover:text-primary transition-colors">ventas@acomve.com</a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <a href="https://wa.me/584244567154" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">+58 424 456-7154</a>
                </div>
              </div>
            </motion.div>

            {/* Formulario de Captura de Leads */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
              className="lg:col-span-7"
            >
              <Card className="border-border bg-card shadow-2xl shadow-primary/5">
                <CardContent className="p-8 md:p-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground font-semibold">
                          Nombre y Apellido
                        </Label>
                        <Input
                          id="name"
                          placeholder="Ej. Juan Pérez"
                          required
                          className="bg-muted/30 focus:bg-background h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-foreground font-semibold">
                          Nombre del Negocio / Comercio
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="company"
                            placeholder="Ej. Librería Central C.A."
                            required
                            className="pl-10 bg-muted/30 focus:bg-background h-12"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground font-semibold">
                          Correo Electrónico Corporativo
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="nombre@empresa.com"
                          required
                          className="bg-muted/30 focus:bg-background h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground font-semibold">
                          WhatsApp de Contacto
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+58 412 0000000"
                          required
                          className="bg-muted/30 focus:bg-background h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-foreground font-semibold">
                        ¿En qué marcas o productos estás interesado?
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Bambary, Pelikan, Zanotti, SanRemo... Cuéntanos tus necesidades de abastecimiento."
                        className="min-h-[150px] bg-muted/30 focus:bg-background resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    >
                      Hablar con un asesor comercial
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Al enviar esta solicitud, confirmas que representas a un comercio o negocio mayorista.
                      Acom Trading C.A. protege tus datos según estándares de privacidad comercial.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Map or Locations Placeholder Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">
            Distribución Nacional
          </p>
          <h2 className="text-2xl font-bold mb-8">Abastecemos negocios en toda Venezuela</h2>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Puerto Ordaz', 'San Cristóbal'].map((city) => (
              <span key={city} className="text-lg font-semibold">{city}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
