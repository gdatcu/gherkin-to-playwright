// src/components/TemplateSelector.tsx

interface TemplateSelectorProps {
  current: 'pom' | 'step-defs';
  onChange: (val: 'pom' | 'step-defs') => void;
}

export const TemplateSelector = ({ current, onChange }: TemplateSelectorProps) => (
  <section className="space-y-3 mt-6">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 block text-left">Output Architecture</label>
    <div className="grid grid-cols-2 gap-2 p-1 dark:bg-zinc-900 bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg">
      <button 
        onClick={() => onChange('pom')}
        className={`py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${current === 'pom' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-500'}`}
      >
        Standard POM
      </button>
      <button 
        onClick={() => onChange('step-defs')}
        className={`py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${current === 'step-defs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-500'}`}
      >
        Step Defs
      </button>
    </div>
  </section>
);