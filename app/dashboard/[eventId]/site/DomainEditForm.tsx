"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestDomainVerification, checkDomainVerification, clearDomainVerification } from "./domain-actions";

const domainFormSchema = z.object({
  domain: z.string().min(1, "Enter a domain"),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

interface DomainEditFormProps {
  eventId: string;
  /** dashboard-audit.md Block E part 2: setting a domain and getting the TXT
   * instructions stays available on every plan (the free "try it" part) --
   * this only drives the upfront hint below, since the real enforcement is
   * server-side in checkDomainVerification/proxy.ts's resolveCustomDomain. */
  hasBasicAccess: boolean;
  defaultValues: {
    customDomain: string;
    verificationToken: string | null;
    verifiedAt: string | null;
  };
}

export default function DomainEditForm({ eventId, hasBasicAccess, defaultValues }: DomainEditFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isVerifying, startVerify] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: { domain: defaultValues.customDomain },
  });

  const onSubmit = async (values: DomainFormValues) => {
    setFormError(null);
    try {
      await requestDomainVerification({ eventId, domain: values.domain });
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleVerify = () => {
    setVerifyError(null);
    startVerify(async () => {
      try {
        await checkDomainVerification({ eventId });
        router.refresh();
      } catch (err) {
        setVerifyError(err instanceof Error ? err.message : "Verification failed");
      }
    });
  };

  const handleRemove = () => {
    if (!window.confirm("Remove this custom domain? Your site will fall back to its default link.")) {
      return;
    }
    setRemoveError(null);
    startRemove(async () => {
      try {
        await clearDomainVerification({ eventId });
        router.refresh();
      } catch (err) {
        setRemoveError(err instanceof Error ? err.message : "Failed to remove domain");
      }
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--dash-text-muted)]">
        Point your own domain at this site. You&apos;ll still need to configure DNS with
        whichever host you deploy to — this only verifies ownership and routes matching
        requests once your domain is live.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-[var(--dash-text-muted)]">
            Domain
          </label>
          <input
            id="domain"
            type="text"
            placeholder="yoursite.com"
            className="mt-1 dash-input-dark"
            {...register("domain")}
          />
          {errors.domain && <p className="mt-1 text-sm text-red-400">{errors.domain.message}</p>}
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary">
          {isSubmitting ? "Saving..." : "Save & get verification instructions"}
        </button>
      </form>

      {defaultValues.customDomain && defaultValues.verificationToken && (
        <div className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-4">
          {defaultValues.verifiedAt ? (
            <p className="text-sm text-emerald-400">
              Verified on {new Date(defaultValues.verifiedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : null}
          {!defaultValues.verifiedAt && (
            <>
              <p className="text-sm font-medium text-[var(--dash-text)]">Add this TXT record to verify ownership</p>
              <dl className="mt-2 space-y-1 text-sm text-[var(--dash-text-muted)]">
                <div>
                  <dt className="inline font-medium text-[var(--dash-text)]">Host: </dt>
                  <dd className="inline font-mono">
                    _invitely-verify.{defaultValues.customDomain}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium text-[var(--dash-text)]">Value: </dt>
                  <dd className="inline font-mono break-all">{defaultValues.verificationToken}</dd>
                </div>
              </dl>

              {!hasBasicAccess && (
                <p className="mt-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                  🔒 Verifying is free to try, but a domain only goes live on the Basic plan or
                  above.{" "}
                  <Link href={`/dashboard/${eventId}/plan`} className="font-medium underline">
                    Upgrade
                  </Link>
                  .
                </p>
              )}

              {verifyError && <p className="mt-3 text-sm text-red-400">{verifyError}</p>}

              <button type="button" onClick={handleVerify} disabled={isVerifying} className="dash-btn dash-btn-primary mt-3">
                {isVerifying ? "Checking..." : "Verify"}
              </button>
            </>
          )}

          {removeError && <p className="mt-3 text-sm text-red-400">{removeError}</p>}

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="mt-3 block text-sm font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRemoving ? "Removing..." : "Remove domain"}
          </button>
        </div>
      )}
    </div>
  );
}
