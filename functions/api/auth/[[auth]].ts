// functions/api/auth/[[auth]].ts
import { getAuth } from "../../_auth";

export const onRequest = async (context: any) => {
  const auth = getAuth(context.env, context.request);
  const response = await auth.handler(context.request);
  
  // CLOUDFLARE FIX: Force headers to prevent the "Logged Out" ghosting
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  
  return response;
};  