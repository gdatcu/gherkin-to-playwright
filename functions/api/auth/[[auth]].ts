// functions/api/auth/[[auth]].ts
import { getAuth } from "../../_auth";

/**
 * Cloudflare Pages Auth Handler
 * This handles all BetterAuth routes like /api/auth/sign-in/social, 
 * /api/auth/callback, and /api/auth/get-session.
 */
export const onRequest = async (context: any) => {
  // Use the standardized helper to get the auth instance
  // This helper already contains the Drizzle schema and Edge-compatibility fixes.
  const auth = getAuth(context.env);

  // Return the standard BetterAuth handler
  return auth.handler(context.request);
};