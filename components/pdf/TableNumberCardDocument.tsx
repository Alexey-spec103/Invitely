import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { PdfWatermark } from "./PdfWatermark";
import type { Theme } from "@/lib/themes";

export interface TableNumberCardDocumentProps {
  theme: Theme;
  tableNames: string[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium. */
  locked?: boolean;
}

// A freestanding table-number placard -- just the table's name/number, large
// and centered, meant to stand on the table itself. Distinct from
// TableCardDocument (table name + its seated guests, for a seating chart).
const CARD_SIZE: [number, number] = [288, 288];

export function TableNumberCardDocument({ theme, tableNames, locked }: TableNumberCardDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  registerCanvasPdfFont(style.headingFont);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: style.background,
      color: style.text,
      padding: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    border: {
      position: "absolute",
      top: 16,
      left: 16,
      right: 16,
      bottom: 16,
      borderWidth: 1,
      borderColor: style.accent,
    },
    tableName: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 44,
      textAlign: "center",
    },
  });

  return (
    <Document>
      {tableNames.map((name) => (
        <Page key={name} size={CARD_SIZE} style={styles.page}>
          <View style={styles.border} fixed />
          <Text style={styles.tableName}>{name}</Text>
          {locked && <PdfWatermark repeat={14} fontSize={9} />}
        </Page>
      ))}
    </Document>
  );
}
