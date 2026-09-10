/** dashboard-audit.md B4: the shell chrome (header + rail) is dark only on
 * the actual constructor screens (Site, Paper, Canvas); every other cabinet
 * screen is light. Shared by DashboardShell (header) and DashboardNav (rail)
 * so the two can't drift out of sync on what counts as "the constructor". */
export function isConstructorRoute(pathname: string, eventId: string): boolean {
  const base = `/dashboard/${eventId}`;
  return (
    pathname.startsWith(`${base}/site`) ||
    pathname.startsWith(`${base}/paper`) ||
    pathname.startsWith(`${base}/canvas`)
  );
}
