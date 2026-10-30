"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { upgradeAnonymousAccount } from "@/lib/authUpgrade";
import HCaptchaWidget from "@/components/HCaptchaWidget";
import TermsCheckbox from "@/components/TermsCheckbox";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface SignupFormProps {
  locale: Locale;
}

export default function SignupForm({ locale }: SignupFormProps) {
  const dict = getDictionary(locale);
  const t = dict.auth.signup;
  // Reused, not duplicated -- the exact same ToS/Privacy-checkbox copy and
  // "Failed to create account" fallback already exist here from this
  // session's own earlier pass (see AnonymousAccountBanner.tsx/
  // PublishAccountModal.tsx for the same reuse).
  const anonBanner = dict.dashboard.shell.anonBanner;
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeId = searchParams.get("theme");
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Bug fix (2026-10-30): this is the exact bug reported live -- a real
  // signup on mobile hit Supabase's raw "captcha protection: request
  // disallowed" error with no explanation, because this form only ever
  // gated Submit on agreedToTerms, never on actually holding a captcha
  // token (hCaptcha's script had likely been silently blocked by an ad/
  // content blocker on that visitor's mobile browser). `captchaRequired`
  // is false in local dev (no site key configured), so this never blocks
  // testing there.
  const captchaRequired = Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);
  const [captchaLoadFailed, setCaptchaLoadFailed] = useState(false);

  const signupSchema = useMemo(
    () =>
      z
        .object({
          email: z.email(t.emailInvalid),
          password: z.string().min(6, t.passwordMin),
          confirmPassword: z.string().min(1, t.confirmPasswordRequired),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t.passwordsDontMatch,
          path: ["confirmPassword"],
        }),
    [t]
  );
  type SignupFormValues = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
    if (captchaRequired && !captchaToken) {
      setFormError(captchaLoadFailed ? t.captchaBlockedMessage : t.captchaIncompleteMessage);
      return;
    }
    const supabase = createClient();

    // Reaching /signup directly while an anonymous trial session is active
    // (e.g. the dashboard banner was dismissed) must upgrade that same
    // session in place, not create a brand-new, disconnected account that
    // would orphan whatever they already made.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.is_anonymous) {
      try {
        await upgradeAnonymousAccount(values.email, values.password);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : anonBanner.genericError);
        return;
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: captchaToken ? { captchaToken } : undefined,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push(themeId ? `/login?registered=1&theme=${themeId}` : "/login?registered=1");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">{t.heading}</h1>
      <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t.confirmPasswordLabel}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <TermsCheckbox
          checked={agreedToTerms}
          onChange={setAgreedToTerms}
          beforeText={anonBanner.agreeTermsBefore}
          termsText={anonBanner.termsOfServiceLink}
          middleText={anonBanner.agreeTermsMiddle}
          privacyText={anonBanner.privacyPolicyLink}
          afterText={anonBanner.agreeTermsAfter}
          className="text-gray-600"
        />

        <HCaptchaWidget
          onVerify={setCaptchaToken}
          onLoadFailed={() => setCaptchaLoadFailed(true)}
          loadFailedMessage={t.captchaBlockedMessage}
        />

        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        {/* UX audit (2026-10-26): no custom focus-visible style here --
            fell back to the browser's default outline, measured live at
            1.55:1 contrast against the white page, well under the 3:1
            WCAG minimum for a focus indicator. gray-900 (this button's own
            background) gives strong contrast against white either way. */}
        <button
          type="submit"
          disabled={isSubmitting || !agreedToTerms}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.submitButtonPending : t.submitButton}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.alreadyHaveAccount}{" "}
        <Link
          href={themeId ? `/login?theme=${themeId}` : "/login"}
          className="font-medium text-gray-900 underline underline-offset-2"
        >
          {t.logInLink}
        </Link>
      </p>
    </div>
  );
}
