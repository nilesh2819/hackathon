import React from 'react';
import { Leaf, Zap, CloudOff, Trees } from 'lucide-react';

export default function GreenCloudMetrics({ avoidedMonthlyCost = 60000, seatsReclaimed = 15 }) {
  // Environmental Impact Calculations:
  // Each active cloud seat container/VM consumes ~45 kWh/month
  // 1 kWh = ~0.82 kg of CO2 in standard grid mix
  const kwhSaved = seatsReclaimed * 45;
  const co2AvoidedKg = Math.round(kwhSaved * 0.82);
  const treesEquivalent = (co2AvoidedKg / 21).toFixed(1); // 1 mature tree absorbs ~21 kg CO2/year

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
              Sustainable Cloud Computing (ESG Green FinTech)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
              Carbon Negative Reallocation
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            By recycling <strong>{seatsReclaimed} idle DevCloud seats</strong> instead of provisioning new cloud container pods, RECLAIM AI prevents unnecessary data-center compute wattage.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/90 border border-emerald-500/30 p-2.5 rounded-2xl shrink-0 self-end md:self-auto text-xs">
        <div className="text-center px-2">
          <span className="text-[10px] text-slate-400 block">Energy Conserved</span>
          <strong className="text-emerald-300 font-mono text-sm">{kwhSaved} kWh</strong>
        </div>
        <div className="h-6 w-px bg-slate-800"></div>
        <div className="text-center px-2">
          <span className="text-[10px] text-slate-400 block">CO2 Avoided</span>
          <strong className="text-emerald-400 font-mono text-sm">{co2AvoidedKg} kg</strong>
        </div>
        <div className="h-6 w-px bg-slate-800"></div>
        <div className="text-center px-2">
          <span className="text-[10px] text-slate-400 block">Tree Equivalent</span>
          <strong className="text-teal-300 font-mono text-sm">{treesEquivalent} trees</strong>
        </div>
      </div>
    </div>
  );
}
