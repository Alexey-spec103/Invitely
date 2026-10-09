import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "-30%",
    left: "-30%",
    width: "160%",
    height: "160%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    justifyContent: "center",
    transform: "rotate(-28deg)",
    opacity: 0.24,
  },
});

/** dashboard-audit.md B21: PDF counterpart to components/paper/CardWatermark.tsx
 * -- same oversized+rotated tiling technique, clipped by the page's own
 * bounds (react-pdf pages clip absolutely-positioned overflow the same way
 * a browser does). Fires off the plan tier lib/plans.ts already claims
 * requires Premium for this material, not a real charge -- the PDF still
 * generates and downloads, just visibly marked. */
export function PdfWatermark({
  repeat = 32,
  fontSize = 10,
  color = "#000000",
}: {
  repeat?: number;
  fontSize?: number;
  /** Themed, not always black -- a dark-background theme made a fixed black
   * label nearly invisible against its own near-black background at any
   * reasonable opacity. Callers should pass the theme's own text color
   * (already chosen for contrast against its background) rather than
   * relying on the black default. */
  color?: string;
}) {
  const labelStyle = { fontSize, fontWeight: 700 as const, letterSpacing: 1, color, marginHorizontal: 8, marginVertical: 10 };

  return (
    <View style={styles.wrap} fixed>
      {Array.from({ length: repeat }, (_, i) => (
        <Text key={i} style={labelStyle}>
          PREMIUM ONLY
        </Text>
      ))}
    </View>
  );
}
