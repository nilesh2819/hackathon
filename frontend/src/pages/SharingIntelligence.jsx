import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import {
  Share2,
  ShieldCheck,
  ShieldAlert,
  Building2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function SharingIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSharingData = async () => {
    try {
      const res = await api.get('/intelligence/sharing');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load sharing intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharingData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              Subscription Sharing Intelligence
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Signature Innovation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validates provider-specific sharing eligibility, locates idle departmental capacity, and matches cross-team license demand.
          </p>
        </div>

        <Link
          to="/value-exchange"
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-glow-blue flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>Open Value Exchange</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Potential Monthly Savings"
          value={`INR ${(data?.metrics?.potential_monthly_savings || 87000).toLocaleString()}`}
          subtext="Through pending capacity matches"
          icon={Sparkles}
          color="purple"
        />

        <StatCard
          title="Annualized Avoided Cost"
          value={`INR ${(data?.metrics?.potential_annual_savings || 1044000).toLocaleString()}`}
          subtext="Avoided new subscription contracts"
          icon={CheckCircle}
          color="emerald"
        />

        <StatCard
          title="Surplus Sharing Units"
          value={data?.surplus_departments?.length || 8}
          subtext="Departments with eligible idle seats"
          icon={Building2}
          color="blue"
        />

        <StatCard
          title="Active Reallocation Queue"
          value={data?.metrics?.active_pending_matches || 2}
          subtext="Matches awaiting admin approval"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Provider-Specific Sharing Compliance Rules */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Provider-Specific Sharing Eligibility Matrix
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Strict licensing compliance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white">DevCloud Workspace</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">100% Shareable</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Multi-tenant pods poolable across Engineering, QA, and Marketing analytics. Zero compliance restrictions on cross-assignment.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white">Marketing Cloud Suite</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">Multi-Seat Pool</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              License tier supports up to 8 departments sharing a unified workspace. Reallocations automatically update SSO directory.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white">ERP Enterprise Core</span>
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-semibold">Restricted</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Single-tenant regulatory lock. Cannot be shared across unverified departments without formal financial compliance audit.
            </p>
          </div>
        </div>
      </div>

      {/* Department Surplus Table */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Detected Surplus Capacity by Department
          </span>
          <span className="text-[10px] text-slate-400">Sorted by idle capacity</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Department</th>
              <th className="pb-3 font-semibold">Department Head</th>
              <th className="pb-3 font-semibold">Product Monitored</th>
              <th className="pb-3 font-semibold">Allocated Seats</th>
              <th className="pb-3 font-semibold">Active In-Use</th>
              <th className="pb-3 font-semibold text-rose-400">Surplus Idle</th>
              <th className="pb-3 font-semibold">Sharing Eligibility</th>
              <th className="pb-3 font-semibold text-right">Avoidable Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {(data?.surplus_departments || []).map((dept, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-white">
                  {dept.department_name} ({dept.department_code})
                </td>
                <td className="py-3 text-slate-300">{dept.manager_name}</td>
                <td className="py-3 text-purple-300 font-semibold">{dept.product_name}</td>
                <td className="py-3 text-slate-200">{dept.total_allocated} seats</td>
                <td className="py-3 text-emerald-400 font-semibold">{dept.active_seats} seats</td>
                <td className="py-3 text-rose-400 font-extrabold">{dept.unused_seats} seats</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dept.is_shareable ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {dept.is_shareable ? 'Eligible for Sharing' : 'Non-Shareable'}
                  </span>
                </td>
                <td className="py-3 text-right font-extrabold text-white">
                  INR {(dept.unused_seats * 4000).toLocaleString()}/mo
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
