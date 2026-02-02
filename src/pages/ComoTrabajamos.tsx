import { motion } from "framer-motion";
import { 
  Building2, 
  DollarSign, 
  UserCheck, 
  Package, 
  Truck, 
  ArrowRight 
} from "lucide-react";
import { processSteps } from "../data/index";
import { CTAButton } from "../components/CTAButton";
import { ProcessCard, BenefitCard } from "../components/Cards";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "../lib/motion";

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
      <section className="relative py-20 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial="initial" 
            animate="animate" 
            variants={fadeInUp}
            className="max-w-3xl"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Un proceso mayorista <span className="text-primary">claro y eficiente</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              En Acom optimizamos el abastecimiento para que tu negocio no se detenga. 
              Eliminamos las complicaciones innecesarias para ofrecerte un servicio ágil y profesional.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
      </section>

      {/* Process Steps Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Así funciona comprar con Acom</h2>
            <div className="w-20 h-1 bg-primary rounded-full" />
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {processSteps.map((step, index) => (
              <motion.div key={step.number} variants={staggerItem}>
                <ProcessCard step={step} index={index} />
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
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Detalles del proceso comercial</h2>
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

      {/* Final CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[2rem] p-8 lg:p-16 text-primary-foreground relative overflow-hidden">
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
              <div className="shrink-0">
                <CTAButton 
                  variant="secondary" 
                  className="text-lg px-8 py-6"
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
