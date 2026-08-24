import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  UserCheck,
  Package,
  Truck,
  Calendar,
  TrendingUp
} from "lucide-react";
import { processSteps } from "../data/index";
import { CTAButton } from "../components/CTAButton";
import { ProcessCard, BenefitCard, PROCESS_ICONS } from "../components/Cards";
import { PageHero } from "../components/PageHero";
import { MEDIA } from "../assets/media";
import { springPresets, staggerContainer, staggerItem } from "../lib/motion";

const details = [
  {
    title: "Venta exclusiva a negocios",
    description: "Enfocados exclusivamente en el canal B2B para proteger la cadena de valor.",
    icon: <Building2 className="w-6 h-6" />
  },
  {
    title: "Pedido mínimo: $250",
    description: "Un umbral accesible para que pequeños y medianos comercios mantengan su stock.",
    icon: <DollarSign className="w-6 h-6" />
  },
  {
    title: "Atención personalizada",
    description: "Cada cliente cuenta con un asesor dedicado para gestionar sus requerimientos.",
    icon: <UserCheck className="w-6 h-6" />
  },
  {
    title: "Coordinación logística",
    description: "Gestión directa y seguimiento constante de cada despacho realizado.",
    icon: <Package className="w-6 h-6" />
  },
  {
    title: "Despachos nacionales",
    description: "Cobertura total en Venezuela con aliados logísticos de confianza.",
    icon: <Truck className="w-6 h-6" />
  }
];

export default function ComoTrabajamos() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <PageHero
        image={MEDIA.comoTrabajamos ?? ""}
        title={<>Un proceso mayorista claro y eficiente</>}
        subtitle="En Acom optimizamos el abastecimiento para que tu negocio no se detenga. Eliminamos las complicaciones innecesarias para ofrecerte un servicio ágil y profesional."
      />

      {/* Process Steps Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Así funciona comprar con Acom</h2>
            <div className="w-20 h-1 bg-primary rounded-full" />
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
          >
            {processSteps.map((step, index) => (
              <motion.div key={step.number} variants={staggerItem} className="h-full">
                <ProcessCard step={step} index={index} icon={PROCESS_ICONS[index]} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 p-6 bg-muted/50 rounded-xl border border-border inline-flex items-center gap-3"
          >
            <p className="text-muted-foreground italic">
              Proceso claro, sin intermediarios ni complicaciones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 sm:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Detalles del proceso comercial</h2>
            <p className="text-muted-foreground">
              Establecemos condiciones claras para garantizar una relación comercial sólida y transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {details.map((detail, idx) => (
              <BenefitCard 
                key={idx}
                title={detail.title}
                description={detail.description}
                icon={detail.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/*
        Financiamiento. This block was orphaned by the commit that removed the Línea de Crédito
        page: it survived as the LAST thing on the page, after the closing CTA, promising figures
        with no button at all. It is the strongest B2B differentiator here, so it is rewritten —
        moved above the closing CTA and given an honest destination.

        🚨 The form cannot be linked from a public page, and this was validated rather than assumed:
        cliente.acomve.com/solicitud-credito requires five HMAC-signed parameters (customer id,
        seller id, a 7-day expiry) that a sales rep mints against an EXISTING customer record.
        Without them the screen falls to "enlace inválido". A previous audit read its HTTP 200 as
        proof the form was public — the portal is a SPA with a catch-all, so ANY invented route
        returns 200.

        Figures with no backing were removed: "US$250 - US$5,000" (real limits in the ERP reach
        $10,000 and $12,000) and a 48-hour approval promise that nothing enforces.
      */}
      <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ¿Necesitas financiamiento para tu inventario?
              </h2>
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                Trabajamos con líneas de crédito para clientes con historial. Tu asesor evalúa tu
                caso y prepara la solicitud contigo.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Hasta 30 días</h3>
                <p className="text-sm opacity-80">de plazo para pago</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Límite a tu medida</h3>
                <p className="text-sm opacity-80">según tu volumen e historial</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Lo tramita tu asesor</h3>
                <p className="text-sm opacity-80">él prepara y envía la solicitud</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Se revisa contigo</h3>
                <p className="text-sm opacity-80">según tu comportamiento de pago</p>
              </div>
            </div>

            <div className="flex justify-center">
              <CTAButton className="bg-white text-primary hover:bg-white/90 border-none shadow-xl" showIcon>
                Consultar mi línea de crédito
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-16 text-primary-foreground relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Nos enfocamos en relaciones comerciales de largo plazo
                </h2>
                <p className="text-lg text-primary-foreground/80 leading-relaxed">
                  ¿Listo para abastecer tu negocio con las mejores marcas del mercado? 
                  Nuestros asesores están preparados para guiarte en cada paso del proceso.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <CTAButton
                  href="/abrir-cuenta"
                  variant="secondary"
                  className="text-lg px-8 py-6"
                  icon={null}
                >
                  Abrir cuenta
                </CTAButton>
                <CTAButton 
                  className="text-lg px-8 py-6 bg-white/10 text-white hover:bg-white/20 border-2 border-white/60"
                  showIcon
                >
                  Iniciar contacto comercial
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
