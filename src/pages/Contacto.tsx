import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { Card, CardContent } from '@/components/ui/card';
import { springPresets } from '@/lib/motion';
import { BUSINESS_CONFIG } from '@/lib/index';

/**
 * Página de contacto de Acom Trading.
 * Enfoque: Generación de leads B2B (Librerías, Papelerías, Cadenas).
 * CTA Principal: Formulario de contacto y WhatsApp.
 */
export default function Contacto() {
  useEffect(() => {
    // Initialize Zoho Contact Form
    const containerId = "zf_div_6r0Xvyp-VFnH5Y0jgBU0a5PsKJ0ICQi2vRLN4W-ajVU";
    const container = document.getElementById(containerId);

    if (container && !container.querySelector("iframe")) {
      try {
        const f = document.createElement("iframe");
        let ifrmSrc = 'https://forms.acom.com.ve/acom/form/FormulariodeContacto/formperma/6r0Xvyp-VFnH5Y0jgBU0a5PsKJ0ICQi2vRLN4W-ajVU?zf_rszfm=1';

        f.src = ifrmSrc;
        f.style.border = "none";
        f.style.height = "758px";
        f.style.width = "100%";
        f.style.transition = "all 0.5s ease";
        f.setAttribute("aria-label", "Formulario de Contacto");
        f.setAttribute("allow", "geolocation;");

        container.appendChild(f);

        const handleMessage = (event: MessageEvent) => {
          const evntData = event.data;
          if (evntData && typeof evntData === 'string') {
            const zf_ifrm_data = evntData.split("|");
            if (zf_ifrm_data.length === 2 || zf_ifrm_data.length === 3) {
              const zf_perma = zf_ifrm_data[0];
              const zf_ifrm_ht_nw = (parseInt(zf_ifrm_data[1], 10) + 15) + "px";
              const iframe = container.querySelector("iframe");
              if (iframe && iframe.src.indexOf('formperma') > 0 && iframe.src.indexOf(zf_perma) > 0) {
                const prevIframeHeight = iframe.style.height;
                let zf_tout = false;
                if (zf_ifrm_data.length === 3) {
                  iframe.scrollIntoView();
                  zf_tout = true;
                }
                if (prevIframeHeight !== zf_ifrm_ht_nw) {
                  if (zf_tout) {
                    setTimeout(() => {
                      iframe.style.height = zf_ifrm_ht_nw;
                    }, 500);
                  } else {
                    iframe.style.height = zf_ifrm_ht_nw;
                  }
                }
              }
            }
          }
        };

        window.addEventListener('message', handleMessage);

        return () => {
          window.removeEventListener('message', handleMessage);
        };
      } catch (e) {
        console.error("Error loading Zoho form:", e);
      }
    }
  }, []);

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
                      Tiempo de respuesta promedio: <span className="font-mono font-bold text-primary">{BUSINESS_CONFIG.RESPONSE_TIME_EXPECTATION}</span>
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
                    <p className="text-foreground font-medium">Pedido mínimo: <span className="font-mono text-lg font-bold">${BUSINESS_CONFIG.MIN_ORDER_USD} USD</span></p>
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
                  <a href={`mailto:${BUSINESS_CONFIG.EMAIL}`} className="hover:text-primary transition-colors">
                    {BUSINESS_CONFIG.EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <a href={`https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`} className="hover:text-primary transition-colors">
                    +58-424 456 7154
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Formulario de Contacto Zoho */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
              className="lg:col-span-7"
            >
              <Card className="border-border bg-card shadow-2xl shadow-primary/5">
                <CardContent className="p-0">
                  <div id="zf_div_6r0Xvyp-VFnH5Y0jgBU0a5PsKJ0ICQi2vRLN4W-ajVU" className="w-full min-h-[400px]">
                  </div>
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
