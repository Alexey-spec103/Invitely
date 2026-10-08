import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { CornerFlourish, cornerFlourishStyles } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
import { CANVAS_DESIGN_WIDTH } from "@/lib/canvas/types";
import { pdfBackgroundColor } from "@/lib/backgroundFills";
import { formatEventDate } from "@/components/paper/formatEventDate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

export interface EnvelopeDocumentProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  /** Defaults to English -- see formatEventDate.ts's own doc comment for
   * why this stays optional rather than required at every call site. */
  locale?: Locale;
  /** The envelope's canvas-designed recipient-facing side -- same opt-in
   * contract as InvitationDocument's frontFrame/backFrame. Takes over the
   * page entirely when present, falls back to the structured return-
   * address/address-hint layout otherwise. Rendered at its own scale
   * (ENVELOPE_WIDTH / CANVAS_DESIGN_WIDTH below), not the shared PDF_SCALE
   * every A5 card uses -- this page is a different physical shape. */
  frame?: CanvasFrame;
}

// Sized to a standard C5 envelope (162 x 229mm), printed landscape — the
// orientation guests actually address it in. This is a decorative front
// panel (print it, trim it, and glue or label it onto a purchased C5
// envelope), not a fold-and-glue die line: getting fold measurements right
// without physically testing a print is a good way to ship something that
// doesn't actually close, so this sticks to what's reliably printable.
const ENVELOPE_WIDTH = 649;
const ENVELOPE_HEIGHT = 459;
// Not the shared CanvasPdfDocument.PDF_SCALE (420/1200, tuned for an A5-
// width page) -- this page is 649pt wide, so a 1200-design-unit-wide frame
// needs its own scale to actually fill it edge to edge.
const ENVELOPE_CANVAS_SCALE = ENVELOPE_WIDTH / CANVAS_DESIGN_WIDTH;

export function EnvelopeDocument({ theme, names, eventDate, locale = DEFAULT_LOCALE, frame }: EnvelopeDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  style.headingFont.forEach(registerCanvasPdfFont);
  style.bodyFont.forEach(registerCanvasPdfFont);
  if (frame) {
    for (const family of collectFontFamilies([frame])) {
      registerCanvasPdfFont(family);
    }
  }

  const styles = StyleSheet.create({
    page: {
      backgroundColor: frame ? pdfBackgroundColor(frame.background) : style.background,
      color: style.text,
      padding: 28,
      display: "flex",
      flexDirection: "column",
    },
    border: {
      position: "absolute",
      top: 14,
      left: 14,
      right: 14,
      bottom: 14,
      borderWidth: 1,
      borderColor: style.accent,
    },
    returnFlourish: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    returnNames: {
      fontFamily: style.headingFont,
      fontSize: 13,
    },
    returnDate: {
      fontFamily: style.bodyFont,
      fontSize: 8,
      letterSpacing: 1,
      marginTop: 2,
      color: style.accent,
    },
    addressArea: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    addressHint: {
      fontFamily: style.bodyFont,
      fontSize: 8,
      letterSpacing: 2,
      color: style.accent,
      textTransform: "uppercase",
    },
    ...cornerFlourishStyles,
  });

  return (
    <Document>
      {frame ? (
        <Page size={[ENVELOPE_WIDTH, ENVELOPE_HEIGHT]} style={{ position: "relative", backgroundColor: styles.page.backgroundColor }}>
          <CanvasPdfFrameContent frame={frame} scale={ENVELOPE_CANVAS_SCALE} />
        </Page>
      ) : (
        <Page size={[ENVELOPE_WIDTH, ENVELOPE_HEIGHT]} style={styles.page}>
          <View style={styles.border} fixed />
          {/* Only bottom-right -- the return address sits top-left, matching
              the on-screen EnvelopeCardPreview's own corners="bottomRightOnly". */}
          <View style={styles.flourishBottomRight} fixed>
            <CornerFlourish color={style.accent} rotate={180} />
          </View>

          <View style={styles.returnFlourish}>
            <Text style={styles.returnNames}>{names.join(" & ")}</Text>
            <Text style={styles.returnDate}>{formatEventDate(eventDate, locale).toUpperCase()}</Text>
          </View>

          <View style={styles.addressArea}>
            <Text style={styles.addressHint}>Guest address</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
