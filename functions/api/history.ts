// functions/api/history.ts
import { getAuth } from "../_auth";

export const onRequestGet = async (context: any) => {
  const { env, request } = context;
  const auth = getAuth(env, request);
  
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Filter results so users ONLY see their own data
  const { results } = await env.DB.prepare(
    "SELECT * FROM conversion_history WHERE userId = ? ORDER BY id DESC"
  )
  .bind(session.user.id)
  .all();

  return Response.json(results);
};

export const onRequestDelete = async (context: any) => {
  const { env, request } = context;
  const auth = getAuth(env, request);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    // Ownership check: users can only delete their own records
    await env.DB.prepare("DELETE FROM conversion_history WHERE id = ? AND userId = ?")
      .bind(id, session.user.id)
      .run();
  } else {
    // Batch delete for current user only
    await env.DB.prepare("DELETE FROM conversion_history WHERE userId = ?")
      .bind(session.user.id)
      .run();
  }

  return new Response(null, { status: 204 });
};