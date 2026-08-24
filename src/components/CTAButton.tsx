import React from 'react';
import { motion } from 'framer-motion';
import { SiWhatsapp } from 'react-icons/si';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUSINESS_CONFIG } from '@/lib/index';
import { cn } from '@/lib/utils';

interface CTAButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
  href?: string;
  showIcon?: boolean;
  /**
   * 🚨 Con qué icono sale. Existía porque NO HABÍA «sin icono»: `showIcon` elegía entre el logo
   * verde de WhatsApp y un globo de mensaje, así que un botón «Abrir cuenta» —que abre una página
   * del sitio, no WhatsApp— salía con el logo de WhatsApp al lado del botón que sí abre WhatsApp.
   * Es la peor confusión posible justo en el gesto que el formulario vino a desambiguar.
   * `null` = sin icono. Sin pasar nada, el comportamiento de siempre.
   */
  icon?: React.ReactNode | null;
}

/**
 * Componente reutilizable para el CTA principal 'Hablar con un asesor'
 * Optimizado para conversión B2B con feedback táctil y diseño corporativo.
 */
export function CTAButton({
  variant = 'primary',
  className,
  children,
  href,
  showIcon = true,
  icon,
}: CTAButtonProps) {
  const resolvedHref = href ?? `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`;
  const isInternalLink = resolvedHref.startsWith("/");

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
    secondary: "bg-white text-primary border-2 border-primary hover:bg-primary/5",
  };

  const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 30,
  };

  // `icon` sin declarar → lo de siempre. Declarado (incluido `null`) → manda él.
  const iconoDeclarado = icon !== undefined;
  const content = (
    <>
      {iconoDeclarado ? (
        icon ? (
          <span className="flex items-center justify-center">{icon}</span>
        ) : null
      ) : (
        <>
          {showIcon && (
            <span className="flex items-center justify-center">
              <SiWhatsapp className="w-5 h-5" />
            </span>
          )}
        </>
      )}
      <span>{children}</span>
      {!iconoDeclarado && !showIcon && <MessageCircle className="w-4 h-4 opacity-70" />}
    </>
  );

  const sharedClassName = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-center text-base font-bold transition-colors duration-200 sm:px-8 sm:py-4",
    variants[variant],
    className
  );

  if (isInternalLink) {
    return (
      // 🚨 `inline-flex` en el envoltorio, no bloque. Sin esto rompe el layout en dos páginas:
      // dentro de un `flex flex-col items-center` (Catálogo) se estira a todo el ancho, y en un
      // contenedor sin flex (Cómo trabajamos) los botones se apilan pegados sin separación.
      <motion.div
        className="inline-flex"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={springConfig}
      >
        <Link to={resolvedHref} className={sharedClassName}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.a
      href={resolvedHref}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springConfig}
      className={sharedClassName}
    >
      {content}
    </motion.a>
  );
}
