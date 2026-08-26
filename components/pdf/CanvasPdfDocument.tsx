import { Document, Page, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { CanvasFrame, CanvasElement } from "@/lib/canvas/types";

export interface CanvasPdfDocumentProps {
  frames: CanvasFrame[];
}

// Canvas frames are authored at CANVAS_DESIGN_WIDTH (1200 design units) —
// far too large for a printed page as-is. Scaling by this factor brings a
// 1200-wide frame down to exactly A5 width (420pt / 148mm), matching the
// page size the structured InvitationDocument already prints at, so a
// canvas-designed invitation and a structured one come out a comparable
// physical size.
const PDF_SCALE = 420 / 1200;

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
      backgroundColor: frame.background.color || "#ffffff",
      position: "relative",
    },
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
    <Page size={[width, height]} style={styles.page}>
      {frame.background.imageUrl && (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img; it has no alt prop
        <Image src={frame.background.imageUrl} style={styles.backgroundImage} />
      )}
      {sortedElements.map((element) => (
        <CanvasPdfElement key={element.id} element={element} />
      ))}
    </Page>
  );
}

function CanvasPdfElement({ element }: { element: CanvasElement }) {
  const positionStyle = {
    position: "absolute" as const,
    left: element.x * PDF_SCALE,
    top: element.y * PDF_SCALE,
    width: element.width * PDF_SCALE,
    height: element.height * PDF_SCALE,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  };

  if (element.type === "text") {
    return (
      <Text
        style={{
          ...positionStyle,
          fontFamily: element.fontFamily,
          fontSize: element.fontSize * PDF_SCALE,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing ? element.letterSpacing * PDF_SCALE : undefined,
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

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img; it has no alt prop
    <Image
      src={element.imageUrl}
      style={{
        ...positionStyle,
        objectFit: element.objectFit,
        borderRadius: element.borderRadius ? element.borderRadius * PDF_SCALE : undefined,
      }}
    />
  );
}
