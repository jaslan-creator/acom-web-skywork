import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import { BUSINESS_CONFIG } from '@/lib/index';

/**
 * Página de Términos y Condiciones de ACOM Trading
 */
export default function Terminos() {
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
                            Términos y Condiciones
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
                                <h2 className="text-2xl font-bold text-primary">1. Aceptación de los Términos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Al acceder y utilizar el sitio web de ACOM Trading C.A., usted acepta estar sujeto a estos Términos y Condiciones de uso. Si no está de acuerdo con alguno de estos términos, le recomendamos no utilizar nuestro sitio.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">2. Servicio de Distribución Mayorista</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    ACOM Trading C.A. es una empresa dedicada a la distribución mayorista de productos escolares, de oficina y hogar en Venezuela. Nuestros servicios están dirigidos exclusivamente a comercios, negocios y empresas que cumplan con los requisitos establecidos.
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Pedido mínimo: ${BUSINESS_CONFIG.MIN_ORDER_USD} USD</li>
                                    <li>Venta exclusiva al mayor</li>
                                    <li>Los precios están sujetos a cambios sin previo aviso</li>
                                    <li>Disponibilidad sujeta a inventario existente</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">3. Proceso de Compra</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Para realizar compras con ACOM Trading, el cliente debe:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Completar el formulario de registro como cliente mayorista</li>
                                    <li>Proporcionar documentación comercial válida</li>
                                    <li>Aceptar las condiciones de pago establecidas</li>
                                    <li>Cumplir con el pedido mínimo requerido</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">4. Pagos y Facturación</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Los pagos deben realizarse según las condiciones acordadas con nuestro equipo comercial. ACOM Trading se reserva el derecho de modificar las condiciones de crédito según el historial del cliente.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">5. Envíos y Entregas</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Los tiempos de entrega dependen de la ubicación y disponibilidad de productos. ACOM Trading no se hace responsable por retrasos causados por factores externos a nuestra operación.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">6. Garantías y Devoluciones</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Los reclamos por productos defectuosos o faltantes deben realizarse dentro de las 48 horas posteriores a la recepción del pedido. No se aceptan devoluciones por cambio de decisión.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">7. Propiedad Intelectual</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Todo el contenido de este sitio web, incluyendo logos, textos, imágenes y diseños, es propiedad de ACOM Trading C.A. o de sus respectivos propietarios de marca. Queda prohibida su reproducción sin autorización.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-primary">8. Contacto</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Para cualquier consulta sobre estos términos, puede contactarnos a través de:
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
