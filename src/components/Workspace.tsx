// src/components/Workspace.tsx
import { Copy, FileDown } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

// Pre-configure Monaco to support Gherkin
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' } });

interface WorkspaceProps {
  isDark: boolean; // Added isDark prop
  activeTab: string;
  input: string;
  setInput: (val: string) => void;
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export const Workspace = ({ isDark, activeTab, input, setInput, output, onCopy, onDownload }: WorkspaceProps) => {
  const inputEditorRef = useRef<any>(null);
  const outputEditorRef = useRef<any>(null);

  // Pixel Perfect Layout Sync: Recalculate editor size when switching tabs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputEditorRef.current) inputEditorRef.current.layout();
      if (outputEditorRef.current) outputEditorRef.current.layout();
    }, 50); // Small delay to ensure flex container has expanded
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  const handleEditorWillMount = (monaco: any) => {
    monaco.languages.register({ id: 'gherkin' });
    monaco.languages.setMonarchTokensProvider('gherkin', {
      keywords: ['Feature', 'Scenario', 'Given', 'When', 'Then', 'And', 'But', 'Background', 'Examples', 'Scenario Outline'],
      tokenizer: {
        root: [
          [/^(\s*)(Feature|Scenario|Scenario Outline|Background|Examples)(:)/, ['white', 'keyword', 'delimiter']],
          [/^(\s*)(Given|When|Then|And|But)/, ['white', 'keyword']],
          [/"[^"]*"/, 'string'],
          [/@[a-zA-Z0-9_-]+/, 'tag'],
          [/#[^]*$/, 'comment'],
        ]
      }
    });
  };

  const sharedOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    wordWrap: 'on' as const,
    padding: { top: 24 },
    scrollBeyondLastLine: false,
    automaticLayout: true, // Internal resize observer
    overviewRulerBorder: false, // Prevents overlapping ruler visual artifacts
    hideCursorInOverviewRuler: true,
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      <div className={`flex-1 p-0 relative border-r dark:border-zinc-800 border-slate-200 ${activeTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
        <Editor
          height="100%"
          defaultLanguage="gherkin"
          theme={isDark ? "vs-dark" : "light"} // Dynamic theme sync
          value={input}
          onChange={(value) => setInput(value || '')}
          beforeMount={handleEditorWillMount}
          onMount={(editor) => { inputEditorRef.current = editor; }}
          options={sharedOptions}
        />
      </div>

      <div className={`flex-1 p-0 relative dark:bg-[#080808] bg-slate-100 group overflow-hidden ${activeTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="absolute top-4 lg:top-6 right-4 lg:right-8 flex gap-2 z-20">
          <button onClick={onCopy} disabled={!output} className="p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-slate-200 rounded-lg shadow-sm hover:scale-110 transition-all text-slate-500 cursor-pointer">
            <Copy size={16} />
          </button>
          <button onClick={onDownload} disabled={!output} className="p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-slate-200 rounded-lg shadow-sm hover:scale-110 transition-all text-slate-500 cursor-pointer">
            <FileDown size={16} />
          </button>
        </div>
        <div className="w-full h-full">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            theme={isDark ? "vs-dark" : "light"} // Dynamic theme sync
            value={output || "// Architect-level code will generate here..."}
            onMount={(editor) => { outputEditorRef.current = editor; }}
            options={{
              ...sharedOptions,
              readOnly: true,
              fontSize: 12,
              domReadOnly: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};