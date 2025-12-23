// src/services/ai-client.ts

export const convertGherkin = async (
  text: string, 
  baseUrl: string, 
  screenshot: string | null, 
  htmlContext: string,
  template: string = 'pom'
) => {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        gherkin: text,
        baseUrl: baseUrl,
        screenshot: screenshot,
        htmlContext: htmlContext,
        template: template 
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || 'Conversion failed');
  }
  
  return response.json();
};

/**
 * Goal #3: Self-Healing Logic
 * Analyzes HTML Context to suggest resilient Playwright locators.
 */
export const healSelectors = async (html: string, gherkin: string) => {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        gherkin,
        htmlContext: html,
        mode: 'heal'
    }),
  });

  if (!response.ok) throw new Error('Healing failed');
  return response.json();
};

/**
 * Goal #5: Test-to-Gherkin Logic
 * Refactors messy manual notes into standardized Gherkin.
 */
export const draftGherkin = async (rawNotes: string) => {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        gherkin: rawNotes,
        mode: 'refactor' 
    }),
  });

  if (!response.ok) throw new Error('Refactoring failed');
  return response.json();
};