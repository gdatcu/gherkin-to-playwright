// src/components/Sidebar.tsx
import { 
  Globe, Image as ImageIcon, Zap, Sun, Moon, Trash2, 
  History, Clock, X 
} from 'lucide-react';
import { AuthStatus } from './AuthStatus';
import { TemplateSelector } from './TemplateSelector';

export const Sidebar = ({ 
  isDark, setIsDark, activeTab, session, handleLogin, handleLogout, 
  baseUrl, setBaseUrl, resetContext, template, setTemplate, 
  htmlContext, setHtmlContext, screenshot, setScreenshot,
  history, loadFromHistory, deleteHistoryItem
}: any) => (
  <aside className={`
    ${(activeTab === 'context' || activeTab === 'history') ? 'flex' : 'hidden'} 
    lg:flex lg:w-80 w-full flex-1 lg:flex-none border-r dark:border-zinc-800 border-slate-200 dark:bg-zinc-950 bg-white flex-col z-20 overflow-hidden shrink-0
  `}>
    <div className="p-6 flex items-center justify-between border-b dark:border-zinc-800 border-slate-100">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg"><Zap className="text-white" size={18} fill="currentColor" /></div>
        <span className="font-bold tracking-tight dark:text-white text-slate-900 italic uppercase">ShipFast QA</span>
      </div>
      <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <AuthStatus session={session} handleLogin={handleLogin} handleLogout={handleLogout} />

      <div className={activeTab === 'history' ? 'lg:block hidden' : 'block'}>
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Target URL</label>
            <button onClick={resetContext} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase flex items-center gap-1">
              <Trash2 size={12} /> Reset
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 dark:bg-zinc-900 bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg">
            <Globe size={14} className="text-slate-400" />
            <input className="bg-transparent border-none outline-none text-xs w-full dark:text-zinc-200 text-slate-700 font-medium" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
        </section>

        <TemplateSelector current={template} onChange={setTemplate} />

        <section className="space-y-3 mt-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 block text-left">DOM Context (HTML)</label>
          <textarea 
            className="w-full min-h-[120px] dark:bg-zinc-900 bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg p-3 text-[10px] font-mono outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-y dark:text-zinc-300 text-slate-600"
            placeholder="Paste OuterHTML here..."
            value={htmlContext} onChange={(e) => setHtmlContext(e.target.value)}
          />
        </section>

        <section className="mt-6">
          <label className="block w-full cursor-pointer group text-left">
            <div className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed dark:border-zinc-800 border-slate-200 rounded-xl hover:border-indigo-500 transition-all dark:bg-zinc-900/30 bg-slate-50">
              <ImageIcon size={20} className={`${screenshot ? 'text-indigo-500' : 'text-slate-400'} group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">{screenshot ? "UI Logic Loaded" : "Upload UI Ref"}</span>
            </div>
            <input type="file" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setScreenshot(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} accept="image/*" />
          </label>
        </section>
      </div>

      <div className={activeTab === 'context' ? 'lg:block hidden pt-4' : 'block pt-2'}>
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2 mb-4">
          <History size={12} /> Recent Conversions
        </label>
        <div className="space-y-3">
          {!session ? (
             <div className="text-[9px] text-slate-400 uppercase font-bold py-8 text-center border border-dashed dark:border-zinc-800 rounded-lg px-4">
              Sign in to view history
             </div>
          ) : history.length === 0 ? (
            <div className="text-[10px] text-slate-400 italic py-8 text-center border border-dashed dark:border-zinc-800 rounded-lg">
              No conversions saved yet
            </div>
          ) : (
            history.map((item: any) => (
              <div 
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="group relative p-3 rounded-lg border dark:border-zinc-800 border-slate-200 hover:border-indigo-500 dark:hover:bg-zinc-900 bg-white dark:bg-transparent cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-indigo-500 truncate pr-4 uppercase">
                    {item.gherkin.split('\n')[0].replace('Scenario:', '').trim() || 'Untitled'}
                  </span>
                  <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)} 
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <Clock size={10} />
                  {new Date(item.timestamp).toLocaleDateString()} • {item.model}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </aside>
);