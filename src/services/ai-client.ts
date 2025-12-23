// src/services/ai-client.ts
import type { PageObjectFile } from '../types';

export const convertGherkin = async (
  text: string, 
  baseUrl: string, 
  screenshot: string | null, 
  htmlContext: string,
  template: string = 'pom',
  pageObjectLibrary: PageObjectFile[] = [] // Goal: Pass existing library
) => {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        gherkin: text,
        baseUrl: baseUrl,
        screenshot: screenshot,
        htmlContext: htmlContext,
        template: template,
        pageObjectLibrary: pageObjectLibrary // Context injection
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || 'Conversion failed');
  }
  
  return response.json();
};

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