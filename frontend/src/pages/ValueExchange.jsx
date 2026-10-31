import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import GreenCloudMetrics from '../components/GreenCloudMetrics';
import {
  ArrowLeftRight,
  Sparkles,
  CheckCircle,
  XCircle,
  Building2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  History
} from 'lucide-react';

export default function ValueExchange() {
  const [exchangeData, setExchangeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({ message: '', type: '' });
  const [selectedMatch, setSelectedMatch] = useState(null);

  const fetchExchange = async () => {
    try {
      const res = await api.get('/intelligence/exchange');
      if (res.data.success) {
        setExchangeData(res.data);
      }
    } catch (err) {
      console.error('Failed to load Value Exchange:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchange();
  }, []);

  const handleProcess = async (requestId, action) => {
    setProcessingId(requestId);
    setActionFeedback({ message: '', type: '' });
    try {
      const res = await api.post('/intelligence/exchange/process', {
        request_id: requestId,
        action,
        notes: `Executed via Value Exchange Interactive Dashboard by Admin.`
      });

      if (res.data.success) {
        setActionFeedback({
          message: res.data.message,
          type: action === 'approve' ? 'success' : 'info'
        });
        setSelectedMatch(null);
        fetchExchange();
      }
    } catch (err) {
      setActionFeedback({
        message: err.response?.data?.message || err.message,
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingMatches = exchangeData?.matching_proposals?.filter(p => p.status === 'pending') || [];
  const completedMatches = exchangeData?.matching_proposals?.filter(p => p.status === 'completed' || p.status === 'rejected') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-purple-400" />
              Subscription Value Exchange
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Interactive Clearinghouse
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            "Pay for what you need. Reuse what you already own. Never waste subscription value."
          </p>
        </div>

        {/* Live Savings Avoided Ticker */}
        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/40 shadow-glow-purple self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Avoided Capital Expenditure</span>
          <span className="text-base font-black text-emerald-400">
            INR {(exchangeData?.metrics?.potential_monthly_savings || 60000).toLocaleString()}/month
          </span>
          <span className="text-[10px] text-purple-300 ml-2 font-mono">
            (INR {((exchangeData?.metrics?.potential_monthly_savings || 60000) * 12).toLocaleString()}/yr)
          </span>
        </div>
      </div>

      {actionFeedback.message && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 transition-all ${
          actionFeedback.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : (actionFeedback.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                : 'bg-blue-500/10 border border-blue-500/30 text-blue-300')
        }`}>
          {actionFeedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          <span className="font-semibold">{actionFeedback.message}</span>
        </div>
      )}

      {/* THREE MAJOR SECTIONS (Section 7 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: AVAILABLE CAPACITY */}
        <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Section 1</span>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Available Capacity
                </h2>
              </div>
              <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
                {exchangeData?.available_capacity?.length || 0} Sources
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Unused seats and available eligible subscription resources identified by Usage-to-Value telemetry.
            </p>

            <div className="space-y-3">
              {(exchangeData?.available_capacity || []).map((cap, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{cap.department_name}</span>
                    <span className="text-xs font-black text-rose-400">
                      {cap.available_seats} Idle Seats
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-300 mt-1">{cap.product_name}</div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Waste: INR {parseFloat(cap.current_waste_cost).toLocaleString()}/mo</span>
                    <span className="text-emerald-400 font-semibold">{cap.sharing_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            * Capacity is verified for compliance before matching.
          </div>
        </div>

        {/* SECTION 2: AI MATCHING ENGINE (CENTERPIECE) */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#131B2E] to-[#0F172A] border-2 border-purple-500/40 shadow-glow-purple flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Centerpiece</span>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Matching Engine
                </h2>
              </div>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold animate-pulse">
                {pendingMatches.length} Matches Found
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-4">
              Matches eligible surplus capacity with active department seat requests to eliminate unnecessary contract spend.
            </p>

            {pendingMatches.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/60 border border-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-white">All Reallocations Cleared!</p>
                <p className="text-[11px] text-slate-400 mt-1">Zero pending mismatches detected across departments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded">
                        {match.request_number}
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Saves INR {parseFloat(match.financial_savings_amount).toLocaleString()}/mo
                      </span>
                    </div>

                    {/* Flow visual */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-purple-900/40 text-xs">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block">Surplus Source</span>
                        <strong className="text-white text-xs">{match.source_department}</strong>
                        <span className="text-[10px] text-rose-400 block">({match.seats_offered} unused)</span>
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] font-bold text-purple-300">{match.seats_matched} Seats</span>
                        <ArrowRight className="w-4 h-4 text-purple-400 animate-pulse" />
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block">Target Need</span>
                        <strong className="text-white text-xs">{match.target_department}</strong>
                        <span className="text-[10px] text-blue-400 block">(Needs {match.seats_requested})</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                      "{match.ai_recommendation_reason}"
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleProcess(match.id, 'reject')}
                        disabled={processingId === match.id}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleProcess(match.id, 'approve')}
                        disabled={processingId === match.id}
                        className="px-4 py-1.5 rounded-xl text-[11px] font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {processingId === match.id ? 'Executing...' : 'Approve Transfer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 text-[10px] text-purple-300/70 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Administrator authorization required. Subscriptions never altered without approval.</span>
          </div>
        </div>

        {/* SECTION 3: RESOURCE DEMAND */}
        <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Section 3</span>
                <h2 className="text-xs font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
                  <TrendingDown className="w-4 h-4 text-blue-400" />
                  Resource Demand
                </h2>
              </div>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                {exchangeData?.resource_demand?.length || 0} Requisitions
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Active requisitions submitted by departmental managers requesting additional subscription seats.
            </p>

            <div className="space-y-3">
              {(exchangeData?.resource_demand || []).map((dem, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{dem.target_department}</span>
                    <Badge status={dem.status} />
                  </div>
                  <div className="text-[11px] text-blue-300 mt-1">{dem.product_name}</div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Requisition: <strong className="text-white">{dem.seats_requested} seats</strong></span>
                    <span>Req by: {dem.requested_by?.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            * Demand matched against surplus before purchasing external licenses.
          </div>
        </div>
      </div>

      {/* Green Cloud Impact */}
      <GreenCloudMetrics
        avoidedMonthlyCost={exchangeData?.metrics?.potential_monthly_savings || 60000}
        seatsReclaimed={15}
      />

      {/* COMPLETED REALLOCATIONS & AUDIT HISTORY */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Completed Value Exchange Transactions & Audit Trail
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">Immutable Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="pb-2 font-semibold">Ref #</th>
                <th className="pb-2 font-semibold">Product</th>
                <th className="pb-2 font-semibold">Source Department</th>
                <th className="pb-2 font-semibold">Destination Department</th>
                <th className="pb-2 font-semibold text-center">Transferred</th>
                <th className="pb-2 font-semibold text-right">Avoided Monthly Spend</th>
                <th className="pb-2 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {completedMatches.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-bold text-purple-400">{m.request_number}</td>
                  <td className="py-2.5 text-slate-200">{m.product_name}</td>
                  <td className="py-2.5 text-slate-300">{m.source_department}</td>
                  <td className="py-2.5 text-slate-300 font-semibold">{m.target_department}</td>
                  <td className="py-2.5 text-center font-bold text-white">{m.seats_matched} seats</td>
                  <td className="py-2.5 text-right font-extrabold text-emerald-400">
                    INR {parseFloat(m.financial_savings_amount).toLocaleString()}
                  </td>
                  <td className="py-2.5 text-center">
                    <Badge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
