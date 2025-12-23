// src/components/Workspace.tsx
import { Copy, FileDown } from 'lucide-react';

interface WorkspaceProps {
  activeTab: string;
  input: string;
  setInput: (val: string) => void;
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export const Workspace = ({ activeTab, input, setInput, output, onCopy, onDownload }: WorkspaceProps) => (
  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
    <div className={`flex-1 p-0 relative border-r dark:border-zinc-800 border-slate-200 ${activeTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
      <textarea 
        className="w-full h-full dark:bg-[#0d0d0d] bg-white p-6 lg:p-10 outline-none dark:text-zinc-200 text-slate-700 font-mono text-sm leading-relaxed resize-none"
        placeholder="Scenario: User can Login..."
        value={input} onChange={(e) => setInput(e.target.value)}
      />
    </div>

    <div className={`flex-1 p-0 relative dark:bg-[#080808] bg-slate-100 group overflow-auto ${activeTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
      <div className="absolute top-4 lg:top-6 right-4 lg:right-8 flex gap-2 z-10">
        <button onClick={onCopy} disabled={!output} className="p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-slate-200 rounded-lg shadow-sm hover:scale-110 transition-all text-slate-500"><Copy size={16} /></button>
        <button onClick={onDownload} disabled={!output} className="p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-slate-200 rounded-lg shadow-sm hover:scale-110 transition-all text-slate-500"><FileDown size={16} /></button>
      </div>
      <pre className="w-full h-full p-6 lg:p-10 font-mono text-[11px] lg:text-[13px] leading-relaxed !bg-transparent text-left">
        <code className="language-typescript">
          {output || "// Architect-level code will generate here..."}
        </code>
      </pre>
    </div>
  </div>
);