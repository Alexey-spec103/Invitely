import Link from "next/link";
import { Globe, Settings } from "lucide-react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import PublishToggle from "@/app/dashboard/PublishToggle";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import EnvelopeCardPreview from "@/components/paper/EnvelopeCardPreview";
import ProgramCardPreview, { type ProgramCardEvent } from "@/components/paper/ProgramCardPreview";
import DressCodeCardPreview, { type DressCodeCardColor } from "@/components/paper/DressCodeCardPreview";
import TableCardPreview from "@/components/paper/TableCardPreview";
import PlaceCardPreview from "@/components/paper/PlaceCardPreview";
import TableNumberCardPreview from "@/components/paper/TableNumberCardPreview";
import { formatEventDate } from "@/components/paper/formatEventDate";
import type { Theme } from "@/lib/themes";
import type { TableCardData } from "@/components/pdf/TableCardDocument";

interface InvitationsShowcaseProps {
  eventId: string;
  slug: string;
  status: string;
  customDomain: string | null;
  customDomainVerifiedAt: string | null;
  theme: Theme;
  names: string[];
  eventDate: string;
  venueName?: string;
  venueAddress?: string;
  heroPhotoUrl?: string;
  timelineEvents: ProgramCardEvent[];
  dressCodeColors: DressCodeCardColor[];
  tableCardData: TableCardData[];
  tableNames: string[];
  allGuestNames: string[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- gates the table/place/table-number materials specifically, since
   * lib/plans.ts marks banquet/table-card materials as Premium-only. */
  locked: boolean;
}

// A light, repeating scatter -- just enough tilt for the "fan of real
// materials" feeling dashboard-audit.md A10 asks for, without the fragility
// of the marketing landing page's fixed-position 7-item collage (this strip
// renders anywhere from 2 to 6 cards depending on what the event actually has).
const ROTATIONS = [-4, 3, -2, 5, -3, 2];

interface Material {
  key: string;
  render: React.ReactNode;
  aspectRatio: string;
}

/** dashboard-audit.md A10: the "finish screen" weddingpost.ru shows at
 * `/cabinet/finish/invite/` -- a showcase of every material this event
 * actually has (reusing the exact preview components Paper/Banquet already
 * use, so this can never drift out of sync with what's really downloadable),
 * the site's live link, and the closest honest equivalent to weddingpost's
 * purchase CTAs given Invitely has no real payment/paywall yet (see project
 * memory): Publish site is the one action that actually unlocks something. */
export default function InvitationsShowcase({
  eventId,
  slug,
  status,
  customDomain,
  customDomainVerifiedAt,
  theme,
  names,
  eventDate,
  venueName,
  venueAddress,
  heroPhotoUrl,
  timelineEvents,
  dressCodeColors,
  tableCardData,
  tableNames,
  allGuestNames,
  locked,
}: InvitationsShowcaseProps) {
  const dateLabel = formatEventDate(eventDate);

  const materials: Material[] = [
    {
      key: "front",
      aspectRatio: "420 / 595",
      render: (
        <InvitationCardPreview
          theme={theme}
          names={names}
          eventDate={eventDate}
          venueName={venueName}
          venueAddress={venueAddress}
          side="front"
        />
      ),
    },
    {
      key: "envelope",
      aspectRatio: "649 / 459",
      render: <EnvelopeCardPreview theme={theme} names={names} eventDate={eventDate} />,
    },
  ];
  if (timelineEvents.length > 0) {
    materials.push({
      key: "program",
      aspectRatio: "420 / 595",
      render: <ProgramCardPreview theme={theme} events={timelineEvents} />,
    });
  }
  if (dressCodeColors.length > 0) {
    materials.push({
      key: "dressCode",
      aspectRatio: "420 / 595",
      render: <DressCodeCardPreview theme={theme} title="Dress Code" colors={dressCodeColors} />,
    });
  }
  if (tableCardData.length > 0) {
    materials.push({
      key: "table",
      aspectRatio: "420 / 595",
      render: (
        <TableCardPreview
          theme={theme}
          tableName={tableCardData[0].name}
          guestNames={tableCardData[0].guestNames}
          locked={locked}
        />
      ),
    });
  }
  if (allGuestNames.length > 0) {
    materials.push({
      key: "place",
      aspectRatio: "252 / 144",
      render: <PlaceCardPreview theme={theme} guestName={allGuestNames[0]} locked={locked} />,
    });
  }
  if (tableNames.length > 0) {
    materials.push({
      key: "tableNumber",
      aspectRatio: "1 / 1",
      render: <TableNumberCardPreview theme={theme} tableName={tableNames[0]} locked={locked} />,
    });
  }

  const isDomainVerified = Boolean(customDomain && customDomainVerifiedAt);
  const isDomainPending = Boolean(customDomain && !customDomainVerifiedAt);
  const domainLabel = customDomain || `/e/${slug}`;
  const domainDotClass = isDomainVerified
    ? "bg-emerald-500"
    : isDomainPending
      ? "bg-amber-500"
      : "bg-gray-300";

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="grid gap-8 p-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="dash-h2 text-lg text-gray-900">Your complete kit</h2>
          <p className="mt-1 text-sm text-gray-500">
            One design, every piece — download any of these as a print-ready PDF below.
          </p>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            {materials.map((material, index) => (
              <div
                key={material.key}
                // grid, not the div's default block -- InvitationCardPreview's
                // FlipCard renders its faces `position: absolute`, which
                // contributes zero height to a block-level parent and
                // collapses this wrapper to 0px (same fix PlatformFanSection
                // and PaperConstructor already rely on for this component).
                className="grid w-28 shrink-0 overflow-hidden rounded-lg bg-white shadow-md sm:w-32"
                style={{ aspectRatio: material.aspectRatio, transform: `rotate(${ROTATIONS[index % ROTATIONS.length]}deg)` }}
              >
                {material.render}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="relative w-44 overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-gray-900 shadow-xl sm:w-52"
            style={{ aspectRatio: "375 / 750" }}
          >
            <ThemeProvider theme={theme}>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden px-4 text-center"
                style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)" }}
              >
                {heroPhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroPhotoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className={heroPhotoUrl ? "relative z-10 rounded-md bg-black/35 px-3 py-2 text-white" : "relative z-10"}>
                  <p style={{ fontFamily: "var(--theme-font-heading)" }} className="text-lg font-semibold">
                    {names[0]}
                    {names[1] && ` & ${names[1]}`}
                  </p>
                  <p
                    style={{ fontFamily: "var(--theme-font-body)", color: heroPhotoUrl ? undefined : "var(--theme-accent)" }}
                    className="mt-1 text-[11px] tracking-wide"
                  >
                    {dateLabel.toUpperCase()}
                  </p>
                </div>
              </div>
            </ThemeProvider>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${domainDotClass}`} aria-hidden="true" />
            <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
            <span className="max-w-[10rem] truncate text-sm font-medium text-gray-700">{domainLabel}</span>
            <Link
              href={`/dashboard/${eventId}/site#custom-domain-card`}
              title="Manage domain"
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
        <PublishToggle eventId={eventId} status={status} />
        <Link
          href={`/dashboard/${eventId}/plan`}
          className="mt-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Change plan
        </Link>
        <Link
          href={`/dashboard/${eventId}/paper`}
          className="mt-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Continue editing →
        </Link>
      </div>
    </div>
  );
}
