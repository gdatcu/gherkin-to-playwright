import { useState, useEffect } from 'react';
import { 
  Code2, Sparkles, Globe, Image as ImageIcon, Zap, Sun, Moon, 
  Copy, Check, Terminal, FileDown, Trash2, Settings2, FileText, Code, History, Clock, X,
  LogOut, LogIn, User
} from 'lucide-react';
import { convertGherkin } from './services/ai-client';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';

import { authClient } from "./lib/auth-client";

interface HistoryItem {
  id: string;
  gherkin: string;
  playwright: string;
  baseUrl: string;
  model: string;
  timestamp: string;
}

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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'context' | 'input' | 'output' | 'history'>('input');

  // BetterAuth Hooks
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const fetchHistory = async () => {
    if (!session) return; // Don't fetch if not logged in
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch history from D1");
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (session) fetchHistory();
    else setHistory([]); // Clear history UI if logged out

    Prism.highlightAll();
  }, [isDark, session]);

  useEffect(() => {
    if (output) {
      Prism.highlightAll();
      if (window.innerWidth < 1024) setActiveTab('output');
    }
  }, [output]);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const data = await convertGherkin(input, baseUrl, screenshot, htmlContext);
      setOutput(data.code);
      setMeta({ model: data.modelUsed });
      if (session) fetchHistory();
    } catch (e) { 
      alert("Conversion Failed. Check your Cloudflare Environment Variables."); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInput(item.gherkin);
    setOutput(item.playwright);
    setBaseUrl(item.baseUrl);
    setMeta({ model: item.model });
    setActiveTab('input');
    setTimeout(() => Prism.highlightAll(), 10);
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchHistory();
    } catch (e) {
      console.error("Delete failed");
    }
  };

  const resetContext = () => {
    if (confirm("Reset current editors?")) {
      setInput('');
      setHtmlContext('');
      setScreenshot(null);
      setOutput('');
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

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full font-sans transition-colors duration-300 dark:bg-[#0a0a0a] bg-slate-50 relative overflow-hidden">
      
      {copied && (
        <div className="fixed top-5 lg:top-20 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check size={14} /> Copied to Clipboard
        </div>
      )}

      {/* Sidebar */}
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
          {/* Auth Section */}
          <section>
            {!session ? (
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed dark:border-zinc-800 border-slate-200 dark:text-zinc-400 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-all text-xs font-bold uppercase"
              >
                <LogIn size={14} /> Sign in with Google
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg dark:bg-zinc-900 bg-slate-50 border dark:border-zinc-800 border-slate-200">
                <div className="flex items-center gap-3">
                  <img src={session.user.image || ''} className="w-8 h-8 rounded-full border dark:border-zinc-700" alt="avatar" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold dark:text-zinc-200 text-slate-700 truncate w-24">{session.user.name}</span>
                    <button onClick={handleLogout} className="text-[9px] text-red-500 font-bold uppercase text-left hover:underline">Sign Out</button>
                  </div>
                </div>
                <User size={14} className="text-zinc-600" />
              </div>
            )}
          </section>

          {/* Settings Section */}
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

          {/* History Section */}
          <div className={activeTab === 'context' ? 'lg:block hidden pt-4' : 'block pt-2'}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2 mb-4">
              <History size={12} /> Recent Conversions
            </label>
            <div className="space-y-3">
              {!session ? (
                 <div className="text-[9px] text-slate-400 uppercase font-bold py-8 text-center border border-dashed dark:border-zinc-800 rounded-lg flex flex-col items-center gap-2 px-4">
                  <span>Sign in to view history</span>
                 </div>
              ) : history.length === 0 ? (
                <div className="text-[10px] text-slate-400 italic py-8 text-center border border-dashed dark:border-zinc-800 rounded-lg">
                  No conversions saved yet
                </div>
              ) : (
                history.map((item) => (
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

      {/* Main Workspace */}
      <main className={`flex-1 flex flex-col relative dark:bg-zinc-950 bg-white ${ (activeTab === 'context' || activeTab === 'history') ? 'hidden lg:flex' : 'flex'} overflow-hidden`}>
        <header className="h-16 border-b dark:border-zinc-800 border-slate-200 flex items-center justify-between px-4 lg:px-8 bg-inherit z-50 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold dark:text-zinc-500 text-slate-400">
            <Terminal size={14} className="hidden sm:block" /> 
            <span>gherkin-to-playwright.ts</span>
            {meta?.model && <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px]">{meta.model}</span>}
          </div>
          <button 
            onClick={handleConvert}
            disabled={loading || !input}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-8 py-2 rounded-lg text-xs font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <span className="animate-pulse">Analyzing...</span> : <><Sparkles size={14} /> <span className="hidden sm:inline">Generate Code</span><span className="sm:hidden">Run</span></>}
          </button>
        </header>

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

      {/* Mobile Tab Bar */}
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
    </div>
  );
}

export default App;