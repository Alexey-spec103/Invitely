import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { PdfWatermark } from "./PdfWatermark";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
import { pdfBackgroundColor } from "@/lib/backgroundFills";

export interface InvitationDocumentProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  venueName?: string;
  venueAddress?: string;
  guestName?: string;
  qrDataUrl?: string;
  backMessage?: string;
  /** The invitation's canvas-designed back side (dashboard-audit.md A9),
   * with any `qr` elements already resolved to real images by
   * resolveCanvasQrElements -- this component never generates QR codes
   * itself. Takes over the back page entirely when present; falls back to
   * the plain `backMessage` text page otherwise. */
  backFrame?: CanvasFrame;
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- personalized (QR-linked, per-guest) invitations are a Premium-tier
   * material in lib/plans.ts. Only meaningful when `guestName`/`qrDataUrl`
   * are set (the personalized path); the generic, non-personalized
   * invitation download isn't gated. */
  locked?: boolean;
}

function formatEventDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function InvitationDocument({
  theme,
  names,
  eventDate,
  venueName,
  venueAddress,
  guestName,
  qrDataUrl,
  backMessage,
  backFrame,
  locked,
}: InvitationDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  registerCanvasPdfFont(style.headingFont);
  registerCanvasPdfFont(style.bodyFont);
  if (backFrame) {
    for (const family of collectFontFamilies([backFrame])) {
      registerCanvasPdfFont(family);
    }
  }

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
    guestLine: {
      fontFamily: style.bodyFont,
      fontSize: 12,
      marginBottom: 24,
      textAlign: "center",
    },
    names: {
      fontFamily: style.headingFont,
      fontWeight: 600,
      fontSize: 34,
      textAlign: "center",
    },
    ampersand: {
      fontFamily: style.headingFont,
      fontSize: 20,
      color: style.accent,
      marginVertical: 6,
      textAlign: "center",
    },
    date: {
      fontFamily: style.bodyFont,
      fontSize: 13,
      letterSpacing: 1,
      marginTop: 20,
      textAlign: "center",
    },
    venue: {
      fontFamily: style.bodyFont,
      fontSize: 11,
      marginTop: 8,
      textAlign: "center",
      color: style.text,
    },
    qrWrap: {
      marginTop: 28,
      alignItems: "center",
    },
    qrImage: {
      width: 72,
      height: 72,
    },
    qrCaption: {
      fontFamily: style.bodyFont,
      fontSize: 8,
      marginTop: 4,
      color: style.text,
    },
    backAmpersand: {
      fontFamily: style.headingFont,
      fontSize: 16,
      color: style.accent,
      marginBottom: 16,
      textAlign: "center",
    },
    backMessage: {
      fontFamily: style.bodyFont,
      fontSize: 12,
      lineHeight: 1.6,
      textAlign: "center",
      maxWidth: 320,
    },
  });

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.border} fixed />

        {guestName && <Text style={styles.guestLine}>Dear {guestName},</Text>}

        <Text style={styles.names}>{names[0]}</Text>
        {names[1] && (
          <>
            <Text style={styles.ampersand}>&</Text>
            <Text style={styles.names}>{names[1]}</Text>
          </>
        )}

        <Text style={styles.date}>{formatEventDate(eventDate).toUpperCase()}</Text>

        {(venueName || venueAddress) && (
          <Text style={styles.venue}>{[venueName, venueAddress].filter(Boolean).join(" · ")}</Text>
        )}

        {qrDataUrl && (
          <View style={styles.qrWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img; it has no alt prop */}
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrCaption}>Scan to RSVP</Text>
          </View>
        )}
        {locked && <PdfWatermark repeat={36} />}
      </Page>

      {backFrame ? (
        <Page
          size="A5"
          style={{
            position: "relative",
            backgroundColor:
              backFrame.background.fill || backFrame.background.color
                ? pdfBackgroundColor(backFrame.background)
                : style.background,
          }}
        >
          <CanvasPdfFrameContent frame={backFrame} />
          {locked && <PdfWatermark repeat={36} />}
        </Page>
      ) : (
        backMessage && (
          <Page size="A5" style={styles.page}>
            <View style={styles.border} fixed />
            <Text style={styles.backAmpersand}>&</Text>
            <Text style={styles.backMessage}>{backMessage}</Text>
            {locked && <PdfWatermark repeat={36} />}
          </Page>
        )
      )}
    </Document>
  );
}
