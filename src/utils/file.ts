// src/utils/file.ts
import JSZip from 'jszip';

/**
 * Lead Architect Splitting Logic
 * Parses AI output into a professional directory structure.
 */
export const downloadProjectZip = async (content: string, template: 'pom' | 'step-defs') => {
  if (!content) return;

  const zip = new JSZip();
  const root = zip.folder("playwright-automation");

  // 1. Check for explicit File Markers (e.g., // File: models/loginPage.ts)
  // This is the most reliable method as it respects the AI's intended structure.
  const fileMarkerRegex = /\/\/ File: ([\w\/\.-]+).*\n([\s\S]*?)(?=\/\/ File:|$)/g;
  const matches = [...content.matchAll(fileMarkerRegex)];

  if (matches.length > 0) {
    matches.forEach(match => {
      const filePath = match[1].trim();
      const fileContent = match[2].trim();
      root?.file(filePath, fileContent);
    });
  } else if (template === 'pom') {
    // 2. Fallback: Robust Class-based extraction for POM
    // Matches "class ...Page { ... }" even without the 'export' keyword
    const pageClassRegex = /(class (\w+Page)[\s\S]*?^})/gm;
    let mainTestFile = content;
    const foundPages: { name: string; content: string }[] = [];

    let match;
    while ((match = pageClassRegex.exec(content)) !== null) {
      const className = match[2];
      const classCode = match[1];
      foundPages.push({ name: className, content: classCode });
      mainTestFile = mainTestFile.replace(classCode, "");
    }

    // Save extracted Page Objects to a /models folder
    foundPages.forEach(p => {
      root?.file(`models/${p.name}.ts`, `import { Page, expect } from '@playwright/test';\n\nexport ${p.content}`);
    });

    // Create the test file with necessary imports
    const imports = foundPages.map(p => `import { ${p.name} } from '../models/${p.name}';`).join('\n');
    root?.file("tests/gherkin.spec.ts", `${imports}\n\n${mainTestFile.trim()}`);
  } else {
    // 3. Standard Fallback for Step-Defs
    root?.file("tests/steps.spec.ts", content);
  }

  // Ensure a base configuration is always included
  if (!root?.file("playwright.config.ts")) {
    root?.file("playwright.config.ts", `import { defineConfig } from '@playwright/test';\nexport default defineConfig({ testDir: './tests', use: { headless: true } });`);
  }

  // Trigger Download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `playwright-architect-project.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};