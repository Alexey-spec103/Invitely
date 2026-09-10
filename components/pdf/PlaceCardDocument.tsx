import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { PdfWatermark } from "./PdfWatermark";
import type { Theme } from "@/lib/themes";

export interface PlaceCardDocumentProps {
  theme: Theme;
  guestNames: string[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium. */
  locked?: boolean;
}

// A folded place-card size (~3.5in x 2in per half), landscape.
const CARD_SIZE: [number, number] = [252, 144];

export function PlaceCardDocument({ theme, guestNames, locked }: PlaceCardDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  registerCanvasPdfFont(style.headingFont);
  registerCanvasPdfFont(style.bodyFont);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: style.background,
      color: style.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
    },
    guestName: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 18,
      textAlign: "center",
      color: style.accent,
    },
  });

  return (
    <Document>
      {guestNames.map((name, index) => (
        <Page key={`${name}-${index}`} size={CARD_SIZE} style={styles.page}>
          <Text style={styles.guestName}>{name}</Text>
          {locked && <PdfWatermark repeat={8} fontSize={7} />}
        </Page>
      ))}
    </Document>
  );
}
