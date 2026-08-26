"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { takePendingOnboarding } from "@/lib/pendingOnboarding";
import { uploadDataUrlAsEventPhoto } from "@/lib/photoUpload";
import { completeOnboarding } from "@/app/onboarding/actions";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const themeId = searchParams.get("theme");
  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError(error.message);
      return;
    }

    const pending = takePendingOnboarding();
    if (pending) {
      try {
        // A photo captured before signup is a local data: URL (no session
        // to upload it under yet) -- upload it to real Storage now that
        // we're authenticated. Non-fatal if it fails: better to finish
        // creating the site without the photo than to block on it.
        let photoUrl = pending.photoUrl;
        if (photoUrl?.startsWith("data:")) {
          try {
            photoUrl = await uploadDataUrlAsEventPhoto(photoUrl);
          } catch {
            photoUrl = undefined;
          }
        }
        await completeOnboarding({ ...pending, photoUrl });
        return;
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Failed to finish setting up your site");
        return;
      }
    }

    router.push(themeId ? `/onboarding?theme=${themeId}` : "/dashboard");
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Login</h1>
      <p className="mt-1 text-sm text-gray-500">
        Log in to your account to continue.
      </p>

      {justRegistered && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Check your email to confirm your registration, then log in.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {formError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href={themeId ? `/signup?theme=${themeId}` : "/signup"}
          className="font-medium text-gray-900 underline underline-offset-2"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
