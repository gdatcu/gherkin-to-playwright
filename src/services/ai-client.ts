// src/services/ai-client.ts
import { GHERKIN_SYSTEM_PROMPT } from '../../functions/api/prompt';

export const convertGherkin = async (text: string, baseUrl: string, screenshot: string | null, htmlContext: string) => {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        gherkin: text,
        baseUrl: baseUrl,
        screenshot: screenshot,
        htmlContext: htmlContext, // New Field
        systemPrompt: GHERKIN_SYSTEM_PROMPT 
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || 'Conversion failed');
  }
  
  return response.json();
};