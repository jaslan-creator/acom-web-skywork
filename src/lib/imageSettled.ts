/**
 * ¿La imagen ya se resolvió antes de que React la escuchara?
 *
 * 🚨 Existe por la hidratación. El sitio llega pre-renderizado: el `<img>` está en el HTML y el
 * navegador lo descarga antes de que React se conecte. Si termina primero —medido en producción:
 * carga a los 161 ms, React se conecta a los 264 ms—, el evento `load` ya pasó, React no lo
 * repite, y `<Image>` se queda en opacity-0 para siempre con la foto descargada.
 *
 * `null` = todavía en camino: decide el `onLoad`/`onError` de siempre.
 */
export function settledStatus(img: { complete: boolean; naturalWidth: number }): "loaded" | "error" | null {
  if (!img.complete) return null;
  return img.naturalWidth > 0 ? "loaded" : "error";
}
