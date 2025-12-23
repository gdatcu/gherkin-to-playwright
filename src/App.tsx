// src/App.tsx
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { convertGherkin } from './services/ai-client';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import { authClient } from "./lib/auth-client";
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { MobileNav } from './components/MobileNav';

interface HistoryItem {
  id: string;
  gherkin: string;
  playwright: string;
  baseUrl: string;
  model: string;
  timestamp: string;
}

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [template, setTemplate] = useState<'pom' | 'step-defs'>('pom');
  const [input, setInput] = useState('');
  const [baseUrl, setBaseUrl] = useState('[https://app.example.com](https://app.example.com)');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [htmlContext, setHtmlContext] = useState('');
  const [output, setOutput] = useState('');
  const [meta, setMeta] = useState<{ model?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'context' | 'input' | 'output' | 'history'>('input');

  const { data: session } = authClient.useSession();

  const fetchHistory = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/history', { cache: 'no-store' });
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error("History fetch failed"); }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (session) fetchHistory();
    else setHistory([]);
    Prism.highlightAll();
  }, [isDark, session]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('t')) window.location.href = window.location.origin;
  }, []);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const data = await convertGherkin(input, baseUrl, screenshot, htmlContext, template);
      setOutput(data.code);
      setMeta({ model: data.modelUsed });
      if (session) fetchHistory();
      if (window.innerWidth < 1024) setActiveTab('output');
      setTimeout(() => Prism.highlightAll(), 10);
    } catch (e) { alert("Conversion Failed."); } finally { setLoading(false); }
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
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full font-sans transition-colors duration-300 dark:bg-[#0a0a0a] bg-slate-50 relative overflow-hidden">
      {copied && (
        <div className="fixed top-5 lg:top-20 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check size={14} /> Copied to Clipboard
        </div>
      )}

      <Sidebar 
        isDark={isDark} setIsDark={setIsDark} activeTab={activeTab} session={session} 
        handleLogin={() => authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}/?t=${Date.now()}` })}
        handleLogout={async () => { await authClient.signOut(); window.location.href = "/"; }}
        baseUrl={baseUrl} setBaseUrl={setBaseUrl} resetContext={() => { setInput(''); setOutput(''); setHtmlContext(''); setScreenshot(null); }}
        template={template} setTemplate={setTemplate} htmlContext={htmlContext} setHtmlContext={setHtmlContext}
        screenshot={screenshot} setScreenshot={setScreenshot} history={history}
        loadFromHistory={(item: any) => { setInput(item.gherkin); setOutput(item.playwright); setBaseUrl(item.baseUrl); setActiveTab('input'); setTimeout(() => Prism.highlightAll(), 10); }}
        deleteHistoryItem={async (id: string, e: any) => { e.stopPropagation(); const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); if (res.ok) fetchHistory(); }}
      />

      <main className={`flex-1 flex flex-col relative dark:bg-zinc-950 bg-white ${ (activeTab === 'context' || activeTab === 'history') ? 'hidden lg:flex' : 'flex'} overflow-hidden`}>
        <Header loading={loading} input={input} meta={meta} onConvert={handleConvert} />
        <Workspace activeTab={activeTab} input={input} setInput={setInput} output={output} onCopy={copyToClipboard} onDownload={downloadFile} />
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;