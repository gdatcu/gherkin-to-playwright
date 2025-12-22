// functions/api/convert.ts
import { getAuth } from "../_auth";

export const onRequest = async (context: any) => {
  const { env, request } = context;
  const auth = getAuth(env, request); 
  
  // 1. Get Session safely
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id || null;

  try {
    const { gherkin, systemPrompt, screenshot, baseUrl, htmlContext } = await request.json() as any;
    
    const needsVision = !!screenshot;
    const hasHtml = !!htmlContext;
    const isLargeFile = gherkin.length > 3000 || (htmlContext?.length > 1000);
    const useGemini = needsVision || hasHtml || isLargeFile;

    const endpoint = useGemini 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`
      : `https://api.groq.com/openai/v1/chat/completions`;

    let body;
    if (useGemini) {
      const parts = [{ text: `${systemPrompt}\nBase URL: ${baseUrl}\n\nHTML CONTEXT:\n${htmlContext || 'None provided'}\n\nGHERKIN:\n${gherkin}` }];
      if (needsVision) {
        parts.push({ inline_data: { mime_type: "image/png", data: screenshot.split(',')[1] } } as any);
      }
      body = { contents: [{ role: "user", parts }] };
    } else {
      body = { 
        model: env.GROQ_MODEL, 
        messages: [
          { role: 'system', content: `${systemPrompt}\nBase URL: ${baseUrl}` }, 
          { role: 'user', content: gherkin }
        ] 
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        ...(useGemini ? {} : { 'Authorization': `Bearer ${env.GROQ_API_KEY}` }) 
      },
      body: JSON.stringify(body)
    });

    const data = await response.json() as any;
    const rawCode = useGemini 
      ? data.candidates?.[0]?.content?.parts?.[0]?.text 
      : data.choices?.[0]?.message?.content;

    const cleanedCode = rawCode.replace(/```typescript|```|```javascript/g, '').trim();
    const modelLabel = useGemini ? 'Gemini' : 'Groq';

    // 2. Save to D1 Database (Now including userId column)
    try {
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO conversion_history (id, gherkin, playwright, baseUrl, model, userId) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(id, gherkin, cleanedCode, baseUrl, modelLabel, userId)
      .run();
    } catch (dbErr) {
      console.error("History Save Failed:", dbErr);
    }

    return new Response(JSON.stringify({ 
      code: cleanedCode, 
      modelUsed: modelLabel,
      timestamp: new Date().toISOString()
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI processing failed' }), { status: 500 });
  }
};