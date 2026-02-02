import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Marcas from "@/pages/Marcas";
import ComoTrabajamos from "@/pages/ComoTrabajamos";
import SobreAcom from "@/pages/SobreAcom";
import Contacto from "@/pages/Contacto";

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
              {/* Catch-all route redirecting to Home to maintain B2B lead generation flow */}
              <Route 
                path="*" 
                element={<Home />} 
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
