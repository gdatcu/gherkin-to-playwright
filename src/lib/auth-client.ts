// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use window.location.origin to match the current environment
  baseURL: typeof window !== "undefined" ? window.location.origin : "https://gherkin-to-playwright.pages.dev",
  fetchOptions: {
    cache: "no-store", 
  }
});