// functions/api/convert.ts
import { getAuth } from "../_auth";
import { TEMPLATES } from "./prompt";

// Goal #5: Specialized Prompt for Gherkin Refactoring
const REFACTOR_PROMPT = `
You are a Gherkin Expert. 
TASK: Transform messy, manual test notes into standardized Gherkin syntax.
CONSTRAINTS:
- Use ONLY Feature, Scenario, Given, When, Then, And, But.
- DO NOT generate Playwright code.
- DO NOT provide explanations or commentary.
- Output ONLY the raw Gherkin text.
`;

// Goal #3: Specialized Prompt for Selector Healing
const HEAL_PROMPT = `
You are a Playwright Test Architect.
TASK: Analyze the provided HTML and Gherkin step to suggest a resilient locator.
CONSTRAINTS:
- Favor data-testid, aria-role, or stable text-based locators.
- Provide a 1-sentence analysis followed by the optimized Playwright locator code.
- Format the output as plain text.
`;

export const onRequest = async (context: any) => {
  const { env, request } = context;
  const auth = getAuth(env, request); 
  
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id || null;

  try {
    const { gherkin, template, screenshot, baseUrl, htmlContext, mode } = await request.json() as any;
    
    // Select correct template prompt based on mode (Goal #3 & #5) or standard template
    let systemPrompt = TEMPLATES[template as keyof typeof TEMPLATES] || TEMPLATES.pom;
    if (mode === 'refactor') systemPrompt = REFACTOR_PROMPT;
    if (mode === 'heal') systemPrompt = HEAL_PROMPT;

    const needsVision = !!screenshot;
    const hasHtml = !!htmlContext;
    const isLargeFile = gherkin.length > 3000 || (htmlContext?.length > 1000);
    
    // Force Gemini for Vision, Large Context, or Healing Analysis
    const useGemini = needsVision || hasHtml || isLargeFile || mode === 'heal';

    const endpoint = useGemini 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`
      : `https://api.groq.com/openai/v1/chat/completions`;

    let body;
    if (useGemini) {
      const parts = [{ 
        text: `${systemPrompt}\nBase URL: ${baseUrl || 'N/A'}\n\nHTML CONTEXT:\n${htmlContext || 'None'}\n\nINPUT:\n${gherkin}` 
      }];
      if (needsVision) {
        parts.push({ inline_data: { mime_type: "image/png", data: screenshot.split(',')[1] } } as any);
      }
      body = { contents: [{ role: "user", parts }] };
    } else {
      body = { 
        model: env.GROQ_MODEL, 
        messages: [
          { role: 'system', content: `${systemPrompt}\nBase URL: ${baseUrl || 'N/A'}` }, 
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
    const rawResult = useGemini 
      ? data.candidates?.[0]?.content?.parts?.[0]?.text 
      : data.choices?.[0]?.message?.content;

    // Clean markdown and artifacts
    const cleanedResult = rawResult.replace(/```typescript|```javascript|```gherkin|```/g, '').trim();
    const modelLabel = useGemini ? 'Gemini' : 'Groq';

    // Persistence: Save to history ONLY for full conversions (where mode is absent)
    if (!mode) {
      try {
        const id = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO conversion_history (id, gherkin, playwright, baseUrl, model, userId) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(id, gherkin, cleanedResult, baseUrl, modelLabel, userId)
        .run();
      } catch (dbErr) {
        console.error("History Save Failed:", dbErr);
      }
    }

    return new Response(JSON.stringify({ 
      code: cleanedResult, 
      gherkin: mode === 'refactor' ? cleanedResult : undefined,
      analysis: mode === 'heal' ? cleanedResult : undefined,
      modelUsed: modelLabel,
      timestamp: new Date().toISOString()
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI processing failed' }), { status: 500 });
  }
};