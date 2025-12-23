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
    const { gherkin, template, screenshot, baseUrl, htmlContext, mode, pageObjectLibrary } = await request.json() as any;
    
    // 1. Initial System Prompt Selection
    let systemPrompt = TEMPLATES[template as keyof typeof TEMPLATES] || TEMPLATES.pom;

    // 2. Project-Aware Context Injection (Existing Page Object Memory)
    // Only inject library context if we are in standard conversion mode
    if (!mode && pageObjectLibrary && pageObjectLibrary.length > 0) {
      const libraryContext = pageObjectLibrary.map((f: any) => `FILE: ${f.name}\n${f.content}`).join('\n\n');
      systemPrompt += `\n\nEXISTING PAGE OBJECT LIBRARY:\nUse the following existing Page Objects and their methods if relevant to the scenario. Reuse existing methods instead of generating new element interactions. Maintain current naming conventions and imports.\n${libraryContext}`;
    }

    // 3. Mode-Specific Overrides (Refactor or Heal)
    if (mode === 'refactor') systemPrompt = REFACTOR_PROMPT;
    if (mode === 'heal') systemPrompt = HEAL_PROMPT;

    // 4. Intelligence Routing Logic
    const needsVision = !!screenshot;
    const hasHtml = !!htmlContext;
    const isLargeFile = gherkin.length > 3000 || (htmlContext?.length > 1000) || (pageObjectLibrary?.length > 0);
    
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

    // 5. AI Execution
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

    // 6. Output Cleaning
    const cleanedResult = rawResult.replace(/```typescript|```javascript|```gherkin|```/g, '').trim();
    const modelLabel = useGemini ? 'Gemini' : 'Groq';

    // 7. Persistence: Save to history ONLY for full conversions
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