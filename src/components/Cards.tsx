import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, ClipboardCheck, BookOpen, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand, Category, ProcessStep, ROUTE_PATHS } from "@/lib/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/Image";
import { hoverLift, springPresets, staggerItem } from "@/lib/motion";

/**
 * BrandCard - Displays detailed information about a distributed brand.
 *
 * 🚨 The logo is shown ALONGSIDE the name, never instead of it. It used to replace the
 * <CardTitle>, which meant that adding the four logos would have deleted "Bambary",
 * "Pelikan", "Sanremo" and "Momentop" as visible text — the highest-value keywords on a SPA
 * that has no per-route metadata. A logo that 404s falls back to the name alone; before, a
 * missing file left the card with neither logo nor title.
 */
export function BrandCard({ brand }: { brand: Brand }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(brand.logo) && !logoFailed;
  // Bambary has a published catalog; the rest still route to an advisor.
  const ctaHref = brand.catalogUrl ?? ROUTE_PATHS.CONTACTO;

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      transition={springPresets.snappy}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {showLogo && (
              <img
                src={brand.logo}
                alt=""
                aria-hidden="true"
                className="h-9 w-auto max-w-[38%] shrink-0 object-contain object-left"
                loading="lazy"
                decoding="async"
                onError={() => setLogoFailed(true)}
              />
            )}
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">{brand.name}</CardTitle>
          </div>
          <CardDescription className="text-accent-foreground font-medium">
            {brand.headline}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground leading-relaxed">
            {brand.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <Link to={ctaHref} className="w-full">
            <Button
              variant="outline"
              className="w-full min-h-11 group border-primary/20 hover:border-primary text-primary transition-colors"
            >
              {brand.cta}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/**
 * BenefitCard - Highlights a value proposition with an icon
 */
export function BenefitCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-5 sm:p-6 rounded-xl border border-border bg-card/50 transition-colors hover:bg-card">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold leading-none">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/** Icons for the four wholesale process steps, in order. */
export const PROCESS_ICONS: React.ReactNode[] = [
  <MessageSquare className="h-5 w-5" />,
  <ClipboardCheck className="h-5 w-5" />,
  <BookOpen className="h-5 w-5" />,
  <Truck className="h-5 w-5" />,
];

/**
 * ProcessCard - Displays a numbered step in the wholesale workflow.
 * `h-full` keeps every card the same height inside a grid row.
 */
export function ProcessCard({
  step,
  index,
  icon,
}: {
  step: ProcessStep;
  index: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col items-start p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-5 right-6 sm:top-6 sm:right-8 font-mono text-4xl sm:text-5xl font-bold text-primary/10 select-none">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="z-10">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-6">
          {icon ?? <span className="font-mono text-sm font-bold">{step.number}</span>}
        </span>
        <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

/**
 * CategoryCard - Showcases a product category with imagery (or an on-brand
 * gradient fallback while the image is pending) plus an icon badge.
 */
export function CategoryCard({
  category,
  image,
  icon,
}: {
  category: Category;
  image: string | null;
  icon: React.ReactNode;
}) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <Link to={ROUTE_PATHS.MARCAS} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="relative">
          {image ? (
            <Image src={image} alt={`Categoría ${category.label}`} ratio="card" />
          ) : (
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/15 via-primary/5 to-accent/50" />
          )}
          <span className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-background/90 text-primary shadow-sm backdrop-blur-sm">
            {icon}
          </span>
        </div>
        <div className="flex flex-grow flex-col p-5 sm:p-6">
          <h3 className="text-lg font-bold text-foreground sm:text-xl">{category.label}</h3>
          <p className="mt-2 flex-grow text-sm leading-relaxed text-muted-foreground">
            {category.description}
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
            Ver marcas
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
