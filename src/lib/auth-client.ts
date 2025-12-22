// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://gherkin-to-playwright.pages.dev",
  fetchOptions: {
    // Hard-disable fetch caching at the browser level
    cache: "no-store", 
  }
});