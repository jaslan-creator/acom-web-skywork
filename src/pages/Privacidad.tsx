import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import { BUSINESS_CONFIG } from '@/lib/index';

/**
 * Página de Política de Privacidad de ACOM Trading
 */
export default function Privacidad() {
    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <section className="relative py-16 bg-secondary/30 border-b border-border">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={springPresets.gentle}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                            Política de Privacidad
                        </h1>
                        <p className="text-muted-foreground">
                            Última actualización: Febrero 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springPresets.gentle, delay: 0.1 }}
                        className="prose prose-lg max-w-none"
                    >
                        <div className="space-y-8 text-foreground">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">1. Información que Recopilamos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    ACOM Trading C.A. recopila información personal necesaria para brindar nuestros servicios de distribución mayorista. Esta información puede incluir:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Nombre y apellido del representante comercial</li>
                                    <li>Nombre del negocio o razón social</li>
                                    <li>Dirección comercial y de entrega</li>
                                    <li>Número de teléfono y WhatsApp</li>
                                    <li>Correo electrónico corporativo</li>
                                    <li>Documentos comerciales (RIF, registro mercantil)</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">2. Uso de la Información</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Utilizamos su información personal para:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Procesar y gestionar pedidos mayoristas</li>
                                    <li>Enviar catálogos, listas de precios y ofertas comerciales</li>
                                    <li>Comunicarnos sobre el estado de pedidos y entregas</li>
                                    <li>Evaluar solicitudes de línea de crédito</li>
                                    <li>Mejorar nuestros servicios y experiencia del cliente</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">3. Protección de Datos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    ACOM Trading implementa medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o alteración. Sus datos se almacenan de forma segura y solo el personal autorizado tiene acceso a ellos.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">4. Compartir Información</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    No vendemos ni compartimos su información personal con terceros, excepto cuando sea necesario para:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Cumplir con obligaciones legales</li>
                                    <li>Procesar pagos a través de entidades financieras</li>
                                    <li>Coordinar entregas con servicios de transporte</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">5. Cookies y Tecnologías de Seguimiento</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Nuestro sitio web puede utilizar cookies para mejorar la experiencia de navegación. Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio y a optimizar nuestros servicios.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">6. Sus Derechos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Usted tiene derecho a:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Acceder a sus datos personales</li>
                                    <li>Solicitar la corrección de datos inexactos</li>
                                    <li>Solicitar la eliminación de sus datos</li>
                                    <li>Oponerse al uso de sus datos para marketing</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">7. Retención de Datos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Conservamos su información personal mientras mantenga una relación comercial activa con nosotros y por el período requerido por las leyes fiscales y comerciales de Venezuela.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">8. Cambios en la Política</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    ACOM Trading se reserva el derecho de modificar esta política de privacidad. Los cambios serán publicados en esta página con la fecha de actualización correspondiente.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">9. Contacto</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Para ejercer sus derechos o realizar consultas sobre privacidad, contáctenos:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Email: {BUSINESS_CONFIG.EMAIL}</li>
                                    <li>WhatsApp: +58-424 456 7154</li>
                                    <li>Dirección: {BUSINESS_CONFIG.ADDRESS}</li>
                                </ul>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
