/** Shared between the public site's `generateMetadata` (app/e/[slug]/page.tsx)
 * and the dashboard's "Link preview" quick-settings card (dashboard-audit.md
 * B14) so the mockup a host sees while editing is the exact same
 * title/description a messenger will actually render, not an approximation
 * that could drift out of sync with it. */
export function formatEventDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function getInviteDescription(eventDate: string): string {
  return `You're invited — ${formatEventDate(eventDate)}. See the details and RSVP.`;
}
