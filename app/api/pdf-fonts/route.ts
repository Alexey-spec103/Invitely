import { NextRequest, NextResponse } from "next/server";

// Google's modern Fonts API only serves woff2, which react-pdf's underlying
// fontkit can't parse. Its legacy CSS endpoint still serves plain .ttf, but
// only to user agents old enough to predate woff2 support — this is the same
// technique used to self-host the site's 4 built-in fonts (lib/pdf/fonts.ts),
// exposed here as an on-demand lookup so any of the ~150 canvas fonts can be
// resolved at PDF-generation time instead of pre-downloading all of them.
const LEGACY_UA =
  "Mozilla/5.0 (Linux; U; Android 2.3.3; en-us; Nexus S Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";

const TTF_URL_PATTERN = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/;

async function resolveTtfUrl(family: string, weight: string): Promise<string | null> {
  const cssUrl = `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}`;
  const response = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } });
  if (!response.ok) {
    return null;
  }
  const css = await response.text();
  return TTF_URL_PATTERN.exec(css)?.[1] ?? null;
}

export async function GET(request: NextRequest) {
  const family = request.nextUrl.searchParams.get("family");
  const weight = request.nextUrl.searchParams.get("weight") || "400";

  if (!family) {
    return NextResponse.json({ error: "Missing family" }, { status: 400 });
  }

  // Not every font has every weight (script fonts are often 400-only) — fall
  // back to the family's default (400) rather than failing the whole PDF.
  const ttfUrl =
    (weight !== "400" && (await resolveTtfUrl(family, weight))) ||
    (await resolveTtfUrl(family, "400"));

  if (!ttfUrl) {
    return NextResponse.json({ error: "Font not found" }, { status: 404 });
  }

  return NextResponse.redirect(ttfUrl, 307);
}
