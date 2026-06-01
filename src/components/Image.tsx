import { useState } from "react";
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
}

/**
 * Responsive image with a color placeholder and fade-in on load.
 * The wrapper reserves space via aspect-ratio to keep layout shift (CLS) at zero.
 */
export function Image({
  src,
  alt,
  ratio = "video",
  priority = false,
  position,
  className,
  wrapperClassName,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const ratioClass = RATIO_CLASS[ratio] ?? ratio;

  return (
    <div className={cn("relative overflow-hidden bg-muted", ratioClass, wrapperClassName)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={position ? { objectPosition: position } : undefined}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-700 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
}
