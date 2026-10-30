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

const LOAD_TIMEOUT_MS = 12000;

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
 * just a local-dev convenience.
 *
 * Bug fix (2026-10-30), reported live: a real signup on mobile got stuck
 * on Supabase's raw "captcha protection: request disallowed" error with
 * no way forward -- the caller (LoginForm/SignupForm) only gated
 * submission on agreedToTerms, never on actually holding a token, so a
 * guest whose hCaptcha script never loaded (ad blocker / content blocker
 * on a mobile browser silently strips third-party script tags -- the most
 * likely cause here, not a layout/viewport bug: confirmed live the widget
 * itself renders and works fine at a real 390px width) could still hit
 * Submit with no checkbox ever having appeared, and no indication why.
 * This component now surfaces that failure itself instead of staying
 * silent: `loadFailedMessage` renders after LOAD_TIMEOUT_MS if the script
 * never calls back, so the caller can gate its own submit button on
 * `onVerify` actually having fired at least once. */
export default function HCaptchaWidget({
  onVerify,
  onLoadFailed,
  loadFailedMessage,
}: {
  onVerify: (token: string | null) => void;
  /** Fires once if the script never finishes loading -- lets the parent
   * form distinguish "widget is sitting right there, just not clicked
   * yet" from "widget never showed up at all" so it can show the right
   * message if Submit is pressed with no token either way. */
  onLoadFailed?: () => void;
  /** Shown if the widget hasn't finished loading after a generous timeout
   * -- almost always an ad/content blocker on the visitor's own device,
   * not a problem with this page. Pass a locale-appropriate string. */
  loadFailedMessage: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  const markLoadFailed = () => {
    setLoadFailed(true);
    onLoadFailed?.();
  };

  useEffect(() => {
    if (!siteKey) return;
    window.onHCaptchaApiLoad = () => setScriptLoaded(true);
    const timer = setTimeout(() => {
      // Reads the ref's live value at fire time, not a stale closure --
      // this timer is set up once per mount, well before scriptLoaded can
      // change, so a plain state check here would always see its initial
      // `false`.
      setScriptLoaded((loaded) => {
        if (!loaded) markLoadFailed();
        return loaded;
      });
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
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
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHCaptchaApiLoad"
        strategy="afterInteractive"
        onError={() => markLoadFailed()}
      />
      <div ref={containerRef} />
      {loadFailed && (
        <p role="alert" className="text-sm text-red-600">
          {loadFailedMessage}
        </p>
      )}
    </>
  );
}
