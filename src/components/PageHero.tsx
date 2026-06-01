import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  /** Background image path. */
  image: string;
  /** Optional small uppercase label above the title. */
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  align?: "left" | "center";
}

/**
 * Full-bleed page hero: background image with a legibility scrim and light text.
 * Matches the Home hero treatment for a consistent look across institutional pages.
 */
export function PageHero({ image, eyebrow, title, subtitle, align = "left" }: PageHeroProps) {
  return (
    <section className="relative flex items-center overflow-hidden border-b border-border bg-foreground sm:min-h-[52vh]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={cn(
          "absolute inset-0",
          align === "center"
            ? "bg-gradient-to-t from-foreground/92 via-foreground/70 to-foreground/45"
            : "bg-gradient-to-r from-foreground/92 via-foreground/75 to-foreground/40"
        )}
      />
      <div
        className={cn(
          "container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-28",
          align === "center" && "text-center"
        )}
      >
        <motion.div
          className={cn("max-w-3xl", align === "center" && "mx-auto")}
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          {eyebrow && (
            <span className="mb-5 inline-block rounded-full bg-background/15 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-background backdrop-blur-sm">
              {eyebrow}
            </span>
          )}
          <h1 className="mb-5 text-3xl font-bold leading-tight text-background sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="text-lg leading-relaxed text-background/85 sm:text-xl">{subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
}
