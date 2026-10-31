import React from 'react';

export default function OdooStatusBar({ stages = [], currentStage = '', actions = [] }) {
  return (
    <div className="bg-[#121622] border border-slate-800 rounded-2xl p-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm mb-4">
      {/* Left Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            disabled={act.disabled}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
              act.primary
                ? 'bg-[#714B67] hover:bg-[#875A7B] text-white shadow-glow-purple'
                : (act.success
                    ? 'bg-[#00A09D] hover:bg-[#00C4BF] text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700')
            }`}
          >
            {act.icon && <act.icon className="w-3.5 h-3.5" />}
            <span>{act.label}</span>
          </button>
        ))}
      </div>

      {/* Right Odoo Statusbar Pipeline Chevron Ribbon */}
      <div className="flex items-center self-end md:self-auto overflow-x-auto max-w-full">
        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          {stages.map((st, idx) => {
            const isCurrent = st.toLowerCase() === currentStage.toLowerCase();
            return (
              <div
                key={idx}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all capitalize flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#714B67] text-white shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span>{st}</span>
                {idx < stages.length - 1 && (
                  <span className="text-slate-600 font-normal">›</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
