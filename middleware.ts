import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match request paths that need auth processing:
     * - /admin/* (admin routes)
     * - /profile/* (profile routes)
     * - /test-crud/* (test crud routes)
     * - /auth/* (auth callback routes)
     * - /login (login page)
     *
     * Skip static files and public assets
     */
    "/(admin|profile|test-crud|auth|login)(.*)",
  ],
};
