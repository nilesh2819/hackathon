import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, trend, color = 'purple' }) {
  const colorMap = {
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'shadow-glow-purple'
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400',
      glow: 'shadow-glow-blue'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: ''
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      glow: ''
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: ''
    }
  };

  const c = colorMap[color] || colorMap.purple;

  return (
    <div className={`p-5 rounded-2xl bg-[#0F172A]/80 border ${c.border} transition-all duration-300 relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {subtext && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
}
