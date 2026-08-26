import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { Theme } from "@/lib/themes";

export interface ProgramCardEvent {
  time: string;
  title: string;
  description?: string;
}

export interface ProgramCardDocumentProps {
  theme: Theme;
  title?: string;
  events: ProgramCardEvent[];
}

export function ProgramCardDocument({ theme, title, events }: ProgramCardDocumentProps) {
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
      marginBottom: 28,
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      width: "100%",
      marginBottom: 16,
    },
    time: {
      fontFamily: style.bodyFont,
      fontSize: 11,
      letterSpacing: 1,
      color: style.accent,
      width: 64,
    },
    eventBody: {
      flex: 1,
    },
    eventTitle: {
      fontFamily: style.headingFont,
      fontSize: 13,
    },
    eventDescription: {
      fontFamily: style.bodyFont,
      fontSize: 9,
      marginTop: 2,
      color: style.text,
    },
  });

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.border} fixed />

        <Text style={styles.title}>{title || "Order of the day"}</Text>

        {events.map((event, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.time}>{event.time}</Text>
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
