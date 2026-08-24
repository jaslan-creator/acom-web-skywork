# AEO y Agent Readiness — implementación 2026-08-24

## Objetivo

Hacer que el contenido comercial público de ACOM sea legible sin JavaScript, inequívoco para motores de respuesta y accesible mediante representaciones compactas, sin exponer los controles internos del formulario ni fingir capacidades transaccionales.

## Implementado

1. Un manifiesto tipado (`src/data/publicContent.ts`) define las diez rutas públicas, metadata, texto crítico y salidas para agentes.
2. `vite-react-ssg` prerenderiza esas rutas y un `404.html`; Vercel sirve archivos con URL limpia y conserva el estado HTTP 404 para rutas inexistentes.
3. Cada ruta publica `title`, descripción, canonical, Open Graph, Twitter Card, alternate Markdown y un grafo JSON-LD específico.
4. La nueva página de preguntas frecuentes usa HTML nativo y `FAQPage`; Marcas incluye una tabla comparativa con encabezados y alcance claros.
5. El build deriva del mismo manifiesto `llms.txt`, `agent/site.json`, diez páginas Markdown, `robots.txt` y `sitemap.xml`.
6. El JSON público declara de forma explícita que no admite leads ni checkout por agentes. No incluye la ruta de captación, Turnstile ni modelos internos.
7. El gate `verificar-aeo.mjs` comprueba sobre `dist/` HTML prerenderizado, metadata única, JSON-LD válido, representaciones compactas, sitemap, robots y 404.

## Decisiones y desviaciones deliberadas

- No se detecta el `User-Agent` para cambiar el contenido. Las rutas HTML y las representaciones para agentes son públicas, enlazadas y coherentes; así se evita cloaking y divergencia de datos.
- No se añadió un OpenAPI ni endpoints por página. Para el alcance actual bastan un índice JSON, Markdown por ruta y `llms.txt`, con menor superficie de mantenimiento.
- No se publica esquema `Product` u `Offer`: el sitio no ofrece inventario ni precios verificables. El catálogo se describe como `CreativeWork` y las marcas como una lista pública.
- La FAQ se enlaza desde Inicio, Cómo trabajamos, footer y sitemap, pero no ocupa un séptimo elemento en la navegación principal.
- El checkout M2M y HTTP 402 quedan como contrato futuro en `docs/agent-payments-future.md`; activarlos sin proveedor, autenticación, conciliación y aprobación humana sería una capacidad falsa y riesgosa.

## Criterios de aceptación

- `npm run build` termina en verde y ejecuta todos los gates.
- Las diez rutas contienen texto crítico, un solo `h1`, canonical, metadata social y JSON-LD en el HTML generado.
- `/agent/site.json` no expone escritura, checkout ni detalles de la API de leads.
- Una ruta inexistente entrega `404.html` con `noindex` y estado HTTP 404 en producción.

Este repositorio no contiene un `CHANGELOG.md` ni un sistema interno de novedades/ayuda que corresponda actualizar para este cambio.
