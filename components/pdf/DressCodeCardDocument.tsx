import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { CornerFlourish, cornerFlourishStyles } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
import { pdfBackgroundColor } from "@/lib/backgroundFills";

export interface DressCodeCardColor {
  hex: string;
  label?: string;
}

export interface DressCodeCardDocumentProps {
  theme: Theme;
  title: string;
  description?: string;
  colors: DressCodeCardColor[];
  /** Canvas-designed dress-code card -- same opt-in contract as
   * InvitationDocument's frontFrame. Takes over the page entirely when
   * present (including the color swatches, which the canvas editor has no
   * dedicated element for -- a host customizing this is writing their own
   * wording, same as the on-screen DressCodeCardPreview's own swap to
   * CanvasRenderer), falls back to the structured title/description/
   * swatches layout otherwise. Same A5 page as the invitation. */
  frame?: CanvasFrame;
}

export function DressCodeCardDocument({ theme, title, description, colors, frame }: DressCodeCardDocumentProps) {
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
      fontSize: 22,
      textAlign: "center",
      marginBottom: 12,
    },
    description: {
      fontFamily: style.bodyFont,
      fontSize: 10,
      textAlign: "center",
      maxWidth: 280,
      marginBottom: 24,
      color: style.text,
    },
    swatchRow: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 20,
    },
    swatchColumn: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: 64,
    },
    swatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: style.accent,
    },
    swatchLabel: {
      fontFamily: style.bodyFont,
      fontSize: 8,
      marginTop: 6,
      textAlign: "center",
      color: style.text,
    },
    ...cornerFlourishStyles,
  });

  return (
    <Document>
      {frame ? (
        <Page size="A5" style={{ position: "relative", backgroundColor: styles.page.backgroundColor }}>
          <CanvasPdfFrameContent frame={frame} />
        </Page>
      ) : (
        <Page size="A5" style={styles.page}>
          <View style={styles.border} fixed />
          <View style={styles.flourishTopLeft} fixed>
            <CornerFlourish color={style.accent} />
          </View>
          <View style={styles.flourishBottomRight} fixed>
            <CornerFlourish color={style.accent} rotate={180} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}

          <View style={styles.swatchRow}>
            {colors.map((color, index) => (
              <View key={index} style={styles.swatchColumn}>
                <View style={{ ...styles.swatch, backgroundColor: color.hex }} />
                {color.label && <Text style={styles.swatchLabel}>{color.label}</Text>}
              </View>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
}
