import { ImageResponse } from "next/og";

// Apple's recommended apple-touch-icon size. iOS applies its own rounded-corner
// mask and shine at the OS level, so this is a full-bleed square with no
// border-radius/transparency of our own (adding one would double-round or
// leave background gaps once iOS masks it).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same "Toast i" champagne-flute mark as app/icon.svg and components/
// InvitelyLogo.tsx (see that component's comment for why) -- this file used
// to render a bare pink-gradient letter "I", a leftover from before that
// mark existed that never got updated, so iOS home-screen saves (and some
// search-result favicons) showed a different logo than everywhere else.
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
          background: "#ff6b45",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 40 40">
          <path d="M16.6 15 C16.6 20.5 18.4 23 20 23 C21.6 23 23.4 20.5 23.4 15 Z" fill="#fff" />
          <rect x="19.3" y="23" width="1.4" height="5.5" fill="#fff" />
          <rect x="16.3" y="28.5" width="7.4" height="2.3" rx="1.15" fill="#fff" />
          <circle cx="20" cy="11" r="1" fill="#fff" />
          <circle cx="18.3" cy="8" r="0.8" fill="#fff" />
          <circle cx="21.2" cy="6" r="0.6" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
