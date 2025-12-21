import { useState, useEffect } from 'react';
import { 
  Code2, Sparkles, Globe, Image as ImageIcon, Zap, Sun, Moon, 
  Copy, Check, Terminal, FileDown, Trash2, Settings2, FileText, Code
} from 'lucide-react';
import { convertGherkin } from './services/ai-client';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [input, setInput] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://app.example.com');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [htmlContext, setHtmlContext] = useState('');
  const [output, setOutput] = useState('');
  const [meta, setMeta] = useState<{ model?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Mobile Navigation State
  const [activeTab, setActiveTab] = useState<'context' | 'input' | 'output'>('input');

  useEffect(() => {
    const root = window.document.documentElement;
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    Prism.highlightAll();
  }, [isDark]);

  useEffect(() => {
    if (output) {
      Prism.highlightAll();
      // Auto-switch to output tab on mobile for immediate results
      if (window.innerWidth < 1024) setActiveTab('output');
    }
  }, [output]);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const data = await convertGherkin(input, baseUrl, screenshot, htmlContext);
      setOutput(data.code);
      setMeta({ model: data.modelUsed });
    } catch (e) { 
      alert("Conversion Failed. Check your Cloudflare Environment Variables."); 
    } finally { 
      setLoading(false); 
    }
  };

  const resetContext = () => {
    if (confirm("Reset all inputs?")) {
      setInput('');
      setHtmlContext('');
      setScreenshot(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'playwright-test.spec.ts';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full font-sans transition-colors duration-300 dark:bg-[#0a0a0a] bg-slate-50 relative overflow-hidden">
      
      {/* GLOBAL TOAST */}
      {copied && (
        <div className="fixed top-5 lg:top-20 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in">
          <Check size={14} /> Copied to Clipboard
        </div>
      )}

      {/* Sidebar - Settings Context */}
      <aside className={`
        ${activeTab === 'context' ? 'flex' : 'hidden'} 
        lg:flex lg:w-80 w-full flex-1 lg:flex-none border-r dark:border-zinc-800 border-slate-200 dark:bg-zinc-950 bg-white flex-col p-6 z-20 overflow-y-auto shrink-0
      `}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg"><Zap className="text-white" size={18} fill="currentColor" /></div>
            <span className="font-bold tracking-tight dark:text-white text-slate-900 italic uppercase">ShipFast QA</span>
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="space-y-8 flex-1">
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

          <section className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 block text-left">DOM Context (HTML)</label>
            <textarea 
              className="w-full min-h-[140px] dark:bg-zinc-900 bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg p-3 text-[10px] font-mono outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-y dark:text-zinc-300 text-slate-600"
              placeholder="Paste OuterHTML here..."
              value={htmlContext} onChange={(e) => setHtmlContext(e.target.value)}
            />
          </section>

          <section>
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

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mt-6 hidden lg:block">
            <h4 className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-2 mb-2">
              <Code2 size={12} /> Architect Tip
            </h4>
            <p className="text-[10px] leading-relaxed dark:text-zinc-400 text-slate-500">
              Save POM classes in <span className="font-mono text-indigo-400">/models</span> and test specs in <span className="font-mono text-indigo-400">/tests</span>.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className={`flex-1 flex flex-col relative dark:bg-zinc-950 bg-white ${activeTab === 'context' ? 'hidden lg:flex' : 'flex'} overflow-hidden`}>
        <header className="h-16 border-b dark:border-zinc-800 border-slate-200 flex items-center justify-between px-4 lg:px-8 bg-inherit z-50 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold dark:text-zinc-500 text-slate-400">
            <Terminal size={14} className="hidden sm:block" /> <span>gherkin-to-playwright.ts</span>
          </div>
          <button 
            onClick={handleConvert}
            disabled={loading || !input}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-8 py-2 rounded-lg text-xs font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <span className="animate-pulse">Analyzing...</span> : <><Sparkles size={14} /> <span className="hidden sm:inline">Generate Code</span><span className="sm:hidden">Run</span></>}
          </button>
        </header>

        {/* Panes Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Gherkin Input Pane */}
          <div className={`flex-1 p-0 relative border-r dark:border-zinc-800 border-slate-200 ${activeTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
            <textarea 
              className="w-full h-full dark:bg-[#0d0d0d] bg-white p-6 lg:p-10 outline-none dark:text-zinc-200 text-slate-700 font-mono text-sm leading-relaxed resize-none"
              placeholder="Scenario: User can Login..."
              value={input} onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Playwright Output Pane */}
          <div className={`flex-1 p-0 relative dark:bg-[#080808] bg-slate-100 group overflow-auto ${activeTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="absolute top-4 lg:top-6 right-4 lg:right-8 flex gap-2 z-10">
              <button onClick={copyToClipboard} disabled={!output} className="p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-slate-200 rounded-lg shadow-sm hover:scale-110 transition-all text-slate-500"><Copy size={16} /></button>
              <button onClick={downloadFile} disabled={!output} className="p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-slate-200 rounded-lg shadow-sm hover:scale-110 transition-all text-slate-500"><FileDown size={16} /></button>
            </div>
            <pre className="w-full h-full p-6 lg:p-10 font-mono text-[11px] lg:text-[13px] leading-relaxed !bg-transparent text-left">
              <code className="language-typescript">
                {output || "// Architect-level code will generate here..."}
              </code>
            </pre>
          </div>
        </div>
      </main>

      {/* Mobile Tab Bar - Persistently at the bottom */}
      <nav className="lg:hidden h-16 flex border-t dark:border-zinc-800 border-slate-200 bg-white dark:bg-zinc-950 shrink-0">
        <button 
          onClick={() => setActiveTab('input')} 
          className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'input' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}
        >
          <FileText size={18} />
          <span className="text-[9px] font-bold uppercase">Gherkin</span>
        </button>
        <button 
          onClick={() => setActiveTab('output')} 
          className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'output' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}
        >
          <Code size={18} />
          <span className="text-[9px] font-bold uppercase">Playwright</span>
        </button>
        <button 
          onClick={() => setActiveTab('context')} 
          className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'context' ? 'text-indigo-500 bg-indigo-500/5' : 'text-slate-400'}`}
        >
          <Settings2 size={18} />
          <span className="text-[9px] font-bold uppercase">Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;