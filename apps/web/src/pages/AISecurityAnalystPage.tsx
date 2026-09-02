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
  Terminal
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as api from '../services/api';
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
      text: "Greetings. I am CryptoTool's AI Security Copilot & Cryptographic Analyst. I analyze cryptographic context, Mosca's theorem risk (X+Y > Z), Harvest Now Decrypt Later exposures, and generate automated PQC code remediation plans.",
      suggestedAction: 'Try selecting a quick prompt below or typing a natural language query.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'Show all RSA systems handling sensitive data and HNDL risk.',
    'Which certificates expire in the next 30 days?',
    'Why is AES-ECB considered critical risk in our repositories?',
    'Generate ML-KEM-768 hybrid migration code diff for Java/Python.'
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
        suggestedAction: res.suggested_action,
        remediationDiff: res.remediation_code,
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
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Security Copilot & Cryptographic Analyst
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Natural language cryptographic search, context-aware misuse explanations, and automated PQC code diff remediations.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>ECDAT Copilot Active</span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-navy-900/60 border border-slate-800">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1">Quick Prompts:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-[11px] font-mono px-3 py-1 rounded-lg bg-navy-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Chat Interface */}
      <Card className="flex flex-col h-[650px] p-0 overflow-hidden border-slate-800 shadow-2xl">
        {/* Chat Messages Log */}
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

                {msg.suggestedAction && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Suggested Action: {msg.suggestedAction}
                    </span>
                  </div>
                )}

                {msg.remediationDiff && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 font-mono">
                    <span className="text-[10px] text-purple-300 font-bold block">
                      Automated Code Diff ({msg.remediationDiff.language || 'Unified Diff'}):
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-900 text-cyan-300 text-[11px] overflow-x-auto border border-slate-800">
                      {msg.remediationDiff.diff}
                    </pre>
                  </div>
                )}

                <div className="text-[9px] text-slate-400 text-right font-mono">
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
                <span>Analyzing cryptographic repositories & calculating PQC impact...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 bg-navy-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask AI Copilot about crypto misuse, Mosca risk, or PQC migration..."
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
