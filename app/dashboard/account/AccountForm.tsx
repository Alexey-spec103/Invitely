"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const accountFormSchema = z.object({
  email: z.email("Enter a valid email"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  currentEmail: string;
}

export default function AccountForm({ currentEmail }: AccountFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { email: currentEmail },
  });

  const onSubmit = async (values: AccountFormValues) => {
    setFormError(null);
    setSent(false);

    if (values.email === currentEmail) {
      setFormError("That's already your current email.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: values.email });

    if (error) {
      setFormError(error.message);
      return;
    }

    setSent(true);
  };

  return (
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
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {sent && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Check both your old and new email inboxes to confirm the change before it takes effect.
        </p>
      )}
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Update email"}
      </button>
    </form>
  );
}
