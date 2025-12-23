// src/components/Header.tsx
import { Sparkles, Terminal, Wand2 } from 'lucide-react';

interface HeaderProps {
  loading: boolean;
  refactoring: boolean; // Goal #5
  input: string;
  meta: { model?: string } | null;
  onConvert: () => void;
  onRefactor: () => void; // Goal #5
}

export const Header = ({ loading, refactoring, input, meta, onConvert, onRefactor }: HeaderProps) => (
  <header className="h-16 border-b dark:border-zinc-800 border-slate-200 flex items-center justify-between px-4 lg:px-8 bg-inherit z-50 shrink-0">
    <div className="flex items-center gap-2 text-xs font-semibold dark:text-zinc-500 text-slate-400">
      <Terminal size={14} className="hidden sm:block" /> 
      <span>gherkin-to-playwright.ts</span>
      {meta?.model && <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px]">{meta.model}</span>}
    </div>
    
    <div className="flex items-center gap-2">
      {/* Goal #5 Action */}
      <button 
        onClick={onRefactor}
        disabled={loading || refactoring || !input}
        className="text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {refactoring ? <span className="animate-pulse">Refactoring...</span> : <><Wand2 size={14} /> <span className="hidden sm:inline">Clean to Gherkin</span></>}
      </button>

      <button 
        onClick={onConvert}
        disabled={loading || refactoring || !input}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-8 py-2 rounded-lg text-xs font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <span className="animate-pulse">Analyzing...</span> : <><Sparkles size={14} /> <span className="hidden sm:inline">Generate Code</span><span className="sm:hidden">Run</span></>}
      </button>
    </div>
  </header>
);