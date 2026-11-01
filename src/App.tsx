import type { ComponentType } from "react";
import type { RouteRecord } from "vite-react-ssg";

import { AppShell } from "@/components/AppShell";
import { PUBLIC_ROUTES, type PublicRouteId } from "@/data/publicContent";
import { CATALOGS, type Catalog } from "@/lib/index";

type RouteModule = { Component: ComponentType };
type RouteLoader = () => Promise<RouteModule>;

/** One viewer route per published catalog, each bound to its own catalog. */
const catalogLoader =
  (catalog: Catalog): RouteLoader =>
  async () => {
    const { default: CatalogoVisor } = await import("@/pages/CatalogoVisor");
    return { Component: () => <CatalogoVisor catalog={catalog} /> };
  };

const catalogLoaders = Object.fromEntries(
  CATALOGS.map((catalog) => [`catalogo-${catalog.id}`, catalogLoader(catalog)]),
) as Record<`catalogo-${Catalog["id"]}`, RouteLoader>;

const pageLoaders: Record<PublicRouteId, RouteLoader> = {
  ...catalogLoaders,
  home: async () => ({ Component: (await import("@/pages/Home")).default }),
  marcas: async () => ({ Component: (await import("@/pages/Marcas")).default }),
  catalogo: async () => ({ Component: (await import("@/pages/Catalogo")).default }),
  "como-trabajamos": async () => ({ Component: (await import("@/pages/ComoTrabajamos")).default }),
  "sobre-acom": async () => ({ Component: (await import("@/pages/SobreAcom")).default }),
  "abrir-cuenta": async () => ({ Component: (await import("@/pages/AbrirCuenta")).default }),
  contacto: async () => ({ Component: (await import("@/pages/Contacto")).default }),
  faq: async () => ({ Component: (await import("@/pages/PreguntasFrecuentes")).default }),
  terminos: async () => ({ Component: (await import("@/pages/Terminos")).default }),
  privacidad: async () => ({ Component: (await import("@/pages/Privacidad")).default }),
};

const publicChildren: RouteRecord[] = PUBLIC_ROUTES.map((route) =>
  route.path === "/"
    ? { index: true, lazy: pageLoaders[route.id] }
    : { path: route.path.slice(1), lazy: pageLoaders[route.id] },
);

const notFound = async () => ({ Component: (await import("@/pages/not-found/Index")).default });

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppShell />,
    entry: "src/components/AppShell.tsx",
    children: [
      ...publicChildren,
      { path: "404", lazy: notFound },
      { path: "*", lazy: notFound },
    ],
  },
];

export default routes;
