// better-auth-config.ts
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
    // We use a local temp file just so the CLI can initialize
    database: new Database("./local-tmp.db"), 
    socialProviders: {
        google: {
            clientId: "CLI_ONLY",
            clientSecret: "CLI_ONLY",
        },
    },
});