import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { planMeets } from "@/lib/plans";

const RESERVED_PATH_PREFIXES = [
  "/dashboard",
  "/login",
  "/signup",
  "/onboarding",
  "/api",
  "/e",
  "/_next",
];

// Custom-domain visitors hit us on their own hostname (e.g. yourwedding.com)
// instead of our app domain. If that hostname matches a verified
// events.custom_domain, rewrite the request to the matching /e/[slug] site
// so the visitor's browser keeps showing their own domain in the address bar.
export async function resolveCustomDomain(request: NextRequest): Promise<NextResponse | null> {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  if (!appDomain) {
    return null;
  }

  const hostname = request.nextUrl.hostname;
  if (hostname === appDomain || hostname === "localhost") {
    return null;
  }

  if (RESERVED_PATH_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return null;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  const { data: event } = await supabase
    .from("events")
    .select("slug, plan_id")
    .eq("custom_domain", hostname)
    .not("custom_domain_verified_at", "is", null)
    .maybeSingle();

  // dashboard-audit.md Block E part 2: the actual routing is the "final
  // result" this whole feature is gated on -- checked again here (not just
  // at verification time) so a plan downgrade after verifying stops the
  // domain from working without needing any extra cleanup step.
  if (!event || !planMeets(event.plan_id, "basic")) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/e/${event.slug}${request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Обязательный вызов: обновляет истёкший токен и кладёт новую сессию в куки ответа
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous trial: give a visitor reaching /onboarding with no session at
  // all a real (anonymous) session before the wizard renders, so every step
  // from here on persists under a real owner_id. Scoped to this one path so
  // marketing-page visitors/bots never get an anonymous user created. Must
  // happen here (middleware), not in the page component -- Server
  // Components can't set cookies, only middleware/Server Actions/Route
  // Handlers can, and this client's `setAll` above already wires any new
  // session onto `supabaseResponse` automatically.
  if (!user && request.nextUrl.pathname === "/onboarding") {
    await supabase.auth.signInAnonymously();
  }

  return supabaseResponse;
}
