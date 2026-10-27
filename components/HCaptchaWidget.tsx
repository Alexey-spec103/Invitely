"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onHCaptchaApiLoad?: () => void;
  }
}

/** Pre-launch security pass (2026-10-27): renders hCaptcha's widget and
 * reports the resulting token up via onVerify -- the actual verification
 * happens server-side, inside Supabase Auth itself (see
 * supabase/config.toml's `[auth.captcha]`), by passing this token as
 * `options.captchaToken` on the signInWithPassword/signUp call. This
 * component only ever produces the token; it never validates one.
 * Renders nothing (returns null) if NEXT_PUBLIC_HCAPTCHA_SITE_KEY isn't
 * set, so local dev without a configured sitekey still works -- Supabase's
 * own captcha check only activates once a secret is configured on its
 * side too, so an unset sitekey here isn't a security gap on its own,
 * just a local-dev convenience. */
export default function HCaptchaWidget({ onVerify }: { onVerify: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    // hCaptcha's api.js does async setup after the <script> tag itself
    // finishes loading -- its own `onload` query-param callback is the
    // actual "safe to call render() now" signal, not next/script's onLoad
    // (confirmed live: using onLoad fired render() too early, hCaptcha's
    // own console warned "should not render before js api is fully
    // loaded"). window-global because hCaptcha's API invokes it by name,
    // not as an ES module import.
    window.onHCaptchaApiLoad = () => setScriptLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  useEffect(() => {
    if (!scriptLoaded || !siteKey || !containerRef.current || !window.hcaptcha) return;
    widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onVerify(token),
      "expired-callback": () => onVerify(null),
      "error-callback": () => onVerify(null),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHCaptchaApiLoad" strategy="afterInteractive" />
      <div ref={containerRef} />
    </>
  );
}
