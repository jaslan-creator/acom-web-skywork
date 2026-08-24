import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { publicRouteByPath, SITE_ORIGIN } from "@/data/publicContent";
import { structuredDataForRoute } from "@/lib/structuredData";

export function SeoHead() {
  const location = useLocation();
  const route = publicRouteByPath(location.pathname);

  if (!route) {
    return (
      <Head>
        <title>Página no encontrada | ACOM Trading</title>
        <meta name="description" content="La página solicitada no existe o fue movida." />
        <meta name="robots" content="noindex, follow" />
      </Head>
    );
  }

  const canonical = `${SITE_ORIGIN}${route.path}`;
  const socialImage = `${SITE_ORIGIN}${route.image}`;
  const jsonLd = JSON.stringify(structuredDataForRoute(route)).replace(/</g, "\\u003c");

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

      <script type="application/ld+json">{jsonLd}</script>
    </Head>
  );
}
