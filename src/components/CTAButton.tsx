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

  const content = (
    <>
      {showIcon && (
        <span className="flex items-center justify-center">
          <SiWhatsapp className="w-5 h-5" />
        </span>
      )}
      <span>{children}</span>
      {!showIcon && <MessageCircle className="w-4 h-4 opacity-70" />}
    </>
  );

  const sharedClassName = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-center text-base font-bold transition-colors duration-200 sm:px-8 sm:py-4",
    variants[variant],
    className
  );

  if (isInternalLink) {
    return (
      <motion.div
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
