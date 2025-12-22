import { getAuth } from "../../_auth";

export const onRequest = async (context: any) => {
  const auth = getAuth(context.env, context.request);
  const response = await auth.handler(context.request);
  
  // FIX: Create a new response object to ensure headers are actually applied
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  newResponse.headers.set("Pragma", "no-cache");
  newResponse.headers.set("Expires", "0");
  
  return newResponse;
};