import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand, ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 4000;

/** `/images/banners/x.webp` → `/images/banners/x-mobile.webp` */
const mobileSrc = (src: string) => src.replace(/\.webp$/, "-mobile.webp");

/**
 * Rotating product banner, one slide per brand that has a `banner`.
 *
 * The images carry no text on purpose: the brand name, headline and CTA are real HTML on top
 * (desktop) or below (mobile), so they stay crawlable and readable at any width. On mobile the
 * 21:9 photo is cropped to its right side, where the products are.
 *
 * Autoplay stops while the pointer or keyboard focus is inside, and never starts when the
 * visitor asked the OS for reduced motion.
 */
export function BrandBanners({ brands }: { brands: Brand[] }) {
  const slides = brands.filter((brand) => brand.banner);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, paused]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Productos destacados por marca"
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((brand, i) => (
            <div
              key={brand.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${slides.length}: ${brand.name}`}
              className="relative min-w-0 shrink-0 grow-0 basis-full"
            >
              <picture>
                <source media="(max-width: 767px)" srcSet={mobileSrc(brand.banner!)} />
                <img
                  src={brand.banner}
                  alt={`Productos ${brand.name}`}
                  width={1920}
                  height={823}
                  loading={i === 0 ? "eager" : "lazy"}
                  // The first slide opens the page, so it is the LCP. Lowercase via spread: React 18
                  // does not know `fetchPriority` (same trick as the hero in Home.tsx).
                  {...(i === 0 ? { fetchpriority: "high" } : {})}
                  decoding="async"
                  className="block aspect-[16/10] w-full object-cover object-right md:aspect-[21/9] md:object-center"
                />
              </picture>

              <div className="p-5 md:absolute md:inset-y-0 md:left-0 md:flex md:w-1/2 md:flex-col md:justify-center md:bg-gradient-to-r md:from-white/95 md:via-white/75 md:to-transparent md:p-10 lg:p-14">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                  {brand.name}
                </p>
                <p className="mb-5 max-w-md text-xl font-bold leading-snug text-foreground md:text-2xl lg:text-3xl">
                  {brand.headline}
                </p>
                <Button asChild className="w-fit">
                  <Link to={brand.catalogUrl ?? ROUTE_PATHS.CONTACTO} tabIndex={i === selected ? 0 : -1}>
                    {brand.cta}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Banner anterior"
        className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow hover:bg-white md:flex"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Banner siguiente"
        className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow hover:bg-white md:flex"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex justify-center gap-2 pb-4 md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:pb-0">
        {slides.map((brand, i) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Ver banner de ${brand.name}`}
            aria-current={i === selected}
            className={cn(
              "h-2.5 rounded-full transition-all",
              i === selected ? "w-8 bg-primary" : "w-2.5 bg-foreground/25 hover:bg-foreground/40"
            )}
          />
        ))}
      </div>
    </section>
  );
}
