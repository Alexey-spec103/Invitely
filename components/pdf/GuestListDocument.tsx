import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import type { Theme } from "@/lib/themes";

export interface GuestListRow {
  name: string;
  group: string;
  status: string;
  partySize: string;
  table: string;
  notes: string;
}

export interface GuestListDocumentProps {
  theme: Theme;
  eventTitle: string;
  rows: GuestListRow[];
}

export function GuestListDocument({ theme, eventTitle, rows }: GuestListDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  registerCanvasPdfFont(style.headingFont);
  registerCanvasPdfFont(style.bodyFont);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: style.background,
      color: style.text,
      padding: 36,
    },
    title: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 22,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: style.bodyFont,
      fontSize: 10,
      textAlign: "center",
      marginTop: 4,
      opacity: 0.7,
    },
    divider: {
      height: 1,
      backgroundColor: style.accent,
      marginTop: 14,
      marginBottom: 10,
    },
    headerRow: {
      display: "flex",
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: style.accent,
      paddingBottom: 4,
      marginBottom: 4,
    },
    row: {
      display: "flex",
      flexDirection: "row",
      paddingVertical: 3,
      borderBottomWidth: 0.5,
      borderBottomColor: "#00000022",
    },
    headerCell: {
      fontFamily: style.bodyFont,
      fontWeight: 600,
      fontSize: 9,
      textTransform: "uppercase",
    },
    cell: {
      fontFamily: style.bodyFont,
      fontSize: 9,
    },
    colName: { width: "24%" },
    colGroup: { width: "13%" },
    colStatus: { width: "13%" },
    colParty: { width: "9%" },
    colTable: { width: "12%" },
    colNotes: { width: "29%" },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{eventTitle}</Text>
        <Text style={styles.subtitle}>Guest list &middot; {rows.length} part{rows.length === 1 ? "y" : "ies"}</Text>
        <View style={styles.divider} />

        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.colName]}>Name</Text>
          <Text style={[styles.headerCell, styles.colGroup]}>Group</Text>
          <Text style={[styles.headerCell, styles.colStatus]}>RSVP</Text>
          <Text style={[styles.headerCell, styles.colParty]}>Party</Text>
          <Text style={[styles.headerCell, styles.colTable]}>Table</Text>
          <Text style={[styles.headerCell, styles.colNotes]}>Notes</Text>
        </View>

        {rows.map((row, index) => (
          <View key={`${row.name}-${index}`} style={styles.row}>
            <Text style={[styles.cell, styles.colName]}>{row.name}</Text>
            <Text style={[styles.cell, styles.colGroup]}>{row.group}</Text>
            <Text style={[styles.cell, styles.colStatus]}>{row.status}</Text>
            <Text style={[styles.cell, styles.colParty]}>{row.partySize}</Text>
            <Text style={[styles.cell, styles.colTable]}>{row.table}</Text>
            <Text style={[styles.cell, styles.colNotes]}>{row.notes}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
