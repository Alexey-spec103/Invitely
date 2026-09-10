"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { upgradeAnonymousAccount } from "@/lib/authUpgrade";

const signupSchema = z
  .object({
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeId = searchParams.get("theme");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
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
        setFormError(err instanceof Error ? err.message : "Failed to create account");
        return;
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push(themeId ? `/login?registered=1&theme=${themeId}` : "/login?registered=1");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Sign up</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create an account to continue.
      </p>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href={themeId ? `/login?theme=${themeId}` : "/login"}
          className="font-medium text-gray-900 underline underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
