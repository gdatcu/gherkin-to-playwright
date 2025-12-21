// functions/_auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db-schema"; 

export const getAuth = (env: any) => {
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
    // Critical: These must match the URL in your browser address bar
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL, 
    
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
};