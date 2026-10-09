import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { CornerFlourish, cornerFlourishStyles } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
export interface ProgramCardEvent {
  time: string;
  title: string;
  description?: string;
}

export interface ProgramCardDocumentProps {
  theme: Theme;
  title?: string;
  events: ProgramCardEvent[];
  /** Canvas-designed order-of-events card -- same opt-in contract as
   * InvitationDocument's frontFrame. Takes over the page entirely when
   * present, falls back to the structured time/title/description layout
   * otherwise. Same A5 page/scale as the invitation, so the shared
   * PDF_SCALE (CanvasPdfFrameContent's default) applies unchanged. */
  frame?: CanvasFrame;
}

export function ProgramCardDocument({ theme, title, events, frame }: ProgramCardDocumentProps) {
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
      // Always the theme's own background, not `frame`'s -- the border and
      // corner flourish now always render (see below), so this page's
      // background is never fully owned by the canvas frame the way other
      // canvas-backed PDF pages' are; the frame's own background is set to
      // transparent for exactly this reason (see createProgramCanvasSeed).
      backgroundColor: style.background,
      color: style.text,
      padding: 48,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    border: {
      position: "absolute",
      top: 24,
      left: 24,
      right: 24,
      bottom: 24,
      borderWidth: 1,
      borderColor: style.accent,
    },
    title: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 22,
      textAlign: "center",
      marginBottom: 28,
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      width: "100%",
      marginBottom: 16,
    },
    time: {
      fontFamily: style.bodyFont,
      fontSize: 11,
      letterSpacing: 1,
      color: style.accent,
      width: 64,
    },
    eventBody: {
      flex: 1,
    },
    eventTitle: {
      fontFamily: style.headingFont,
      fontSize: 13,
    },
    eventDescription: {
      fontFamily: style.bodyFont,
      fontSize: 9,
      marginTop: 2,
      color: style.text,
    },
    ...cornerFlourishStyles,
  });

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.border} fixed />
        {/* Kept outside the `frame` branch below -- was previously INSIDE a
            `frame ? ... : ...` split that replaced this whole page, border
            and flourishes included, the instant a host customized the text.
            Same real bug fixed on-screen in ProgramCardPreview.tsx and in
            the PDF for EnvelopeDocument.tsx, for the same reason: the canvas
            data model has no decorative-shape element type to carry this
            chrome itself, so it has to keep living here, with only the
            content layer swapped out under it. */}
        <View style={styles.flourishTopLeft} fixed>
          <CornerFlourish color={style.accent} />
        </View>
        <View style={styles.flourishBottomRight} fixed>
          <CornerFlourish color={style.accent} rotate={180} />
        </View>

        {frame ? (
          <CanvasPdfFrameContent frame={frame} />
        ) : (
          <>
            <Text style={styles.title}>{title || "Order of the day"}</Text>

            {events.map((event, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.time}>{event.time}</Text>
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
