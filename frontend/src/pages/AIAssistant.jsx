import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  User,
  Copy,
  Check
} from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am **RECLAIM AI Business Assistant**.\n\nI answer queries by directly querying the live database of Brightloop Software—including active subscriptions, seat allocations, invoices, payments, and Value Exchange savings.\n\nSelect a prompt below or type your question:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatBottomRef = useRef(null);

  const suggestedQuestions = [
    'How many subscriptions are currently active?',
    'Which department wastes the most subscription expenditure?',
    'How much can we save by reallocating seats?',
    'Which invoices are overdue?',
    'Which subscriptions are expiring soon?',
    'Which products have the highest revenue?'
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/intelligence/assistant', { query: q });
      if (res.data.success) {
        const botMsg = {
          sender: 'assistant',
          text: res.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error processing query: ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              AI Business Assistant
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Zero Hallucination
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time conversational business intelligence grounded strictly in verified PostgreSQL/SQLite relational state.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live DB Connected</span>
        </div>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-slate-300 text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 group shrink-0"
          >
            <Sparkles className="w-3 h-3 text-purple-400 group-hover:scale-110" />
            <span>{sq}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[#0F172A]/80 border border-slate-800 rounded-3xl p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-glow-purple">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed relative group ${
                  isBot
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-purple-600 text-white font-medium shadow-glow-purple'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.text.split('\n').map((line, lIdx) => {
                    // Quick bold parsing
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <div key={lIdx} className={line.startsWith('•') ? 'pl-2 py-0.5' : 'py-0.5'}>
                        {parts.map((p, pIdx) => {
                          if (p.startsWith('**') && p.endsWith('**')) {
                            return <strong key={pIdx} className="font-bold text-purple-300">{p.slice(2, -2)}</strong>;
                          }
                          return p;
                        })}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                  <span>{msg.timestamp}</span>
                  {isBot && (
                    <button
                      onClick={() => copyToClipboard(msg.text, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              <span>Querying database tables & generating verifiable insight...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Brightloop subscriptions, idle seats, invoices, or revenue..."
            className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 text-xs rounded-2xl px-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          <span>Ask AI</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
