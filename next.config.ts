import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// security-baseline audit (2026-10-19): a real inventory of what this app
// actually loads client-side, not a guessed allowlist -- grepped for every
// `https://` reference the codebase contains, then checked each one's
// actual call site to tell a real browser-loaded resource apart from a
// server-side fetch (irrelevant to CSP) or a plain <a href> (also
// irrelevant -- CSP doesn't restrict ordinary navigation):
//   - script-src: Microsoft Clarity's analytics tag (app/layout.tsx) and
//     Vercel Web Analytics' <Analytics /> component (same file) -- the
//     latter was a real gap in this "actual inventory" (not a guess):
//     confirmed live via the CSP report-only endpoint firing repeatedly on
//     every homepage load because va.vercel-scripts.com/v1/script.debug.js
//     wasn't allowlisted. Report-only mode means this was silent so far,
//     but would break Analytics outright the moment this policy is ever
//     flipped to enforcing. Its own beacon (`/_vercel/insights/view`) is
//     same-origin (Next proxies it), so no separate connect-src entry.
//   - frame-src: Google Maps embed (MapSection), YouTube/Vimeo embeds
//     (VideoSection) -- the only three iframe sources in the app
//   - img-src: Unsplash (theme preview photos), *.supabase.co (guest/host-
//     uploaded photos, via Supabase Storage's public URLs)
//   - connect-src: *.supabase.co (every client-side Supabase call),
//     Sentry's ingest endpoints
// fonts.googleapis.com appears in the codebase too (lib/canvas/fonts.ts,
// app/api/pdf-fonts/route.ts, app/opengraph-image.tsx) but only ever as a
// server-side fetch() -- not a browser-loaded resource, so it isn't a
// connect-src/font-src entry here.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline': this app renders real inline <script> JSON-LD
  // (app/layout.tsx, app/page.tsx -- server-computed from trusted data,
  // not user input) and Clarity's own inline bootstrap snippet. Nonce-based
  // strict CSP (the security-baseline skill's recommended end state) would
  // remove the need for this, but that's a real application change of its
  // own -- a separate, deliberate upgrade, not bundled into establishing
  // this first baseline.
  "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://va.vercel-scripts.com",
  // 'unsafe-inline': this codebase uses React inline `style={{...}}`
  // extensively (CSS custom properties like --stagger-i driving animation
  // delays, among many other spots) -- those compile to real inline
  // `style="..."` attributes, which style-src must allow without nonces.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "frame-src https://www.google.com https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
].join("; ");

const nextConfig: NextConfig = {
  // security-baseline audit (2026-10-22): `X-Powered-By: Next.js` was
  // leaking on every response -- free fingerprinting for an attacker
  // picking which framework-specific exploits to try first, no upside.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN, not DENY -- nothing in this app frames its own
          // pages either way, but DENY is the wrong default to reach for
          // without checking: SAMEORIGIN is the safer-by-default choice
          // when nothing in the codebase actually relies on being framed
          // cross-origin.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // security-baseline audit (2026-10-19): this app uses no
          // camera/microphone/geolocation/USB/Bluetooth browser API
          // anywhere (confirmed by grep -- the only navigator.* calls in
          // the whole codebase are clipboard.writeText and share, neither
          // gated by Permissions-Policy), so every one of these is safe to
          // lock to 'self' (not blanket-deny: still allow this app's own
          // origin, e.g. if a future feature genuinely needs one).
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self), usb=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Report-Only, deliberately not enforcing -- see CSP_DIRECTIVES'
          // own comment for the real inventory this is built from, and
          // app/api/csp-report/route.ts for where violations land. Exactly
          // the gradual rollout the security-baseline skill itself
          // prescribes: watch real traffic's reports for a while (this has
          // live Stripe payments running through it -- an enforcing CSP
          // shipped wrong could break checkout) before ever switching this
          // to the enforcing `Content-Security-Policy` header.
          { key: "Content-Security-Policy-Report-Only", value: CSP_DIRECTIVES },
        ],
      },
    ];
  },
};

// withSentryConfig only wires up source-map upload (for readable stack
// traces on sentry.io) when SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT are
// set -- without them it's documented to skip that step rather than fail
// the build, so this is safe to leave wrapped even before those exist.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
});
