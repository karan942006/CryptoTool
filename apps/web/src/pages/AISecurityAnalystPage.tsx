import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  MessageSquare,
  FileSearch,
  ExternalLink,
  Cpu,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Terminal,
  Settings,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as api from '../services/api';
import { getAISettings, saveAISettings, AISettings } from '../services/geminiService';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  references?: string[];
  suggestedAction?: string;
  remediationDiff?: { language?: string; diff?: string };
  isLiveAi?: boolean;
  timestamp: string;
}

export const AISecurityAnalystPage: React.FC = () => {
  const { addNotification } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Greetings. I am ECDAT's AI Cryptographic Security Analyst. I provide evidence-grounded security explanations, NIST SP 800-131A compliance analyses, and post-quantum migration roadmaps based strictly on your verified scan evidence.",
      suggestedAction: 'Try selecting a quick prompt below or entering a natural language query.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [privacyMode, setPrivacyMode] = useState<'full_evidence' | 'metadata_only' | 'local_only'>('full_evidence');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [showKey, setShowKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const s = getAISettings();
    setApiKeyInput(s.apiKey || '');
    setPrivacyMode(s.privacyMode || 'full_evidence');
    setSelectedModel(s.model || 'gemini-2.5-flash');
  }, []);

  const handleSaveSettings = () => {
    saveAISettings({
      apiKey: apiKeyInput.trim(),
      privacyMode,
      model: selectedModel
    });
    addNotification('AI Settings Saved', 'Gemini API configuration updated', 'success');
    setShowSettings(false);
  };

  const quickPrompts = [
    'What are the most critical cryptographic findings in the codebase?',
    'Why is AES-ECB mode considered broken and how do we fix it?',
    'Which findings represent Shor quantum threats and what are the NIST PQC alternatives?',
    'Generate a secure Java code example to replace SHA-1 and MD5 with SHA-256.',
    'Explain the compliance implications under NIST SP 800-131A and FIPS 140-3.'
  ];

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || isLoading) return;

    setInputQuery('');
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.askAICopilotSearch(text.trim());
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: res.answer,
        references: res.references,
        suggestedAction: res.suggestedAction,
        isLiveAi: res.is_live_ai,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      addNotification('AI Error', 'Failed to generate response', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Security Analyst & Cryptographic Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded AI analysis using Google Gemini • Zero hallucinations • Strict evidence-first remediation advice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            leftIcon={<Settings className="w-4 h-4 text-cyan-400" />}
          >
            AI Settings
          </Button>
        </div>
      </div>

      {/* Settings Panel Modal */}
      {showSettings && (
        <Card className="p-6 border-cyan-500/40 bg-navy-950 space-y-4 font-mono text-xs shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" /> Google Gemini API & Privacy Configuration
            </span>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">GEMINI_API_KEY</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-navy-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Stored locally in your browser session. Never committed or logged.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Gemini Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-navy-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Precise)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Cryptographic Reasoning)</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-bold block">AI Privacy Control</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'full_evidence', label: 'Full Evidence', desc: 'Metadata + redacted snippets' },
                  { id: 'metadata_only', label: 'Metadata Only', desc: 'Algorithm & rule name only' },
                  { id: 'local_only', label: 'Local Only', desc: 'No cloud transmission' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrivacyMode(p.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      privacyMode === p.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-xs">{p.label}</span>
                    <span className="text-[10px] opacity-80">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="secondary" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button size="sm" variant="cyber" onClick={handleSaveSettings}>Save Configuration</Button>
          </div>
        </Card>
      )}

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-navy-900/60 border border-slate-800 font-mono text-xs">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Quick Prompts:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-[11px] px-3 py-1 rounded-lg bg-navy-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Chat Interface */}
      <Card className="flex flex-col h-[650px] p-0 overflow-hidden border-slate-800 shadow-2xl">
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-2xl space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-navy-950 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans text-xs">
                  {msg.text}
                </div>

                {msg.references && msg.references.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-400">
                    <span className="font-bold text-slate-300 uppercase">Standard References:</span>
                    {msg.references.map((r, i) => (
                      <div key={i}>• {r}</div>
                    ))}
                  </div>
                )}

                {msg.suggestedAction && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Suggested Action: {msg.suggestedAction}
                    </span>
                  </div>
                )}

                <div className="text-[9px] text-slate-500 text-right font-mono">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2">
                <span>Analyzing cryptographic evidence and synthesizing response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 bg-navy-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask AI Analyst about findings, algorithms, NIST compliance, or PQC migration..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 p-2.5 text-xs rounded-xl bg-navy-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="text-xs"
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
