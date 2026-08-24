import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { Cobertura } from '@/components/Cobertura';
import { LeadForm } from '@/components/LeadForm';
import { isCaptureEnabled } from '@/lib/leadApi';
import { Card, CardContent } from '@/components/ui/card';
import { springPresets } from '@/lib/motion';
import { BUSINESS_CONFIG } from '@/lib/index';

const ZOHO_FORM_ORIGIN = "https://forms.acom.com.ve";

/**
 * Página de contacto de Acom Trading.
 * Enfoque: Generación de leads B2B (Librerías, Papelerías, Cadenas).
 * CTA Principal: Formulario de contacto y WhatsApp.
 */
export default function Contacto() {
  /**
   * 🚨 El interruptor de Zentral decide QUÉ formulario se dibuja acá, y por eso conviven los dos
   * caminos en el código. Encendido: el formulario nuevo, que registra el envío en la bandeja.
   * Apagado: el de Zoho de siempre, intacto. Sin esto, encender la captación dejaría de ser un
   * clic —necesitaría un despliegue mío— o esta página se quedaría sin formulario mientras tanto,
   * que es una regresión.
   *
   * `null` = todavía no se sabe. Se trata como apagado a efectos del iframe, pero NO se dibuja el
   * de Zoho hasta saberlo, para no montarlo y desmontarlo medio segundo después.
   */
  const [captureEnabled, setCaptureEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void isCaptureEnabled(ac.signal).then(setCaptureEnabled);
    return () => ac.abort();
  }, []);

  useEffect(() => {
    // El iframe de Zoho SOLO se monta si la captación propia está apagada.
    if (captureEnabled !== false) return;
    // Initialize Zoho Contact Form
    const containerId = "zf_div_6r0Xvyp-VFnH5Y0jgBU0a5PsKJ0ICQi2vRLN4W-ajVU";
    const container = document.getElementById(containerId);

    if (container && !container.querySelector("iframe")) {
      try {
        const f = document.createElement("iframe");
        const ifrmSrc = `${ZOHO_FORM_ORIGIN}/acom/form/FormulariodeContacto/formperma/6r0Xvyp-VFnH5Y0jgBU0a5PsKJ0ICQi2vRLN4W-ajVU?zf_rszfm=1`;

        f.src = ifrmSrc;
        f.style.border = "none";
        f.style.height = "758px";
        f.style.width = "100%";
        f.style.maxWidth = "100%";
        f.style.display = "block";
        f.style.transition = "all 0.5s ease";
        f.setAttribute("aria-label", "Formulario de Contacto");
        f.setAttribute("allow", "geolocation");

        container.appendChild(f);

        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== ZOHO_FORM_ORIGIN) return;

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
  }, [captureEnabled]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-14 sm:py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-5 sm:mb-6">
              Conecta con nuestro equipo comercial
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Déjanos tus datos y un asesor de Acom se pondrá en contacto contigo para enviarte catálogos, precios y condiciones mayoristas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Información de Contacto y Valor B2B */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
              className="lg:col-span-5 space-y-8 sm:space-y-10"
            >
              <div className="space-y-7 sm:space-y-8">
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
                    <h3 className="font-bold text-xl mb-1">Atención por WhatsApp</h3>
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
              <div className="bg-card border border-primary/20 p-5 sm:p-8 rounded-2xl shadow-sm">
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
                    +{BUSINESS_CONFIG.WHATSAPP_PHONE}
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
              <Card className="overflow-hidden border-border bg-card shadow-2xl shadow-primary/5">
                <CardContent className="p-0">
                  {captureEnabled === true ? (
                    // 🚨 Abre marcado en «consulta» y en nada más: la promesa impresa de esta
                    // página es «déjanos tus datos y un asesor se pondrá en contacto», así que
                    // abrir sin nada marcado y con el botón gris sería una regresión. Y solo
                    // «consulta» puede venir marcada: la opción que CREA una ficha nunca lo hace.
                    <LeadForm className="border-0" defaultIntent="question" />
                  ) : (
                    <div
                      id="zf_div_6r0Xvyp-VFnH5Y0jgBU0a5PsKJ0ICQi2vRLN4W-ajVU"
                      className="w-full min-h-[400px] overflow-x-hidden [&_iframe]:!m-0 [&_iframe]:!w-full [&_iframe]:!max-w-full"
                    >
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>
      <Cobertura className="bg-muted/20" />
    </div>
  );
}
