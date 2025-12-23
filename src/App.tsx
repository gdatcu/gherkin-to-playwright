// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';

// Infrastructure
import { convertGherkin, healSelectors } from './services/ai-client'; // Added healSelectors
import { authClient } from "./lib/auth-client";
import { useTheme } from './hooks/useTheme';
import { copyToClipboard } from './utils/clipboard';
import { downloadProjectZip } from './utils/file';

// Types
import type { HistoryItem, TemplateType, TabType } from './types';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { MobileNav } from './components/MobileNav';

function App() {
  const { isDark, setIsDark } = useTheme();
  const [template, setTemplate] = useState<TemplateType>('pom');
  const [input, setInput] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://app.example.com');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [htmlContext, setHtmlContext] = useState('');
  const [output, setOutput] = useState('');
  const [meta, setMeta] = useState<{ model?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [healing, setHealing] = useState(false); // Goal #3 state
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('input');

  const { data: session } = authClient.useSession();

  const fetchHistory = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/history', { cache: 'no-store' });
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error("History fetch failed"); }
  };

  useEffect(() => {
    if (session) fetchHistory();
    else setHistory([]);
    Prism.highlightAll();
  }, [session]);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const data = await convertGherkin(input, baseUrl, screenshot, htmlContext, template);
      setOutput(data.code);
      setMeta({ model: data.modelUsed });
      if (session) fetchHistory();
      if (window.innerWidth < 1024) setActiveTab('output');
      setTimeout(() => Prism.highlightAll(), 10);
    } catch (e) { alert("Conversion Failed."); }
    finally { setLoading(false); }
  };

  // Goal #3: Handle Selector Healing
  const handleHealSelectors = async () => {
    if (!htmlContext) return alert("Paste HTML context in the sidebar first.");
    setHealing(true);
    try {
      const data = await healSelectors(htmlContext, input);
      // Prepend analysis to the current output
      setOutput(`/* ARCHITECT LOCATOR ANALYSIS */\n${data.analysis || data.code}\n\n${output}`);
      setActiveTab('output');
    } catch (e) { alert("Healing Analysis Failed."); }
    finally { setHealing(false); }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(output);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full font-sans transition-colors duration-300 dark:bg-[#0a0a0a] bg-slate-50 relative overflow-hidden">
      {copied && (
        <div className="fixed top-5 lg:top-20 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check size={14} /> Copied to Clipboard
        </div>
      )}

      <Sidebar 
        isDark={isDark} setIsDark={setIsDark} 
        activeTab={activeTab} setActiveTab={setActiveTab}
        session={session} 
        handleLogin={() => authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}` })}
        handleLogout={async () => { await authClient.signOut(); window.location.href = "/"; }}
        baseUrl={baseUrl} setBaseUrl={setBaseUrl} 
        resetContext={() => { setInput(''); setOutput(''); setHtmlContext(''); setScreenshot(null); }}
        template={template} setTemplate={setTemplate} 
        htmlContext={htmlContext} setHtmlContext={setHtmlContext}
        screenshot={screenshot} setScreenshot={setScreenshot} 
        history={history}
        isHealing={healing} // New Prop
        onHealSelectors={handleHealSelectors} // New Prop
        loadFromHistory={(item: HistoryItem) => {
          setInput(item.gherkin); setOutput(item.playwright); setBaseUrl(item.baseUrl); 
          setActiveTab('input'); setTimeout(() => Prism.highlightAll(), 10);
        }}
        deleteHistoryItem={async (id: string, e: React.MouseEvent) => {
          e.stopPropagation();
          const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
          if (res.ok) fetchHistory();
        }}
      />

      <main className={`flex-1 flex flex-col relative dark:bg-zinc-950 bg-white ${ (activeTab === 'context' || activeTab === 'history') ? 'hidden lg:flex' : 'flex'} overflow-hidden`}>
        <Header loading={loading} input={input} meta={meta} onConvert={handleConvert} />
        <Workspace 
          activeTab={activeTab} 
          input={input} 
          setInput={setInput} 
          output={output} 
          onCopy={handleCopy} 
          onDownload={() => downloadProjectZip(output, template)} 
        />
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;