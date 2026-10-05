"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  requestDomainVerification,
  checkDomainVerification,
  clearDomainVerification,
  claimInvimboSubdomain,
} from "./domain-actions";

const domainFormSchema = z.object({
  domain: z.string().min(1, "Enter a domain"),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

interface DomainEditFormProps {
  eventId: string;
  /** dashboard-audit.md Block E part 2: setting a domain and getting the TXT
   * instructions stays available on every plan (the free "try it" part) --
   * this only drives the upfront hint below, since the real enforcement is
   * server-side in checkDomainVerification/proxy.ts's resolveCustomDomain. */
  hasBasicAccess: boolean;
  /** The event's own auto-generated slug (couple names, e.g.
   * "claire-and-nathaniel") -- pre-fills the free-address input with exactly
   * what the host already sees in their default /e/{slug} link, so claiming
   * a nicer address is a one-click confirm, not a blank field to fill in. */
  suggestedSubdomain: string;
  /** "invimbo.com" in production -- read once, server-side, from the same
   * env var resolveCustomDomain checks, so the preview text can never drift
   * from what will actually route. */
  appDomain: string;
  defaultValues: {
    customDomain: string;
    verificationToken: string | null;
    verifiedAt: string | null;
  };
}

/** Direct feedback: a host finishing their design had no clear idea what
 * "custom domain" would actually give them, or how -- pay first, then find
 * out? BYOD (a domain you already own, verified via DNS) used to be the
 * *only* option shown, but weddingpost.ru's own real links (checked live:
 * weddingpost.ru/1079614) and a competitor's (inviiteloves.ru/couple-slug)
 * turned out to just be a path/subdomain on the *platform's own* domain, not
 * a separately-purchased one -- registering and reselling real domains would
 * mean a registrar integration, recurring renewal billing, and real legal
 * liability for someone else's domain name, a whole separate project. A free
 * invimbo.com subdomain (reusing the exact same custom_domain columns +
 * routing as BYOD, just self-verified since there's no external ownership
 * to prove) gets the same "not just a generic link" feeling with none of
 * that -- so it's the default, prominent option now; BYOD is still here for
 * anyone who already owns a real domain, just no longer the only path. */
export default function DomainEditForm({
  eventId,
  hasBasicAccess,
  suggestedSubdomain,
  appDomain,
  defaultValues,
}: DomainEditFormProps) {
  const router = useRouter();
  const isInvimboSubdomain = defaultValues.customDomain.endsWith(`.${appDomain}`);

  const [subdomain, setSubdomain] = useState(
    isInvimboSubdomain ? defaultValues.customDomain.slice(0, -(appDomain.length + 1)) : suggestedSubdomain
  );
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [isClaiming, startClaim] = useTransition();
  const [showByod, setShowByod] = useState(!isInvimboSubdomain && Boolean(defaultValues.customDomain));

  const handleClaim = () => {
    setSubdomainError(null);
    const value = subdomain.trim().toLowerCase();
    if (!SUBDOMAIN_PATTERN.test(value)) {
      setSubdomainError("Use lowercase letters, numbers, and hyphens only");
      return;
    }
    startClaim(async () => {
      try {
        await claimInvimboSubdomain({ eventId, subdomain: value });
        router.refresh();
      } catch (err) {
        setSubdomainError(err instanceof Error ? err.message : "Failed to claim address");
      }
    });
  };

  const handleRemove = () => {
    if (!window.confirm("Remove this address? Your site will fall back to its default link.")) {
      return;
    }
    startClaim(async () => {
      try {
        await clearDomainVerification({ eventId });
        router.refresh();
      } catch {
        // clearError surfaces via the BYOD form below when relevant; a free
        // subdomain has nowhere else to show this, so a plain alert is fine
        // for this rare failure case.
        window.alert("Failed to remove address, please try again.");
      }
    });
  };

  if (isInvimboSubdomain) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-900">Your address is live</p>
          <p className="mt-1 font-mono text-sm text-emerald-800">{defaultValues.customDomain}</p>
          <p className="mt-2 text-xs text-emerald-700">
            Included with your plan for as long as it&apos;s active — nothing to renew, no expiry date.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isClaiming}
          className="text-sm font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isClaiming ? "Removing..." : "Remove address"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-900">Get a free {appDomain} address</p>
        <p className="mt-1 text-sm text-gray-500">
          A nicer link than the default, included with your plan — no domain to buy, nothing to renew.
        </p>
        <div className="mt-2 flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
          <input
            type="text"
            value={subdomain}
            onChange={(event) => setSubdomain(event.target.value.toLowerCase())}
            className="min-w-0 flex-1 border-none p-0 text-sm text-gray-900 outline-none"
            aria-label="Subdomain"
          />
          <span className="shrink-0 text-sm text-gray-400">.{appDomain}</span>
        </div>
        {subdomainError && <p className="mt-1 text-sm text-red-600">{subdomainError}</p>}
        {!hasBasicAccess && (
          <p className="mt-2 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            🔒 This is a Basic-plan feature.{" "}
            <Link href={`/dashboard/${eventId}/plan`} className="font-medium underline">
              Upgrade
            </Link>{" "}
            to claim it — free to preview the address here first.
          </p>
        )}
        <button
          type="button"
          onClick={handleClaim}
          disabled={isClaiming}
          className="dash-btn dash-btn-primary mt-3"
        >
          {isClaiming ? "Claiming..." : `Claim ${subdomain || "your"}.${appDomain}`}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowByod((value) => !value)}
        className="text-sm font-medium text-[var(--dash-accent)] hover:underline"
      >
        {showByod ? "Hide" : "Already own a domain? Bring your own instead"}
      </button>

      {showByod && (
        <ByodDomainForm eventId={eventId} hasBasicAccess={hasBasicAccess} defaultValues={defaultValues} />
      )}
    </div>
  );
}

/** Bring-your-own-domain: unchanged from before, just demoted from the only
 * option to an opt-in one for hosts who already have a real domain and want
 * to point it here themselves. */
function ByodDomainForm({
  eventId,
  hasBasicAccess,
  defaultValues,
}: {
  eventId: string;
  hasBasicAccess: boolean;
  defaultValues: DomainEditFormProps["defaultValues"];
}) {
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
    <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
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
