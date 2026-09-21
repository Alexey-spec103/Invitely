import { Document, Page, View, Text, Image, StyleSheet, Svg, Path } from "@react-pdf/renderer";
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

/** Same delicate sprig as the web's `/patterns/corner-flourish.svg` (the
 * corner ornament on LetterSection's CenteredCard), redrawn as react-pdf
 * `Path` primitives -- react-pdf's SVG support has no `mask-image`/`
 * currentColor`, so the paths are duplicated here with the theme's accent
 * baked in as a literal `stroke`/`fill` instead. Brings the personalized
 * invitation PDF (previously just centered text + a bare QR square) in line
 * with the same "real stationery" visual language the web cards already
 * have, rather than leaving the one piece a guest actually holds in their
 * hand looking like a placeholder. */
function CornerFlourish({ color, rotate }: { color: string; rotate?: number }) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 72 72"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <Path
        d="M4 4 C 20 6, 34 14, 40 30 C 44 40, 42 50, 34 56"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Path
        d="M10 4 C 22 8, 30 16, 33 26"
        stroke={color}
        strokeWidth={0.75}
        strokeLinecap="round"
        opacity={0.7}
      />
      <Path d="M14 18 C 10 14, 9 9, 12 5 C 15 9, 15 14, 14 18 Z" fill={color} opacity={0.8} />
      <Path d="M26 34 C 21 32, 17 33, 14 37 C 18 39, 23 39, 26 34 Z" fill={color} opacity={0.7} />
      <Path d="M36 46 C 31 45, 27 47, 25 51 C 29 52, 34 51, 36 46 Z" fill={color} opacity={0.6} />
    </Svg>
  );
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

        <Text style={styles.date}>{formatEventDate(eventDate).toUpperCase()}</Text>

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
