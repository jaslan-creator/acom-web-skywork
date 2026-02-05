import { motion } from "framer-motion";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  FileText,
  Users,
  ShoppingCart
} from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

const benefits = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Hasta 30 días de plazo",
    description: "Tiempo suficiente para rotar tu inventario"
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Límites desde US$250 hasta US$5,000",
    description: "Montos adaptados a tu capacidad de negocio"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Aprobación en 48 horas hábiles",
    description: "Respuesta rápida para no perder oportunidades"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Renovación automática",
    description: "Para clientes cumplidos y establecidos"
  }
];

const requirements = [
  {
    icon: <FileText className="w-5 h-5" />,
    text: "Negocio establecido (mínimo 1 año)"
  },
  {
    icon: <Users className="w-5 h-5" />,
    text: "Referencias comerciales verificables"
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    text: "Pedido mínimo de $250 mantenido"
  }
];

export default function LineaCredito() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Solicita tu línea de crédito
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Accede a financiamiento especial para hacer crecer tu inventario. Condiciones preferenciales para distribuidores establecidos.
            </p>
          </motion.div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-1/2 h-full bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Introducción */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground leading-relaxed italic">
              "Sabemos que el flujo de caja es clave en tu negocio. Por eso ofrecemos líneas de crédito especiales para distribuidores establecidos que quieren optimizar su capital de trabajo y maximizar sus oportunidades de venta."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Beneficios de tu línea de crédito
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Condiciones diseñadas especialmente para el sector mayorista
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">Requisitos mínimos</h3>
            <div className="space-y-4">
              {requirements.map((req, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ ...springPresets.gentle, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {req.icon}
                  </div>
                  <span className="text-foreground font-medium">{req.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Solicitar línea de crédito ahora
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Completa el formulario y nuestro equipo comercial te contactará en máximo 48 horas hábiles con una respuesta.
            </p>
          </div>

          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Formulario integrado */}
                <div id="zf_div_KN0sf6cLhsY8S7gbWXtof17iLWa2bZTeBSLdx2F6I-8" className="w-full">
                </div>
                <script type="text/javascript" dangerouslySetInnerHTML={{
                  __html: `
                    (function() {
                      try{
                        var f = document.createElement("iframe");
                        
                        var ifrmSrc = 'https://forms.acom.com.ve/acom/form/AplicacinparaCrdito2/formperma/KN0sf6cLhsY8S7gbWXtof17iLWa2bZTeBSLdx2F6I-8?zf_rszfm=1';
                        
                        try{
                          if ( typeof ZFAdvLead != "undefined" && typeof zfutm_zfAdvLead != "undefined" ) {
                            for( var prmIdx = 0 ; prmIdx < ZFAdvLead.utmPNameArr.length ; prmIdx ++ ) {
                                var utmPm = ZFAdvLead.utmPNameArr[ prmIdx ];
                                utmPm = ( ZFAdvLead.isSameDomian && ( ZFAdvLead.utmcustPNameArr.indexOf(utmPm) == -1 ) ) ? "zf_" + utmPm : utmPm;
                                var utmVal = zfutm_zfAdvLead.zfautm_gC_enc( ZFAdvLead.utmPNameArr[ prmIdx ] );
                                if ( typeof utmVal !== "undefined" ) {
                                  if ( utmVal != "" ) {
                                    if(ifrmSrc.indexOf('?') > 0){
                                         ifrmSrc = ifrmSrc+'&'+utmPm+'='+utmVal;
                                    }else{
                                        ifrmSrc = ifrmSrc+'?'+utmPm+'='+utmVal;
                                    }
                                  }
                                }
                            }
                          }
                          if ( typeof ZFLead !== "undefined" && typeof zfutm_zfLead !== "undefined" ) {
                            for( var prmIdx = 0 ; prmIdx < ZFLead.utmPNameArr.length ; prmIdx ++ ) {
                              var utmPm = ZFLead.utmPNameArr[ prmIdx ];
                              var utmVal = zfutm_zfLead.zfutm_gC_enc( ZFLead.utmPNameArr[ prmIdx ] );
                              if ( typeof utmVal !== "undefined" ) {
                                if ( utmVal != "" ){
                                  if(ifrmSrc.indexOf('?') > 0){
                                    ifrmSrc = ifrmSrc+'&'+utmPm+'='+utmVal;
                                  }else{
                                    ifrmSrc = ifrmSrc+'?'+utmPm+'='+utmVal;
                                  }
                                }
                              }
                            }
                          }
                        }catch(e){}
                        
                        f.src = ifrmSrc;
                        f.style.border="none";
                        f.style.height="3093px";
                        f.style.width="100%";
                        f.style.transition="all 0.5s ease";
                        f.setAttribute("aria-label", 'Aplicación Registro de Cliente');
                        f.setAttribute("allow","geolocation;");
                        var d = document.getElementById("zf_div_KN0sf6cLhsY8S7gbWXtof17iLWa2bZTeBSLdx2F6I-8");
                        d.appendChild(f);
                        window.addEventListener('message', function (){
                          var evntData = event.data;
                          if( evntData && evntData.constructor == String ){
                            var zf_ifrm_data = evntData.split("|");
                            if ( zf_ifrm_data.length == 2 || zf_ifrm_data.length == 3 ) {
                              var zf_perma = zf_ifrm_data[0];
                              var zf_ifrm_ht_nw = ( parseInt(zf_ifrm_data[1], 10) + 15 ) + "px";
                              var iframe = document.getElementById("zf_div_KN0sf6cLhsY8S7gbWXtof17iLWa2bZTeBSLdx2F6I-8").getElementsByTagName("iframe")[0];
                              if ( (iframe.src).indexOf('formperma') > 0 && (iframe.src).indexOf(zf_perma) > 0 ) {
                                var prevIframeHeight = iframe.style.height;
                                var zf_tout = false;
                                if( zf_ifrm_data.length == 3 ) {
                                    iframe.scrollIntoView();
                                    zf_tout = true;
                                }
                                if ( prevIframeHeight != zf_ifrm_ht_nw ) {
                                  if( zf_tout ) {
                                      setTimeout(function(){
                                          iframe.style.height = zf_ifrm_ht_nw;
                                      },500);
                                  } else {
                                      iframe.style.height = zf_ifrm_ht_nw;
                                  }
                                }
                              }
                            }
                          }
                        }, false);
                      }catch(e){}
                    })();
                  `
                }} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                ¿Tienes dudas sobre la línea de crédito?
              </h3>
              <p className="text-lg opacity-90 mb-8">
                Nuestro equipo comercial está listo para asesorarte
              </p>
              <div className="flex justify-center">
                <CTAButton 
                  className="bg-white text-primary hover:bg-white/90 border-none shadow-xl"
                  showIcon
                >
                  Hablar con un asesor
                </CTAButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}