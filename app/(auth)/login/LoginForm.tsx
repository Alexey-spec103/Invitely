"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface LoginFormProps {
  locale: Locale;
}

export default function LoginForm({ locale }: LoginFormProps) {
  const t = getDictionary(locale).auth.login;
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const themeId = searchParams.get("theme");
  const [formError, setFormError] = useState<string | null>(null);

  // Pre-launch i18n pass (2026-10-27): built from the dictionary, not a
  // module-level constant -- zod's own validation messages need to be in
  // the visitor's language too, not just the surrounding labels. useMemo
  // keyed on `t` (not on every render) since `locale` never changes for a
  // mounted instance of this page, same reasoning as any other derived-
  // from-props computation.
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.email(t.emailInvalid),
        password: z.string().min(1, t.passwordRequired),
      }),
    [t]
  );
  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      // Supabase's own error text -- not translatable from this codebase's
      // side, left as-is (same as every other `error.message` display in
      // this app's auth-adjacent forms).
      setFormError(error.message);
      return;
    }

    router.push(themeId ? `/onboarding?theme=${themeId}` : "/dashboard");
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">{t.heading}</h1>
      <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>

      {justRegistered && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t.justRegisteredMessage}
        </p>
      )}

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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t.passwordLabel}
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900">
              {t.forgotPassword}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        {/* UX audit (2026-10-26): no custom focus-visible style here --
            fell back to the browser's default outline, measured live at
            1.55:1 contrast against the white page, well under the 3:1
            WCAG minimum for a focus indicator. */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.submitButtonPending : t.submitButton}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.noAccount}{" "}
        <Link
          href={themeId ? `/signup?theme=${themeId}` : "/signup"}
          className="font-medium text-gray-900 underline underline-offset-2"
        >
          {t.signUpLink}
        </Link>
      </p>
    </div>
  );
}
