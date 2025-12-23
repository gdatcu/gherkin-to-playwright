// src/utils/file.ts
export const downloadPlaywrightFile = (content: string, fileName: string = 'playwright-test.spec.ts') => {
  if (!content) return;
  const blob = new Blob([content], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};