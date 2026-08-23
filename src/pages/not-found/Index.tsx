import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";

/**
 * 404 screen.
 *
 * 🚨 This route still answers HTTP **200**, and that is a real SEO problem, not a nitpick. The SPA
 * rewrite in vercel.json sends every unknown path to index.html, so `/linea-credito` — a page that
 * was deleted — and any mistyped URL someone shares come back as valid documents. Google calls this
 * a soft 404 and penalises it: instead of dropping the dead page it keeps it indexed.
 *
 * The robots meta below is what stops that: Google renders the JS before indexing, sees `noindex`
 * and drops the URL. It is injected imperatively because this project has no head management at
 * all (no react-helmet, no SSR) and adding one for a single tag is not worth the dependency.
 *
 * ⚠️ Limitation, stated rather than hidden: this does NOT turn the response into a 404. Serving a
 * real 404 would mean enumerating every route in vercel.json and losing this branded screen.
 * The known dead URL is handled properly, with a 301 redirect in vercel.json.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, follow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

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
          La ruta <span className="font-mono text-foreground">{location.pathname}</span> no existe o fue movida.
        </p>
        <Link
          to={ROUTE_PATHS.HOME}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
