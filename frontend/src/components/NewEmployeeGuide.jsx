import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

export default function NewEmployeeGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [completed, setCompleted] = useState([1]); // step 1 completed by default

  const steps = [
    {
      id: 1,
      title: 'Inspect Subscriptions & Plans',
      desc: 'Browse Brightloop’s 100 enterprise recurring subscriptions and contract terms.',
      link: '/subscriptions',
      action: 'Open Subscriptions'
    },
    {
      id: 2,
      title: 'Audit Usage-to-Value Telemetry',
      desc: 'Identify which subscriptions are operating at low capacity and wasting budget.',
      link: '/usage-intelligence',
      action: 'Check Value Score'
    },
    {
      id: 3,
      title: 'Approve a Value Exchange Transfer',
      desc: 'Reallocate 15 idle DevCloud seats from Marketing to Engineering in 1 click.',
      link: '/value-exchange',
      action: 'Execute Transfer'
    },
    {
      id: 4,
      title: 'Issue a Recurring Invoice',
      desc: 'Generate a recurring monthly invoice with automated 18% GST and duplicate protection.',
      link: '/invoices',
      action: 'View Invoices'
    },
    {
      id: 5,
      title: 'Query the Zero-Hallucination AI Copilot',
      desc: 'Ask the assistant which department wastes the most spend to see live DB queries.',
      link: '/ai-assistant',
      action: 'Ask AI Assistant'
    }
  ];

  const toggleStep = (id) => {
    if (completed.includes(id)) {
      setCompleted(completed.filter(x => x !== id));
    } else {
      setCompleted([...completed, id]);
    }
  };

  const progressPercent = Math.round((completed.length / steps.length) * 100);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-2xl bg-slate-900 border border-[#714B67] text-white text-xs font-bold shadow-2xl flex items-center gap-2 hover:border-[#00A09D] transition-all"
      >
        <Compass className="w-4 h-4 text-[#00A09D] animate-spin" style={{ animationDuration: '10s' }} />
        <span>New Employee Quickstart ({progressPercent}%)</span>
      </button>
    );
  }

  return (
    <div className="mb-6 p-5 rounded-3xl bg-[#121622] border-2 border-[#714B67]/40 shadow-xl relative">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#714B67]/30 border border-[#714B67]/50 flex items-center justify-center text-purple-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                New Employee Guided Onboarding
              </h2>
              <span className="text-[10px] bg-[#00A09D]/20 text-[#00C4BF] px-2 py-0.5 rounded-full border border-[#00A09D]/40 font-bold">
                Odoo Enterprise Flow
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Complete these 5 interactive missions to master Brightloop’s subscription lifecycle and AI exchange.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#714B67] to-[#00A09D] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="font-bold text-white text-xs">{progressPercent}%</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
        {steps.map((st) => {
          const isDone = completed.includes(st.id);
          return (
            <div
              key={st.id}
              className={`p-3 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-900/80 border-slate-800 hover:border-[#714B67]/50 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-purple-400">Step {st.id}</span>
                  <button
                    onClick={() => toggleStep(st.id)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <h3 className={`font-bold text-xs ${isDone ? 'text-white' : 'text-slate-200'}`}>
                  {st.title}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {st.desc}
                </p>
              </div>

              <Link
                to={st.link}
                onClick={() => {
                  if (!completed.includes(st.id)) toggleStep(st.id);
                }}
                className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-bold text-[#00A09D] hover:text-[#00C4BF] flex items-center justify-between"
              >
                <span>{st.action}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
