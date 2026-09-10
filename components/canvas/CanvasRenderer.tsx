import type { CSSProperties } from "react";
import { QrCode } from "lucide-react";
import type { CanvasFrame, CanvasElement } from "@/lib/canvas/types";
import { canvasFontStylesheetUrl } from "@/lib/canvas/fonts";
import BackgroundLayer from "@/components/background/BackgroundLayer";
import AnimatedCanvasElement from "./AnimatedCanvasElement";
import styles from "./CanvasRenderer.module.css";

interface CanvasRendererProps {
  frames: CanvasFrame[];
}

function collectFontFamilies(frames: CanvasFrame[]): string[] {
  const families = new Set<string>();
  for (const frame of frames) {
    for (const element of frame.elements) {
      if (element.type === "text") {
        families.add(element.fontFamily);
      }
    }
  }
  return Array.from(families);
}

/** Read-only renderer: each frame is authored at a fixed design width and
 * uniform-scaled to fit the real viewport via CSS container query units, so
 * elements keep their relative layout on any screen size without a separate
 * mobile design pass. See Phase 7 plan for why this is plain CSS/DOM rather
 * than a canvas/bitmap library — it lets the exact same frame JSON later
 * drive the PDF renderer too. */
export default function CanvasRenderer({ frames }: CanvasRendererProps) {
  const fontFamilies = collectFontFamilies(frames);

  return (
    <>
      {fontFamilies.map((family) => (
        <link key={family} rel="stylesheet" href={canvasFontStylesheetUrl(family)} />
      ))}
      {frames.map((frame) => (
        <div
          key={frame.id}
          className={styles.frameOuter}
          style={{
            aspectRatio: `${frame.width} / ${frame.height}`,
            backgroundColor: frame.background.color,
            backgroundImage: frame.background.imageUrl ? `url(${frame.background.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <BackgroundLayer fill={frame.background.fill} />
          <div
            className={styles.frameInner}
            style={{
              width: frame.width,
              height: frame.height,
              transform: `scale(calc(100cqw / ${frame.width}px))`,
            }}
          >
            {frame.elements
              .filter((element) => !element.hidden)
              .map((element) => (
                <CanvasElementView key={element.id} element={element} />
              ))}
          </div>
        </div>
      ))}
    </>
  );
}

function CanvasElementView({ element }: { element: CanvasElement }) {
  const className = element.desktopOnly ? `${styles.element} ${styles.desktopOnly}` : styles.element;
  const baseStyle: CSSProperties = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
  };

  const content =
    element.type === "text" ? (
      <span
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          fontFamily: element.fontFamily,
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing,
          whiteSpace: "pre-wrap",
        }}
      >
        {element.text}
      </span>
    ) : element.type === "image" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={element.imageUrl}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: element.objectFit,
          borderRadius: element.borderRadius,
          filter: element.filter,
        }}
      />
    ) : element.type === "video" ? (
      <video
        src={element.videoUrl}
        muted
        loop
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: element.objectFit,
          borderRadius: element.borderRadius,
        }}
      />
    ) : (
      // A live public canvas page has no per-guest context to resolve this
      // against (that only exists for the print/PDF export -- see
      // resolveCanvasQrElements), so it's a placeholder here too rather than
      // a real, scannable code.
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          border: "1px dashed rgba(0,0,0,0.3)",
          color: "rgba(0,0,0,0.5)",
        }}
      >
        <QrCode style={{ width: "40%", height: "40%" }} aria-hidden="true" />
        {element.caption && <span style={{ fontSize: 10 }}>{element.caption}</span>}
      </div>
    );

  if (element.animationDuration) {
    // `rotate` as a bare degrees number (not a `transform` string) is a
    // framer-motion-specific style shorthand -- motion components compose
    // it with their own x/y animation into one transform internally, which
    // a raw `transform` string here would otherwise fight with.
    return (
      <AnimatedCanvasElement
        duration={element.animationDuration}
        style={{ ...baseStyle, rotate: element.rotation || undefined }}
        className={className}
      >
        {content}
      </AnimatedCanvasElement>
    );
  }

  return (
    <div
      className={className}
      style={{ ...baseStyle, transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined }}
    >
      {content}
    </div>
  );
}
