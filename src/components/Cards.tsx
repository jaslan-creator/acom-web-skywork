import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand, ProcessStep, ROUTE_PATHS } from "@/lib/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { hoverLift, springPresets } from "@/lib/motion";

/**
 * BrandCard - Displays detailed information about a distributed brand
 */
export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      transition={springPresets.snappy}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">{brand.name}</CardTitle>
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
          <Link to={ROUTE_PATHS.CONTACTO} className="w-full">
            <Button
              variant="outline"
              className="w-full group border-primary/20 hover:border-primary text-primary transition-colors"
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
    <div className="flex gap-4 p-6 rounded-xl border border-border bg-card/50 transition-colors hover:bg-card">
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

/**
 * ProcessCard - Displays a numbered step in the wholesale workflow
 */
export function ProcessCard({ step, index }: { step: ProcessStep; index: number }) {
  return (
    <div className="relative flex flex-col items-start p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-6 right-8 font-mono text-5xl font-bold text-primary/10 select-none">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="z-10">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-mono text-sm font-bold mb-6">
          {step.number}
        </span>
        <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}
