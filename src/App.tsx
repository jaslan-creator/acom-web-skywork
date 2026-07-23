import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";

const Home = lazy(() => import("@/pages/Home"));
const Marcas = lazy(() => import("@/pages/Marcas"));
const ComoTrabajamos = lazy(() => import("@/pages/ComoTrabajamos"));
const SobreAcom = lazy(() => import("@/pages/SobreAcom"));
const Contacto = lazy(() => import("@/pages/Contacto"));
const Terminos = lazy(() => import("@/pages/Terminos"));
const Privacidad = lazy(() => import("@/pages/Privacidad"));
const NotFound = lazy(() => import("@/pages/not-found/Index"));

const routeFallback = (
  <div className="min-h-[60vh] bg-background" aria-label="Cargando contenido" />
);

/**
 * Setup React Query Client with default settings
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * Main Application Component
 * Configures the routing architecture and global providers for Acom Trading (2026).
 * Wraps all institutional pages within the standard B2B Layout.
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Layout>
            <Suspense fallback={routeFallback}>
              <Routes>
                <Route
                  path={ROUTE_PATHS.HOME}
                  element={<Home />}
                />
                <Route
                  path={ROUTE_PATHS.MARCAS}
                  element={<Marcas />}
                />
                <Route
                  path={ROUTE_PATHS.COMO_TRABAJAMOS}
                  element={<ComoTrabajamos />}
                />
                <Route
                  path={ROUTE_PATHS.SOBRE_ACOM}
                  element={<SobreAcom />}
                />
                <Route
                  path={ROUTE_PATHS.CONTACTO}
                  element={<Contacto />}
                />
                <Route
                  path={ROUTE_PATHS.TERMINOS}
                  element={<Terminos />}
                />
                <Route
                  path={ROUTE_PATHS.PRIVACIDAD}
                  element={<Privacidad />}
                />
                <Route
                  path="*"
                  element={<NotFound />}
                />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
