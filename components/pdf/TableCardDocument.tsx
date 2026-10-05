import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { PdfWatermark } from "./PdfWatermark";
import { CornerFlourish, cornerFlourishStyles } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";

export interface TableCardData {
  name: string;
  guestNames: string[];
}

export interface TableCardDocumentProps {
  theme: Theme;
  tables: TableCardData[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium. */
  locked?: boolean;
}

export function TableCardDocument({ theme, tables, locked }: TableCardDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  style.headingFont.forEach(registerCanvasPdfFont);
  style.bodyFont.forEach(registerCanvasPdfFont);

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
    tableName: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 32,
      textAlign: "center",
    },
    divider: {
      width: 40,
      height: 1,
      backgroundColor: style.accent,
      marginVertical: 18,
    },
    guestName: {
      fontFamily: style.bodyFont,
      fontSize: 13,
      textAlign: "center",
      marginTop: 6,
    },
    ...cornerFlourishStyles,
  });

  return (
    <Document>
      {tables.map((table) => (
        <Page key={table.name} size="A5" style={styles.page}>
          <View style={styles.border} fixed />
          <View style={styles.flourishTopLeft} fixed>
            <CornerFlourish color={style.accent} />
          </View>
          <View style={styles.flourishBottomRight} fixed>
            <CornerFlourish color={style.accent} rotate={180} />
          </View>
          <Text style={styles.tableName}>{table.name}</Text>
          <View style={styles.divider} />
          {table.guestNames.map((name) => (
            <Text key={name} style={styles.guestName}>
              {name}
            </Text>
          ))}
          {locked && <PdfWatermark repeat={28} />}
        </Page>
      ))}
    </Document>
  );
}
