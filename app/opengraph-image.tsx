import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Invimbo - event websites, live in minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Technical SEO audit (2026-10-17) follow-up: layout.tsx's own openGraph
 * config deliberately shipped with no image ("nothing in public/ is
 * framed/sized as an actual social card... shipping a wrong/placeholder
 * image is worse than omitting it") -- this is that real image, generated
 * from code instead of a static asset so it can't go stale against the
 * brand. Next.js's file-convention picks this up automatically (no manual
 * `images` entry needed in metadata) and serves it at /opengraph-image,
 * wired into both og:image and twitter:image.
 *
 * Google Fonts fetched at request time, not next/font/google -- Satori (the
 * renderer behind ImageResponse) needs raw font bytes up front, it can't
 * resolve a next/font CSS variable the way normal page rendering does.
 * Same two brand faces as the real site (Source Serif 4 for the headline,
 * matching every marketing <h1>; Outfit for the tagline, matching
 * .marketing-shell elsewhere) -- not a fallback font, so this genuinely
 * looks like the product, not a generic template. */
async function loadGoogleFont(family: string, weight: number, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!match) {
    throw new Error(`Could not find font URL for ${family}`);
  }
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

export default async function OpengraphImage() {
  const headline = "Your event, styled exactly how you imagined it";
  const tagline = "A website, matching paper invitations, and guest seating - one style, everywhere your guests see it.";

  const [serifData, outfitData] = await Promise.all([
    loadGoogleFont("Source Serif 4", 600, headline),
    loadGoogleFont("Outfit", 500, tagline + "Invimbo"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundImage: "linear-gradient(135deg, #fff7f2 0%, #ffe8dc 55%, #ffd9c7 100%)",
          fontFamily: "Outfit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 56 }}>
          {/* Same mark as app/icon.svg -- accent hard-coded since Satori,
              like a browser favicon context, can't read CSS custom
              properties. */}
          <svg width={56} height={56} viewBox="0 0 40 40">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#ff6b45" />
            <path d="M16.6 15 C16.6 20.5 18.4 23 20 23 C21.6 23 23.4 20.5 23.4 15 Z" fill="#fff" />
            <rect x="19.3" y="23" width="1.4" height="5.5" fill="#fff" />
            <rect x="16.3" y="28.5" width="7.4" height="2.3" rx="1.15" fill="#fff" />
            <circle cx="20" cy="11" r="1" fill="#fff" />
            <circle cx="18.3" cy="8" r="0.8" fill="#fff" />
            <circle cx="21.2" cy="6" r="0.6" fill="#fff" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 600, color: "#1c1917" }}>Invimbo</span>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Source Serif 4",
            fontSize: 62,
            fontWeight: 600,
            lineHeight: 1.15,
            color: "#1c1917",
            maxWidth: 920,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.5,
            color: "#57534e",
            maxWidth: 820,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Source Serif 4", data: serifData, weight: 600, style: "normal" },
        { name: "Outfit", data: outfitData, weight: 500, style: "normal" },
      ],
    }
  );
}
