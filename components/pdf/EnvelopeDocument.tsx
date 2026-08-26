import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { Theme } from "@/lib/themes";

export interface EnvelopeDocumentProps {
  theme: Theme;
  names: string[];
  eventDate: string;
}

function formatEventDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Sized to a standard C5 envelope (162 x 229mm), printed landscape — the
// orientation guests actually address it in. This is a decorative front
// panel (print it, trim it, and glue or label it onto a purchased C5
// envelope), not a fold-and-glue die line: getting fold measurements right
// without physically testing a print is a good way to ship something that
// doesn't actually close, so this sticks to what's reliably printable.
const ENVELOPE_WIDTH = 649;
const ENVELOPE_HEIGHT = 459;

export function EnvelopeDocument({ theme, names, eventDate }: EnvelopeDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  registerCanvasPdfFont(style.headingFont);
  registerCanvasPdfFont(style.bodyFont);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: style.background,
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
  });

  return (
    <Document>
      <Page size={[ENVELOPE_WIDTH, ENVELOPE_HEIGHT]} style={styles.page}>
        <View style={styles.border} fixed />

        <View style={styles.returnFlourish}>
          <Text style={styles.returnNames}>{names.join(" & ")}</Text>
          <Text style={styles.returnDate}>{formatEventDate(eventDate).toUpperCase()}</Text>
        </View>

        <View style={styles.addressArea}>
          <Text style={styles.addressHint}>Guest address</Text>
        </View>
      </Page>
    </Document>
  );
}
