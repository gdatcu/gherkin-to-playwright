// src/components/MobileNav.tsx
import { FileText, Code, History, Settings2 } from 'lucide-react';
// FIX: Use import type for types
import type { TabType } from '../types';

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
}

export const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps) => (
  <nav className="lg:hidden h-20 pb-4 flex border-t dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
    <button onClick={() => setActiveTab('input')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'input' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}>
      <FileText size={18} />
      <span className="text-[9px] font-bold uppercase">Gherkin</span>
    </button>
    <button onClick={() => setActiveTab('output')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'output' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}>
      <Code size={18} />
      <span className="text-[9px] font-bold uppercase">Code</span>
    </button>
    <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}>
      <History size={18} />
      <span className="text-[9px] font-bold uppercase">History</span>
    </button>
    <button onClick={() => setActiveTab('context')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'context' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}>
      <Settings2 size={18} />
      <span className="text-[9px] font-bold uppercase">Setup</span>
    </button>
  </nav>
);