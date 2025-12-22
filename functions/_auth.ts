// functions/_auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db-schema"; 

export const getAuth = (env: any, request: Request) => {
  const url = new URL(request.url);
  const prodDomain = "https://gherkin-to-playwright.pages.dev";
  const baseURL = url.origin.includes("127.0.0.1") ? url.origin : prodDomain;

  return betterAuth({
    database: drizzleAdapter(
      drizzle(env.DB, { schema }), 
      {
        provider: "sqlite",
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }
    ),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: baseURL,
    
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },

    trustedOrigins: [
      "http://127.0.0.1:8788",
      "https://gherkin-to-playwright.pages.dev"
    ],

    advanced: {
      useSecureCookies: !url.origin.includes("127.0.0.1"),
      cookieCustomAttributes: {
        sameSite: "Lax",
        secure: true
      },
      // Forces the session to persist across browser restarts
      sessionCookieMaxAge: 60 * 60 * 24 * 7, 
    }
  });
};