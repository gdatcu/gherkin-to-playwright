// functions/api/convert.ts

// Define the interface so the compiler recognizes 'Env'

interface Env {
  GROQ_API_KEY: string;
  GEMINI_API_KEY: string;
  GROQ_MODEL: string;
  GEMINI_MODEL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { gherkin, systemPrompt, screenshot, baseUrl, htmlContext } = await request.json() as any;
    
    // DECISION LOGIC: 
    // Gemini 2.5 Flash is used if Vision is needed OR if HTML context is provided 
    // Groq (Llama) is used for fast, text-only Gherkin snippets 
    const needsVision = !!screenshot;
    const hasHtml = !!htmlContext;
    const isLargeFile = gherkin.length > 3000 || (htmlContext?.length > 1000);
    const useGemini = needsVision || hasHtml || isLargeFile;

    const endpoint = useGemini 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`
      : `https://api.groq.com/openai/v1/chat/completions`;

    let body;
    if (useGemini) {
      // Gemini Vision/Text Payload with high context window
      const parts = [{ text: `${systemPrompt}\nBase URL: ${baseUrl}\n\nHTML CONTEXT:\n${htmlContext || 'None provided'}\n\nGHERKIN:\n${gherkin}` }];
      if (needsVision) {
        parts.push({ inline_data: { mime_type: "image/png", data: screenshot.split(',')[1] } } as any);
      }
      body = { contents: [{ role: "user", parts }] };
    } else {
      // Groq Text-only Payload optimized for high velocity
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
      headers: { 'Content-Type': 'application/json', ...(useGemini ? {} : { 'Authorization': `Bearer ${env.GROQ_API_KEY}` }) },
      body: JSON.stringify(body)
    });

    const data = await response.json() as any;
    const rawCode = useGemini 
      ? data.candidates?.[0]?.content?.parts?.[0]?.text 
      : data.choices?.[0]?.message?.content;

    // Clean up the output to ensure strictly valid TypeScript
    return new Response(JSON.stringify({ 
      code: rawCode.replace(/```typescript|```|```javascript/g, '').trim(), 
      modelUsed: useGemini ? 'Gemini 2.5 Flash (Context Aware)' : 'Groq (Llama 3.3 Fast)',
      timestamp: new Date().toISOString()
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI processing failed' }), { status: 500 });
  }
};