import { Link, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";

const NotFound = () => {
  const location = useLocation();

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
