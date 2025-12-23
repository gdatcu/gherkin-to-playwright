// src/components/Workspace.tsx
import { Copy, FileDown } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';

// Pre-configure Monaco to support Gherkin
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' } });

interface WorkspaceProps {
  activeTab: string;
  input: string;
  setInput: (val: string) => void;
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export const Workspace = ({ activeTab, input, setInput, output, onCopy, onDownload }: WorkspaceProps) => {
  
  const handleEditorWillMount = (monaco: any) => {
    // Define Gherkin language for syntax highlighting
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Input Tab with Monaco Editor */}
      <div className={`flex-1 p-0 relative border-r dark:border-zinc-800 border-slate-200 ${activeTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
        <Editor
          height="100%"
          defaultLanguage="gherkin"
          theme="vs-dark"
          value={input}
          onChange={(value) => setInput(value || '')}
          beforeMount={handleEditorWillMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            padding: { top: 24 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Output Tab (Read-only Monaco) */}
      <div className={`flex-1 p-0 relative dark:bg-[#080808] bg-slate-100 group overflow-auto ${activeTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
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
            theme="vs-dark"
            value={output || "// Architect-level code will generate here..."}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'on',
              wordWrap: 'on',
              padding: { top: 24 },
              scrollBeyondLastLine: false,
              domReadOnly: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};