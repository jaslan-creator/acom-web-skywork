import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Preset aspect ratios; any arbitrary Tailwind aspect-* class is also accepted. */
const RATIO_CLASS: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video", // 16:9
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
  card: "aspect-[4/3]",
};

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Preset key (square|video|wide|portrait|card) or a raw aspect-* class. */
  ratio?: string;
  /** Eager-load above-the-fold images (e.g. hero). Defaults to lazy. */
  priority?: boolean;
  /** CSS object-position, e.g. "center", "top". */
  position?: string;
  wrapperClassName?: string;
  /** Replaces the default "no cargó" placeholder when the image fails. */
  errorFallback?: React.ReactNode;
  /** Notified when the image fails to load, so callers can react (e.g. stop paging). */
  onLoadError?: () => void;
}

/**
 * Responsive image with a color placeholder and fade-in on load.
 * The wrapper reserves space via aspect-ratio to keep layout shift (CLS) at zero.
 *
 * 🚨 Why onError exists. Without it, this component fails SILENTLY: it starts at opacity-0 and
 * only fades in on load, so a 404, a wrong extension or a CSP block leaves a grey rectangle
 * that is indistinguishable from "still loading". A blocked image does not even show the
 * browser's broken-image icon, and CSP blocks do not surface as errors in the Network tab.
 * Every image on this site — local assets, brand logos and the CDN catalog pages — goes
 * through here, so this is the one place that makes those failures visible.
 */
export function Image({
  src,
  alt,
  ratio = "video",
  priority = false,
  position,
  className,
  wrapperClassName,
  errorFallback,
  onLoadError,
  ...props
}: ImageProps) {
  // 🚨 State is keyed BY SRC and derived, not reset in an effect. The obvious version — a
  // `status` state plus `useEffect(() => setStatus("loading"), [src])` to handle a changing
  // source — has a race that was caught in the browser, not by the typecheck: the effect runs
  // AFTER paint, so an image that finishes loading before it does gets its "loaded" clobbered
  // back to "loading" and stays at opacity-0 forever. Fully loaded, correct, and invisible —
  // measured live as complete:true, naturalWidth:1080, opacity:0. Deriving from the src removes
  // the race instead of trying to time around it.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const status = errorSrc === src ? "error" : loadedSrc === src ? "loaded" : "loading";
  const ratioClass = RATIO_CLASS[ratio] ?? ratio;

  return (
    <div className={cn("relative overflow-hidden bg-muted", ratioClass, wrapperClassName)}>
      {status === "error" ? (
        errorFallback ?? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs font-medium">No pudimos cargar esta imagen</span>
          </div>
        )
      ) : (
        <img
          {...props}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => {
            setErrorSrc(src);
            onLoadError?.();
          }}
          style={position ? { objectPosition: position } : undefined}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-700 ease-out",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}
