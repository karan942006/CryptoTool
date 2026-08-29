import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  MessageSquare,
  FileSearch,
  ExternalLink,
  Cpu
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
  isLiveAi?: boolean;
  timestamp: string;
}

export const AISecurityAnalystPage: React.FC = () => {
  const { addNotification } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Greetings. I am CryptoTool's AI Security Analyst. I provide context-aware, grounded explanations and remediation roadmaps based strictly on your organization's verified cryptographic findings.\n\nYou can ask me questions such as:\n- *'What is our most critical cryptographic vulnerability?'*\n- *'How do we migrate our legacy RSA-1024 implementation to NIST PQC standards?'*\n- *'Explain the security impact of AES-ECB vs AES-GCM in our repositories.'*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.askAIAssistant(userText);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: res.answer,
        references: res.references,
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
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Cryptographic Security Analyst
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded intelligence assistant powered by verified AST discoveries and deterministic rules.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Gemini Cryptographic Specialist</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <Card className="flex flex-col h-[650px] p-0 overflow-hidden border-slate-800">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-bold shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-navy-950" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md'
                    : 'bg-navy-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {msg.references && msg.references.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 font-mono text-[11px] text-cyan-300 space-y-1">
                    <span className="text-slate-500 uppercase text-[9px] font-bold tracking-wider">Grounding References:</span>
                    <ul className="list-disc list-inside">
                      {msg.references.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>{msg.timestamp}</span>
                  {msg.isLiveAi && <span className="text-cyan-400">Gemini Live</span>}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-3 rounded-2xl bg-navy-900 border border-slate-800 text-xs font-mono text-cyan-300 animate-pulse">
                Analyzing verified findings matrix...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-navy-950/80 flex items-center gap-3">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask about cryptographic vulnerabilities, PQC migration, or specific algorithms..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-navy-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-sans"
          />
          <Button
            type="submit"
            variant="cyber"
            size="md"
            disabled={!inputQuery.trim() || isLoading}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
