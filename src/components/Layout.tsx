import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, MessageSquare, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, LogIn } from "lucide-react";
import { ROUTE_PATHS, BUSINESS_CONFIG } from "@/lib/index";
import { brands, categoriesProse } from "@/data/index";
import { trackWhatsappLeads } from "@/lib/analytics";
import { IMAGES } from "@/assets/images";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Conversion tracking for every WhatsApp link on the site. Mounted once, here, because the
  // Layout wraps all routes — see src/lib/analytics.ts for why it is delegated, not per-button.
  useEffect(() => trackWhatsappLeads(), []);

  const navItems = [
    { label: "Home", path: ROUTE_PATHS.HOME },
    { label: "Marcas", path: ROUTE_PATHS.MARCAS },
    { label: "Catálogo", path: ROUTE_PATHS.CATALOGO },
    { label: "Cómo Trabajamos", path: ROUTE_PATHS.COMO_TRABAJAMOS },
    { label: "Sobre Acom", path: ROUTE_PATHS.SOBRE_ACOM },
    { label: "Contacto", path: ROUTE_PATHS.CONTACTO },
  ];

  const whatsappLink = `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`;
  const portalUrl = BUSINESS_CONFIG.PORTAL_URL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-mono tracking-wider">
        DESPACHOS GRATIS A NIVEL NACIONAL
      </div>

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled
            ? "bg-background/95 backdrop-blur-md py-3 shadow-sm border-border"
            : "bg-background py-4 sm:py-5 border-transparent"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
            <img
              src={IMAGES.LOGO_ROJO_8_2}
              alt="Acom Trading Logo"
              className="h-9 sm:h-10 xl:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2.5 xl:gap-5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            <div className="hidden xl:flex items-center gap-1 mr-2">
              <a
                href={BUSINESS_CONFIG.SOCIAL_MEDIA.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#1877F2] hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={BUSINESS_CONFIG.SOCIAL_MEDIA.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#E4405F] hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={BUSINESS_CONFIG.SOCIAL_MEDIA.LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#0A66C2] hover:opacity-80 transition-opacity"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            {/*
              The portal link is deliberately NOT a button any more. It used to be the most
              prominent CTA on all 7 pages while pointing at a portal retired on 2026-08-02, and
              its replacement is invite-only and ships 1.6 MB before telling a stranger "this
              email is not enabled". The converting CTA is the advisor.
              target/rel added: these three links had neither, unlike the WhatsApp ones beside them.
            */}
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <LogIn className="h-4 w-4" />
              Soy cliente
            </a>
            <Button asChild className="bg-primary hover:bg-primary/90 rounded-full px-3 xl:px-5">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Hablar con un asesor
              </a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex h-11 w-11 items-center justify-center text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col p-5 gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-11 items-center text-base font-semibold transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <hr className="border-border my-2" />
                <Button asChild className="w-full bg-primary py-6 text-base rounded-xl">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Hablar con un asesor
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full border-primary/30 text-primary py-6 text-base rounded-xl">
                  <a href={portalUrl} target="_blank" rel="noreferrer">
                    <LogIn className="mr-2 h-5 w-5" />
                    Soy cliente · Entrar
                  </a>
                </Button>
              <div className="flex items-center justify-center gap-6 mt-4">
                <a
                  href={BUSINESS_CONFIG.SOCIAL_MEDIA.FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1877F2] hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href={BUSINESS_CONFIG.SOCIAL_MEDIA.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E4405F] hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href={BUSINESS_CONFIG.SOCIAL_MEDIA.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A66C2] hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border mt-12 sm:mt-20">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-5">
              <img
                src={IMAGES.LOGO_ROJO_8_2}
                alt="Acom Trading"
                className="h-10 w-auto opacity-90"
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                Importación y distribución mayorista de marcas líderes en Venezuela.
                Especialistas en artículos {categoriesProse()}.
              </p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  Pedido Mínimo: ${BUSINESS_CONFIG.MIN_ORDER_USD}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <a
                  href={BUSINESS_CONFIG.SOCIAL_MEDIA.FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#1877F2] hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={BUSINESS_CONFIG.SOCIAL_MEDIA.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#E4405F] hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={BUSINESS_CONFIG.SOCIAL_MEDIA.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#0A66C2] hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4 sm:mb-6 uppercase tracking-wider text-xs">Navegación</h4>
              <ul className="space-y-2 sm:space-y-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="inline-flex min-h-8 items-center text-muted-foreground hover:text-primary transition-colors text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-8 items-center gap-1.5 text-primary font-semibold hover:text-primary/80 transition-colors text-sm"
                    >
                      <LogIn className="h-4 w-4" />
                      Soy cliente · Entrar
                    </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4 sm:mb-6 uppercase tracking-wider text-xs">Marcas</h4>
                {/*
                  Derived from `brands`, never hand-written: this list was a hard-coded copy and it
                  drifted — for months it kept advertising, on all 7 pages, a brand that had already
                  been archived in the ERP, and it misspelled another one. A silent failure: no error
                  anywhere, and nothing that could ever catch it.
                */}
                <ul className="space-y-2 sm:space-y-4">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <Link to={ROUTE_PATHS.MARCAS} className="inline-flex min-h-8 items-center text-muted-foreground hover:text-primary text-sm transition-colors">
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4 sm:mb-6 uppercase tracking-wider text-xs">Contacto Comercial</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <a href={whatsappLink} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    +{BUSINESS_CONFIG.WHATSAPP_PHONE}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <a href={`mailto:${BUSINESS_CONFIG.EMAIL}`} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {BUSINESS_CONFIG.EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">
                    {BUSINESS_CONFIG.ADDRESS}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-xs text-muted-foreground font-medium">
            <p>© 2026 Acom Trading, C.A. Todos los derechos reservados.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <Link to={ROUTE_PATHS.TERMINOS} className="hover:text-primary transition-colors">Términos y Condiciones</Link>
              <Link to={ROUTE_PATHS.PRIVACIDAD} className="hover:text-primary transition-colors">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp for Mobile */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform"
        aria-label="WhatsApp"
      >
        <MessageSquare className="h-6 w-6" />
      </a>
    </div>
  );
}
