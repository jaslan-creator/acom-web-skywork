import React from 'react';
import { motion } from 'framer-motion';
import { SiWhatsapp } from 'react-icons/si';
import { MessageCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CTAButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
  /** Optional: link to WhatsApp. Defaults to a placeholder if not provided. */
  href?: string;
  /** If true, shows a WhatsApp icon. Defaults to true. */
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
  href = "https://wa.me/584244567154", // WhatsApp comercial de ACOM
  showIcon = true,
}: CTAButtonProps) {

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
    secondary: "bg-white text-primary border-2 border-primary hover:bg-primary/5",
  };

  const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 30,
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springConfig}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-base transition-colors duration-200",
        variants[variant],
        className
      )}
    >
      {showIcon && (
        <span className="flex items-center justify-center">
          {/* Using SiWhatsapp for brand recognition, fallback to MessageCircle */}
          <SiWhatsapp className="w-5 h-5" />
        </span>
      )}
      <span>{children}</span>

      {/* Subtle indicator for B2B seriousness */}
      {!showIcon && <MessageCircle className="w-4 h-4 opacity-70" />}
    </motion.a>
  );
}
