import type { NextRequest } from "next/server";
import { updateSession, resolveCustomDomain } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const domainRewrite = await resolveCustomDomain(request);
  if (domainRewrite) {
    return domainRewrite;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Не запускать на: _next/static, _next/image, favicon.ico
     * и статичных файлах (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
