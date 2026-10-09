import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { getPdfThemeStyle } from "@/lib/pdf/theme-styles";
import { registerPdfFonts, registerCanvasPdfFont } from "@/lib/pdf/fonts";
import { CanvasPdfFrameContent, collectFontFamilies } from "./CanvasPdfDocument";
import { PdfWatermark } from "./PdfWatermark";
import { CornerFlourish } from "./CornerFlourish";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
import { pdfBackgroundColor } from "@/lib/backgroundFills";
import { formatEventDate } from "@/components/paper/formatEventDate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

export interface InvitationDocumentProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  /** Defaults to English -- see formatEventDate.ts's own doc comment for
   * why this stays optional rather than required at every call site. */
  locale?: Locale;
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
  /** The invitation's canvas-designed FRONT side -- same resolved-QR
   * contract as `backFrame`. Opt-in: takes over the front page entirely
   * when present (the structured names/date/venue/QR layout below is
   * skipped for that page), falls back to the structured layout otherwise.
   * Lets a host write something the structured fields can't say, without
   * touching every event that hasn't customized its front. */
  frontFrame?: CanvasFrame;
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- personalized (QR-linked, per-guest) invitations are a Premium-tier
   * material in lib/plans.ts. Only meaningful when `guestName`/`qrDataUrl`
   * are set (the personalized path); the generic, non-personalized
   * invitation download isn't gated. */
  locked?: boolean;
}

export function InvitationDocument({
  theme,
  names,
  eventDate,
  locale = DEFAULT_LOCALE,
  venueName,
  venueAddress,
  guestName,
  qrDataUrl,
  backMessage,
  backFrame,
  frontFrame,
  locked,
}: InvitationDocumentProps) {
  registerPdfFonts();
  const style = getPdfThemeStyle(theme);
  style.headingFont.forEach(registerCanvasPdfFont);
  style.bodyFont.forEach(registerCanvasPdfFont);
  if (backFrame || frontFrame) {
    for (const family of collectFontFamilies([backFrame, frontFrame].filter((f): f is CanvasFrame => Boolean(f)))) {
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
    flourishTopLeft: {
      position: "absolute",
      top: 20,
      left: 20,
    },
    flourishBottomRight: {
      position: "absolute",
      bottom: 20,
      right: 20,
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
      fontFamily: style.headingFont,
      fontSize: 14,
      letterSpacing: 1.5,
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
    qrDivider: {
      width: 28,
      height: 1,
      backgroundColor: style.accent,
      opacity: 0.5,
      marginTop: 26,
      marginBottom: 18,
    },
    qrWrap: {
      alignItems: "center",
    },
    qrFrame: {
      padding: 10,
      borderWidth: 0.75,
      borderColor: style.accent,
      backgroundColor: style.background,
    },
    qrImage: {
      width: 76,
      height: 76,
    },
    qrCaption: {
      fontFamily: style.bodyFont,
      fontSize: 8,
      letterSpacing: 1,
      marginTop: 8,
      color: style.accent,
      textTransform: "uppercase",
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
      {frontFrame ? (
        <Page
          size="A5"
          style={{
            position: "relative",
            backgroundColor:
              frontFrame.background.fill || frontFrame.background.color
                ? pdfBackgroundColor(frontFrame.background)
                : style.background,
          }}
        >
          <CanvasPdfFrameContent frame={frontFrame} />
          {locked && <PdfWatermark repeat={36} color={style.text} />}
        </Page>
      ) : (
        <Page size="A5" style={styles.page}>
          <View style={styles.border} fixed />
          <View style={styles.flourishTopLeft} fixed>
            <CornerFlourish color={style.accent} />
          </View>
          <View style={styles.flourishBottomRight} fixed>
            <CornerFlourish color={style.accent} rotate={180} />
          </View>

          {guestName && <Text style={styles.guestLine}>Dear {guestName},</Text>}

          <Text style={styles.names}>{names[0]}</Text>
          {names[1] && (
            <>
              <Text style={styles.ampersand}>&</Text>
              <Text style={styles.names}>{names[1]}</Text>
            </>
          )}

          <Text style={styles.date}>{formatEventDate(eventDate, locale).toUpperCase()}</Text>

          {(venueName || venueAddress) && (
            <Text style={styles.venue}>{[venueName, venueAddress].filter(Boolean).join(" · ")}</Text>
          )}

          {qrDataUrl && (
            <>
              <View style={styles.qrDivider} />
              <View style={styles.qrWrap}>
                <View style={styles.qrFrame}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an HTML img; it has no alt prop */}
                  <Image src={qrDataUrl} style={styles.qrImage} />
                </View>
                <Text style={styles.qrCaption}>Scan to RSVP</Text>
              </View>
            </>
          )}
          {locked && <PdfWatermark repeat={36} color={style.text} />}
        </Page>
      )}

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
          {locked && <PdfWatermark repeat={36} color={style.text} />}
        </Page>
      ) : (
        backMessage && (
          <Page size="A5" style={styles.page}>
            <View style={styles.border} fixed />
            <Text style={styles.backAmpersand}>&</Text>
            <Text style={styles.backMessage}>{backMessage}</Text>
            {locked && <PdfWatermark repeat={36} color={style.text} />}
          </Page>
        )
      )}
    </Document>
  );
}
