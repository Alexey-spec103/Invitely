import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { PdfWatermark } from "./PdfWatermark";
import { CornerFlourish } from "./CornerFlourish";
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
  style.headingFont.forEach(registerCanvasPdfFont);
  style.bodyFont.forEach(registerCanvasPdfFont);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: style.background,
      color: style.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
    },
    // Same thin accent frame TableCardDocument/TableNumberCardDocument
    // already print -- place cards were the one printed piece with zero
    // decoration. Smaller inset than the table card's 24pt, scaled to this
    // card's much smaller 252x144 size.
    border: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
      borderWidth: 1,
      borderColor: style.accent,
    },
    guestName: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 18,
      textAlign: "center",
      color: style.accent,
    },
    // Tighter inset and a smaller flourish than the other documents' shared
    // 16pt/40pt default -- this card is only 252x144pt, a full-size sprig
    // would crowd the single line of text (same reasoning already applied
    // to CardCornerDecor's on-screen PlaceCardPreview sizing).
    flourishTopLeft: { position: "absolute", top: 8, left: 8 },
    flourishBottomRight: { position: "absolute", bottom: 8, right: 8 },
  });

  return (
    <Document>
      {guestNames.map((name, index) => (
        <Page key={`${name}-${index}`} size={CARD_SIZE} style={styles.page}>
          <View style={styles.border} fixed />
          <View style={styles.flourishTopLeft} fixed>
            <CornerFlourish color={style.accent} size={20} />
          </View>
          <View style={styles.flourishBottomRight} fixed>
            <CornerFlourish color={style.accent} rotate={180} size={20} />
          </View>
          <Text style={styles.guestName}>{name}</Text>
          {locked && <PdfWatermark repeat={8} fontSize={7} color={style.text} />}
        </Page>
      ))}
    </Document>
  );
}
