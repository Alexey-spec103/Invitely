import { Document, Page, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { CanvasFrame, CanvasElement } from "@/lib/canvas/types";
import { pdfBackgroundColor } from "@/lib/backgroundFills";
import { canvasFontFamiliesFor } from "@/lib/canvas/fonts";

export interface CanvasPdfDocumentProps {
  frames: CanvasFrame[];
}

// Canvas frames are authored at CANVAS_DESIGN_WIDTH (1200 design units) —
// far too large for a printed page as-is. Scaling by this factor brings a
// 1200-wide frame down to exactly A5 width (420pt / 148mm), matching the
// page size the structured InvitationDocument already prints at, so a
// canvas-designed invitation and a structured one come out a comparable
// physical size. Exported so other documents that embed a single canvas
// frame inside an otherwise-structured page (InvitationDocument's canvas
// back side) size and register fonts the same way.
export const PDF_SCALE = 420 / 1200;

export function collectFontFamilies(frames: CanvasFrame[]): string[] {
  const families = new Set<string>();
  for (const frame of frames) {
    for (const element of frame.elements) {
      if (element.type === "text") {
        // Also register each family's Cyrillic-capable fallback -- most of
        // the curated catalog has zero Cyrillic glyphs in its own font file
        // (see lib/canvas/fonts.ts), and unlike a browser, react-pdf only
        // substitutes glyphs across the exact families it's told about via
        // the Text style's fontFamily array below -- an unregistered
        // fallback would just render missing Cyrillic glyphs as nothing.
        canvasFontFamiliesFor(element.fontFamily).forEach((f) => families.add(f));
      }
    }
  }
  return Array.from(families);
}

export function CanvasPdfDocument({ frames }: CanvasPdfDocumentProps) {
  registerPdfFonts();
  for (const family of collectFontFamilies(frames)) {
    registerCanvasPdfFont(family);
  }

  return (
    <Document>
      {frames.map((frame) => (
        <CanvasPdfPage key={frame.id} frame={frame} />
      ))}
    </Document>
  );
}

function CanvasPdfPage({ frame }: { frame: CanvasFrame }) {
  const width = frame.width * PDF_SCALE;
  const height = frame.height * PDF_SCALE;

  const styles = StyleSheet.create({
    page: {
      width,
      height,
      backgroundColor: pdfBackgroundColor(frame.background),
      position: "relative",
    },
  });

  return (
    <Page size={[width, height]} style={styles.page}>
      <CanvasPdfFrameContent frame={frame} />
    </Page>
  );
}

/** Just the paintable content of a canvas frame (background image + sorted
 * elements), at PDF_SCALE by default, with no `<Page>` of its own -- lets a
 * page that isn't otherwise canvas-driven (InvitationDocument's canvas-
 * designed back/front sides) embed one frame's design inside a `<Page>` it
 * already controls the size/background-color of. `scale` is only ever
 * overridden for a physically non-A5 page -- EnvelopeDocument's 649x459pt
 * landscape panel can't use PDF_SCALE (which assumes a 420pt-wide page);
 * it passes its own `ENVELOPE_WIDTH / CANVAS_DESIGN_WIDTH` instead so a
 * 1200-design-unit-wide frame fills the actual envelope width. */
export function CanvasPdfFrameContent({ frame, scale = PDF_SCALE }: { frame: CanvasFrame; scale?: number }) {
  const width = frame.width * scale;
  const height = frame.height * scale;

  const styles = StyleSheet.create({
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width,
      height,
      objectFit: "cover",
    },
  });

  const sortedElements = frame.elements
    .filter((element) => !element.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {frame.background.imageUrl && (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img; it has no alt prop
        <Image src={frame.background.imageUrl} style={styles.backgroundImage} />
      )}
      {sortedElements.map((element) => (
        <CanvasPdfElement key={element.id} element={element} scale={scale} />
      ))}
    </>
  );
}

export function CanvasPdfElement({ element, scale = PDF_SCALE }: { element: CanvasElement; scale?: number }) {
  const positionStyle = {
    position: "absolute" as const,
    left: element.x * scale,
    top: element.y * scale,
    width: element.width * scale,
    height: element.height * scale,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  };

  if (element.type === "text") {
    return (
      <Text
        style={{
          ...positionStyle,
          // react-pdf picks, per glyph, the first family in this list that
          // actually has it -- same per-character fallback a browser does
          // automatically, which this needs to opt into explicitly.
          fontFamily: canvasFontFamiliesFor(element.fontFamily),
          fontSize: element.fontSize * scale,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing ? element.letterSpacing * scale : undefined,
        }}
      >
        {element.text}
      </Text>
    );
  }

  // Paper can't play video -- same "just skip it" treatment this file
  // already gives desktopOnly/animationDuration (both silently ignored,
  // not an error).
  if (element.type === "video") {
    return null;
  }

  // A qr element should always have been swapped for a real, scannable
  // `image` element by resolveCanvasQrElements before frames reach this
  // component (it needs the target guest/site URL, which this component
  // has no way to know) -- if one slips through unresolved, skip it rather
  // than crash or print a meaningless blank image.
  if (element.type === "qr") {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img; it has no alt prop
    <Image
      src={element.imageUrl}
      style={{
        ...positionStyle,
        objectFit: element.objectFit,
        borderRadius: element.borderRadius ? element.borderRadius * scale : undefined,
      }}
    />
  );
}
