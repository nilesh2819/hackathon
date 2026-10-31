import React from 'react';

export default function Badge({ status, label }) {
  const s = (status || label || '').toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (s === 'active' || s === 'paid' || s === 'completed' || s === 'converted' || s === 'accepted') {
    styles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else if (s === 'confirmed' || s === 'sent') {
    styles = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  } else if (s === 'pending' || s === 'paused' || s === 'draft') {
    styles = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (s === 'overdue' || s === 'rejected' || s === 'closed' || s === 'cancelled') {
    styles = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {label || status}
    </span>
  );
}
