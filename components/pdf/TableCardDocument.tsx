import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { Theme } from "@/lib/themes";

export interface TableCardData {
  name: string;
  guestNames: string[];
}

export interface TableCardDocumentProps {
  theme: Theme;
  tables: TableCardData[];
}

export function TableCardDocument({ theme, tables }: TableCardDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  registerCanvasPdfFont(style.headingFont);
  registerCanvasPdfFont(style.bodyFont);

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
  });

  return (
    <Document>
      {tables.map((table) => (
        <Page key={table.name} size="A5" style={styles.page}>
          <View style={styles.border} fixed />
          <Text style={styles.tableName}>{table.name}</Text>
          <View style={styles.divider} />
          {table.guestNames.map((name) => (
            <Text key={name} style={styles.guestName}>
              {name}
            </Text>
          ))}
        </Page>
      ))}
    </Document>
  );
}
