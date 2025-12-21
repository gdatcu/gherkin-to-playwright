// src/lib/auth-client.ts

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // In development, we use the Vite proxy (/api -> :8788)
  // In production, it defaults to the current window origin
//   baseURL: import.meta.env.PROD ? undefined : window.location.origin
    baseURL: window.location.origin 
});