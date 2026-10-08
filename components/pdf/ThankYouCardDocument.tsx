import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { CornerFlourish, cornerFlourishStyles } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";

export interface ThankYouCardDocumentProps {
  theme: Theme;
  names: string[];
  /** Canvas-designed thank-you card -- same opt-in contract as
   * SaveTheDateCardDocument's `frame`. The border and corner flourish
   * always render; only the text layer swaps out when a host customizes
   * this card. */
  frame?: CanvasFrame;
}

export function ThankYouCardDocument({ theme, names, frame }: ThankYouCardDocumentProps) {
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
    title: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 26,
      textAlign: "center",
      marginBottom: 16,
    },
    message: {
      fontFamily: style.bodyFont,
      fontSize: 11,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 1.4,
      marginBottom: 18,
      color: style.text,
    },
    names: {
      fontFamily: style.headingFont,
      fontSize: 14,
      letterSpacing: 1,
      textAlign: "center",
      color: style.accent,
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
            <Text style={styles.title}>Thank You</Text>
            <Text style={styles.message}>
              Thank you for celebrating with us -- your presence meant more than words can say.
            </Text>
            <Text style={styles.names}>{names.join(" & ")}</Text>
          </>
        )}
      </Page>
    </Document>
  );
}
