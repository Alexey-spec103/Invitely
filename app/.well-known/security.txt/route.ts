import { NextResponse } from "next/server";

// security-baseline audit (2026-10-19): RFC 9116's standard location for a
// security contact -- the one place a researcher who finds a real issue
// knows to look before trying anything else. `Expires` is a required field
// per the RFC (a security.txt with no expiry is meant to be treated as
// stale/untrustworthy by consumers) -- a generous one-year-out date is the
// common convention rather than a short-lived one that silently goes stale
// and needs babysitting.
const SECURITY_TXT = `Contact: mailto:support@invimbo.com
Expires: 2027-10-19T00:00:00.000Z
Preferred-Languages: en, ru
`;

export async function GET() {
  return new NextResponse(SECURITY_TXT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
