// functions/api/history.ts

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const { results } = await env.DB.prepare(
    "SELECT * FROM conversion_history ORDER BY timestamp DESC LIMIT 20"
  ).all();
  
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    await env.DB.prepare("DELETE FROM conversion_history WHERE id = ?").bind(id).run();
  } else {
    await env.DB.prepare("DELETE FROM conversion_history").run();
  }

  return new Response(null, { status: 204 });
};