import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Leaf,
  DollarSign,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HackathonBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-glow-purple flex items-center gap-2 border border-purple-400/30 hover:scale-105 transition-all"
      >
        <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>Open Hackathon Judge Guide</span>
      </button>
    );
  }

  const steps = [
    {
      title: "1. The $300B Global Problem",
      badge: "Real-World Crisis",
      color: "rose",
      content: "Enterprises waste over 30% of their subscription expenditure on dormant seats and duplicate licenses. Traditional platforms only track invoices after money is already burned.",
      highlight: "₹16.2 Lakhs wasted monthly at Brightloop before RECLAIM AI."
    },
    {
      title: "2. The Paradigm Shift: Liquid Subscriptions",
      badge: "Innovation",
      color: "purple",
      content: "RECLAIM AI treats subscriptions as dynamic liquid capacity rather than static sunk costs. If Marketing has 20 unused seats, they don't sit idle—they get recycled to Engineering.",
      highlight: "Zero new subscription licenses purchased; 100% capacity reuse."
    },
    {
      title: "3. Live Demonstration Match",
      badge: "The Hook",
      color: "blue",
      content: "Marketing had 20 idle DevCloud seats. Engineering needed 15 seats. RECLAIM AI matched them automatically, avoiding ₹60,000/mo (₹7.2 Lakhs/yr) with 1-click admin approval.",
      highlight: "Avoided Capital: ₹60,000/month live on the dashboard."
    },
    {
      title: "4. Dual Impact: FinTech + Green Cloud (ESG)",
      badge: "World Impact",
      color: "emerald",
      content: "By eliminating redundant cloud instances and dormant compute containers, RECLAIM AI prevents 1,420 kg of CO2 cloud emissions monthly.",
      highlight: "Financial ROI + Environmental Sustainability in one system."
    }
  ];

  const current = steps[activeStep];

  return (
    <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 shadow-glow-purple relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              Hackathon Judge & Presentation Tour
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                Winning Architecture
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-5 h-5 rounded-lg text-[10px] font-bold transition-all ${
                  activeStep === idx
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">{current.title}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              {current.badge}
            </span>
          </div>
          <p className="text-slate-300 max-w-3xl leading-relaxed text-[11px]">
            {current.content}
          </p>
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{current.highlight}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(prev => prev + 1)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-1.5 transition-all"
            >
              <span>Next Key Concept</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              to="/value-exchange"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Inspect Live Exchange</span>
              <Zap className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
