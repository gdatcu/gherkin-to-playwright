import { getAuth } from "../_auth";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const auth = getAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });

  // Safety: Only return history for logged-in users
  if (!session) {
    return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM conversion_history WHERE userId = ? ORDER BY timestamp DESC LIMIT 20"
  )
  .bind(session.user.id)
  .all();
  
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const auth = getAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    // Ensure the user owns the record they are trying to delete
    await env.DB.prepare("DELETE FROM conversion_history WHERE id = ? AND userId = ?")
      .bind(id, session.user.id)
      .run();
  } else {
    // Delete all records belonging to THIS user
    await env.DB.prepare("DELETE FROM conversion_history WHERE userId = ?")
      .bind(session.user.id)
      .run();
  }

  return new Response(null, { status: 204 });
};