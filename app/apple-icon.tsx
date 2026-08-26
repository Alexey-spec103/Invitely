import { ImageResponse } from "next/og";

// Apple's recommended apple-touch-icon size. iOS applies its own rounded-corner
// mask and shine at the OS level, so this is a full-bleed square with no
// border-radius/transparency of our own (adding one would double-round or
// leave background gaps once iOS masks it).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
        }}
      >
        <span
          style={{
            fontSize: 104,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "serif",
          }}
        >
          I
        </span>
      </div>
    ),
    { ...size }
  );
}
