// src/types/index.ts

export interface HistoryItem {
  id: string;
  gherkin: string;
  playwright: string;
  baseUrl: string;
  model: string;
  timestamp: string;
}

// Goal: Project-Aware Context
export interface PageObjectFile {
  name: string;
  content: string;
}

export type TemplateType = 'pom' | 'step-defs';

export type TabType = 'context' | 'input' | 'output' | 'history';