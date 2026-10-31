import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  ArrowLeftRight,
  FileText,
  Box,
  FileSpreadsheet,
  Gauge,
  Share2,
  TrendingUp,
  Bot,
  BarChart3,
  Settings,
  X,
  Sparkles,
  Users
} from 'lucide-react';

export default function OdooAppLauncher({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const odooApps = [
    { name: 'Subscriptions', desc: 'Recurring Contracts & Renewals', path: '/subscriptions', icon: Repeat, color: 'from-[#714B67] to-[#875A7B]', badge: 'Core' },
    { name: 'Value Exchange', desc: 'AI License Reallocation', path: '/value-exchange', icon: ArrowLeftRight, color: 'from-[#00A09D] to-[#00C4BF]', badge: 'RECLAIM' },
    { name: 'Invoicing', desc: 'Billing, Taxes & Payments', path: '/invoices', icon: FileText, color: 'from-blue-600 to-indigo-600' },
    { name: 'Products & Variants', desc: 'Odoo Edition & Pricing', path: '/products', icon: Box, color: 'from-amber-600 to-orange-600' },
    { name: 'Quotations', desc: 'Templates & Fast Conversion', path: '/quotations', icon: FileSpreadsheet, color: 'from-teal-600 to-emerald-600' },
    { name: 'Customers', desc: '50 Client Organizations', path: '/customers', icon: Users, color: 'from-emerald-600 to-green-600' },
    { name: 'Usage-to-Value', desc: 'Seat Telemetry & Scoring', path: '/usage-intelligence', icon: Gauge, color: 'from-purple-600 to-pink-600', badge: 'AI' },
    { name: 'Sharing Intelligence', desc: 'Inter-Department Sharing', path: '/sharing-intelligence', icon: Share2, color: 'from-cyan-600 to-blue-600' },
    { name: 'Waste Predictor', desc: '90-Day Financial Forecast', path: '/waste-predictor', icon: TrendingUp, color: 'from-rose-600 to-red-600', badge: 'AI' },
    { name: 'AI Assistant', desc: 'Zero-Hallucination Copilot', path: '/ai-assistant', icon: Bot, color: 'from-indigo-600 to-purple-600' },
    { name: 'Accounting Reports', desc: 'MRR, ARR & Cashflow', path: '/reports', icon: BarChart3, color: 'from-violet-600 to-indigo-600' },
    { name: 'Settings & Taxes', desc: 'GST, VAT & pgAdmin 4', path: '/settings', icon: Settings, color: 'from-slate-700 to-slate-800' }
  ];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#714B67]/40 rounded-3xl max-w-4xl w-full p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#714B67] to-[#00A09D] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">odoo</span>
                <span className="text-xs font-bold text-slate-300">Enterprise Apps</span>
                <span className="text-[10px] bg-[#714B67] text-white px-2 py-0.5 rounded-full font-bold">
                  Brightloop + RECLAIM AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Click any application module to switch workspaces instantly.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Apps Grid (Authentic Odoo Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 max-h-[65vh] overflow-y-auto p-1">
          {odooApps.map((app, idx) => {
            const Icon = app.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(app.path)}
                className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-[#714B67]/60 transition-all text-left flex flex-col items-start relative hover:scale-[1.02] shadow-sm"
              >
                {app.badge && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#714B67]/30 text-purple-300 border border-[#714B67]/50">
                    {app.badge}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:shadow-glow-purple transition-all`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {app.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Odoo 18 Community & Enterprise Architecture Compatible</span>
          <span className="text-[#00A09D] font-bold">Press ESC or click anywhere to exit launcher</span>
        </div>
      </div>
    </div>
  );
}
