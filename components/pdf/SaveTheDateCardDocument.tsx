import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { CornerFlourish, cornerFlourishStyles } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
import { formatEventDate } from "@/components/paper/formatEventDate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

export interface SaveTheDateCardDocumentProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  locale?: Locale;
  /** Canvas-designed save-the-date card -- same opt-in contract as
   * EnvelopeDocument's `frame`. The border and corner flourish always
   * render (see below); only the text layer swaps out when a host
   * customizes this card. */
  frame?: CanvasFrame;
}

export function SaveTheDateCardDocument({
  theme,
  names,
  eventDate,
  locale = DEFAULT_LOCALE,
  frame,
}: SaveTheDateCardDocumentProps) {
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
      // corner flourish always render (same reasoning as EnvelopeDocument),
      // so the frame's own background is set to transparent for exactly
      // this reason (see createSaveTheDateCanvasSeed).
      backgroundColor: style.background,
      color: style.text,
      padding: 48,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
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
    eyebrow: {
      fontFamily: style.bodyFont,
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: style.accent,
      textAlign: "center",
      marginBottom: 10,
    },
    names: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 24,
      textAlign: "center",
      marginBottom: 6,
    },
    date: {
      fontFamily: style.bodyFont,
      fontSize: 13,
      letterSpacing: 1,
      textAlign: "center",
      marginBottom: 18,
    },
    note: {
      fontFamily: style.bodyFont,
      fontSize: 9,
      textAlign: "center",
      color: style.text,
    },
    ...cornerFlourishStyles,
  });

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.border} fixed />
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
            <Text style={styles.eyebrow}>Save the date</Text>
            <Text style={styles.names}>{names.join(" & ")}</Text>
            <Text style={styles.date}>{formatEventDate(eventDate, locale)}</Text>
            <Text style={styles.note}>Formal invitation to follow</Text>
          </>
        )}
      </Page>
    </Document>
  );
}
