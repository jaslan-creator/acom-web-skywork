import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, MessageSquare, Phone, Mail, MapPin } from "lucide-react";
import { ROUTE_PATHS, BUSINESS_CONFIG } from "@/lib/index";
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

  const navItems = [
    { label: "Home", path: ROUTE_PATHS.HOME },
    { label: "Marcas", path: ROUTE_PATHS.MARCAS },
    { label: "Cómo Trabajamos", path: ROUTE_PATHS.COMO_TRABAJAMOS },
    { label: "Sobre Acom", path: ROUTE_PATHS.SOBRE_ACOM },
    { label: "Contacto", path: ROUTE_PATHS.CONTACTO },
  ];

  const whatsappLink = `https://wa.me/${BUSINESS_CONFIG.WHATSAPP_PHONE}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-mono tracking-wider">
        PEDIDO MÍNIMO MAYORISTA: ${BUSINESS_CONFIG.MIN_ORDER_USD} USD | DESPACHOS A NIVEL NACIONAL
      </div>

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled
            ? "bg-background/95 backdrop-blur-md py-3 shadow-sm border-border"
            : "bg-background py-5 border-transparent"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
            <img
              src={IMAGES.LOGO_ROJO_8_2}
              alt="Acom Trading Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button asChild className="bg-primary hover:bg-primary/90 rounded-full px-6">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Hablar con un asesor
              </a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "text-lg font-semibold py-2 transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <hr className="border-border my-2" />
              <Button asChild className="w-full bg-primary py-6 text-lg rounded-xl">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Hablar con un asesor
                </a>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <img
                src={IMAGES.LOGO_ROJO_8_2}
                alt="Acom Trading"
                className="h-10 w-auto opacity-90"
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                Importación y distribución mayorista de marcas líderes en Venezuela. 
                Especialistas en artículos escolares, de oficina y hogar.
              </p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  Pedido Mínimo: ${BUSINESS_CONFIG.MIN_ORDER_USD}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Navegación</h4>
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Marcas</h4>
              <ul className="space-y-4">
                <li><Link to={ROUTE_PATHS.MARCAS} className="text-muted-foreground hover:text-primary text-sm transition-colors">Bambary</Link></li>
                <li><Link to={ROUTE_PATHS.MARCAS} className="text-muted-foreground hover:text-primary text-sm transition-colors">Pelikan</Link></li>
                <li><Link to={ROUTE_PATHS.MARCAS} className="text-muted-foreground hover:text-primary text-sm transition-colors">Zanotti</Link></li>
                <li><Link to={ROUTE_PATHS.MARCAS} className="text-muted-foreground hover:text-primary text-sm transition-colors">SanRemo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Contacto Comercial</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <a href={whatsappLink} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    +{BUSINESS_CONFIG.WHATSAPP_PHONE}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">
                    ventas@acomtrading.com
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Map_Pin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">
                    Caracas, Venezuela
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
            <p>© 2026 Acom Trading, C.A. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
              <Link to="#" className="hover:text-primary transition-colors">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp for Mobile */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform"
        aria-label="WhatsApp"
      >
        <MessageSquare className="h-6 w-6" />
      </a>
    </div>
  );
}

// Workaround for icon name discrepancy if MapPin vs Map_Pin
const Map_Pin = MapPin;
