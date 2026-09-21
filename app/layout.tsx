import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Inter,
  Playfair_Display,
  Fraunces,
  Alex_Brush,
  Cinzel,
  Libre_Baskerville,
  Space_Grotesk,
  Caveat,
  EB_Garamond,
  Parisienne,
  Marcellus,
  Bodoni_Moda,
  Italiana,
  Cormorant,
  Sacramento,
  Gilda_Display,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

// A genuine handwriting/script face — used for pull quotes and
// signature-style flourishes, distinct from the italic serif "accent" fonts.
// Wedding stationery leans on this kind of script; none of the existing
// heading/body/accent fonts are true cursive.
const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: ["400"],
});

// A geometric, all-caps-friendly serif — the defining typeface of Art Deco
// and other "regal" formal registers, distinct from the humanist serifs
// above (Cormorant/Playfair/Fraunces all share a soft, calligraphic feel
// that doesn't suit a Gatsby-era or navy-and-gold formal look).
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// A classic editorial serif with more texture/weight than the calligraphic
// Cormorant/Playfair/Fraunces trio -- suits rustic and vintage registers
// that want a "printed book" feel rather than an invitation-suite feel.
const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

// A geometric sans distinct from Inter's neutral grotesque -- gives modern/
// minimal themes a second heading option so they don't all default to the
// same typeface.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// A looser, bouncier handwriting face than Alex Brush's formal calligraphy --
// reads as casual/boho rather than black-tie.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// An old-style classical serif, warmer and less sharp than Cormorant
// Garamond -- a second "romantic" register for variety at scale.
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

// A thin, delicate monoline script -- distinct from Alex Brush's bold
// flowing brush strokes and Caveat's casual handwriting. Gives a third,
// more "old money"-elegant register for script use across the catalog,
// since Alex Brush alone was the dominant script on ~80% of themes.
const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: ["400"],
});

// A refined, understated display serif -- quieter and more "old money" than
// Cinzel's assertive Art Deco geometry, good for marble/luxury registers
// that want elegance without Cinzel's all-caps formality.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: ["400"],
});

// A dramatic, high-contrast Didone -- thick/thin stroke variation reads as
// editorial and a little theatrical, distinct from every humanist serif
// above. Suits cosmic's night-sky drama and any other register that wants
// real visual weight in its headline type.
const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

// An ultra-thin, wide-set display serif -- almost architectural, reads as
// high-fashion editorial rather than traditional wedding stationery. A
// deliberately different register from every other serif here.
const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: ["400"],
});

// The base Cormorant family (not Cormorant Garamond) -- taller, more
// delicate letterforms at display sizes, a genuinely distinct face from
// Cormorant Garamond despite the shared name, for romantic/peony/provence
// registers that want more variety than reusing Cormorant Garamond again.
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

// A thin monoline script -- calmer and more upright than Alex Brush's bold
// flowing brush strokes, Caveat's casual handwriting, or Parisienne's wide
// swirling calligraphy. A fourth, distinct script register.
const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: ["400"],
});

// A characterful, slightly quirky serif with warm, humanist curves --
// distinct from the more formal Playfair/Cinzel/Marcellus trio, suits
// provence's countryside-elegant register.
const gildaDisplay = Gilda_Display({
  variable: "--font-gilda-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Invitely — event websites, live in minutes",
    template: "%s | Invitely",
  },
  description:
    "Design a beautiful event website, matching paper invitations, and guest seating — one style, everywhere your guests see it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} ${inter.variable} ${playfairDisplay.variable} ${fraunces.variable} ${alexBrush.variable} ${cinzel.variable} ${libreBaskerville.variable} ${spaceGrotesk.variable} ${caveat.variable} ${ebGaramond.variable} ${parisienne.variable} ${marcellus.variable} ${bodoniModa.variable} ${italiana.variable} ${cormorant.variable} ${sacramento.variable} ${gildaDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* No-op when not deployed on Vercel -- the script simply never
            finds an endpoint to report to, same "safe to leave in" shape
            as the Sentry configs above. */}
        <Analytics />
      </body>
    </html>
  );
}
