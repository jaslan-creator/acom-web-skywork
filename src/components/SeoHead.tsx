import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { publicRouteByPath, SITE_ORIGIN } from "@/data/publicContent";
import { structuredDataDocumentsForRoute } from "@/lib/structuredData";

export function SeoHead() {
  const location = useLocation();
  const route = publicRouteByPath(location.pathname);

  if (!route) {
    return (
      <Head>
        <title>Página no encontrada | ACOM Trading</title>
        <meta name="description" content="La página solicitada no existe o fue movida." />
        <meta name="robots" content="noindex, follow" />
        {/*
          Representación en Markdown del 404, para el agente que recibió HTML porque no negoció.
          Es descubrimiento, no enrutamiento: el 404 en Markdown lo entrega vercel.json a quien pide
          `Accept: text/markdown`, y esto es lo que le dice a los demás dónde mirar sin adivinar.
        */}
        <link rel="alternate" type="text/markdown" href="/agent/404.md" />
      </Head>
    );
  }

  const canonical = `${SITE_ORIGIN}${route.path}`;
  const socialImage = `${SITE_ORIGIN}${route.image}`;
  // Dos documentos, dos <script>. El primero es la identidad plana; ver structuredData.ts.
  const jsonLdDocuments = structuredDataDocumentsForRoute(route).map((document) =>
    JSON.stringify(document).replace(/</g, "\\u003c"),
  );

  return (
    <Head>
      <title>{route.title}</title>
      <meta name="description" content={route.description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" type="text/markdown" href={route.agentMarkdownPath} />
      <link rel="alternate" type="application/json" href="/agent/site.json" />

      <meta property="og:title" content={route.title} />
      <meta property="og:description" content={route.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="ACOM Trading" />
      <meta property="og:locale" content="es_VE" />
      <meta property="og:image" content={socialImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={route.title} />
      <meta name="twitter:description" content={route.description} />
      <meta name="twitter:image" content={socialImage} />

      {jsonLdDocuments.map((document, index) => (
        // La clave es el índice a propósito: el orden ES el contrato (identidad primero) y la lista
        // tiene largo fijo. Una clave derivada del contenido invitaría a reordenarlos.
        <script key={index} type="application/ld+json">
          {document}
        </script>
      ))}
    </Head>
  );
}
