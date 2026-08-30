import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/data/publicContent";
import { ROUTE_PATHS } from "@/lib/index";

/**
 * 404 screen.
 *
 * The SSG build emits this markup as dist/404.html and Vercel serves it for unknown paths with a
 * real 404 status. It deliberately does not print
 * `location.pathname`: a static 404 rendered at /404 and hydrated at /whatever would disagree on
 * its first render. SeoHead supplies `noindex, follow` to every route outside the public manifest.
 *
 * 🚨 The recovery links below are plain <a href>, NEVER react-router <Link>. The router registers
 * PUBLIC_ROUTES + "404" + "*": a <Link to="/llms.txt"> is intercepted by the client router, matches
 * the wildcard and re-renders this very 404 page. The recovery link would recover nothing and
 * nothing would throw. The machine-readable artifacts are static files, not routes.
 *
 * ⚠️ Nothing here may print the literal "/404" — see the AEO gate: a static page rendered at /404
 * and served from another address must not hardcode its own path.
 */
const AGENT_ARTIFACTS = [
  { href: "/sitemap.xml", label: "Mapa del sitio (sitemap.xml)" },
  { href: "/llms.txt", label: "Guía para modelos (llms.txt)" },
  { href: "/agent/site.json", label: "Índice para agentes (JSON)" },
] as const;

const sections = PUBLIC_ROUTES.filter((route) => route.path !== ROUTE_PATHS.HOME);

const NotFound = () => {
  return (
    <section className="min-h-[60vh] bg-background px-4 py-16 sm:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-5xl">
          No encontramos esta página
        </h1>
        <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
          La página solicitada no existe o fue movida.
        </p>
        <Link
          to={ROUTE_PATHS.HOME}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>

        <nav aria-label="Recuperación" className="mt-12 w-full border-t border-border pt-8 text-left">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Secciones del sitio
          </h2>
          <ul className="mb-8 flex flex-wrap gap-x-4 gap-y-2">
            {sections.map((route) => (
              <li key={route.path}>
                <a
                  href={route.path}
                  className="text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                  {route.breadcrumbName}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Contenido legible por máquina
          </h2>
          <ul className="flex flex-col gap-2">
            {AGENT_ARTIFACTS.map((artifact) => (
              <li key={artifact.href}>
                <a
                  href={artifact.href}
                  className="break-words text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                  {artifact.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
};

export default NotFound;
