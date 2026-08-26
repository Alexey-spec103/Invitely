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
} from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} ${inter.variable} ${playfairDisplay.variable} ${fraunces.variable} ${alexBrush.variable} ${cinzel.variable} ${libreBaskerville.variable} ${spaceGrotesk.variable} ${caveat.variable} ${ebGaramond.variable} ${parisienne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
