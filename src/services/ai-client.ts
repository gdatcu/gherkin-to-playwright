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