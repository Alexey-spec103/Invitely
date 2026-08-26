import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { Theme } from "@/lib/themes";

export interface DressCodeCardColor {
  hex: string;
  label?: string;
}

export interface DressCodeCardDocumentProps {
  theme: Theme;
  title: string;
  description?: string;
  colors: DressCodeCardColor[];
}

export function DressCodeCardDocument({ theme, title, description, colors }: DressCodeCardDocumentProps) {
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
  });

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.border} fixed />

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
    </Document>
  );
}
