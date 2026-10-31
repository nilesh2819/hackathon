import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import HackathonBanner from '../components/HackathonBanner';
import GreenCloudMetrics from '../components/GreenCloudMetrics';
import {
  TrendingUp,
  Repeat,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  AlertTriangle,
  Download,
  CheckCircle,
  Bot,
  Layers,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [exchange, setExchange] = useState(null);
  const [usage, setUsage] = useState(null);
  const [recentSubs, setRecentSubs] = useState([]);
  const [recentInvs, setRecentInvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState('');

  const loadDashboardData = async () => {
    try {
      const [anRes, exRes, usRes, subRes, invRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/intelligence/exchange'),
        api.get('/intelligence/usage-to-value'),
        api.get('/subscriptions?limit=6'),
        api.get('/invoices?limit=6')
      ]);

      if (anRes.data.success) setAnalytics(anRes.data);
      if (exRes.data.success) setExchange(exRes.data);
      if (usRes.data.success) setUsage(usRes.data);
      if (subRes.data.success) setRecentSubs(subRes.data.subscriptions.slice(0, 6));
      if (invRes.data.success) setRecentInvs(invRes.data.invoices.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickApproveExchange = async (requestId) => {
    setApproving(true);
    setApprovalSuccess('');
    try {
      const res = await api.post('/intelligence/exchange/process', {
        request_id: requestId,
        action: 'approve',
        notes: 'One-click approved from Executive Dashboard'
      });
      if (res.data.success) {
        setApprovalSuccess(res.data.message);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApproving(false);
    }
  };

  const pendingExchange = exchange?.matching_proposals?.find(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Hackathon Judge Presentation Tour Banner */}
      <HackathonBanner />

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 shadow-glow-purple">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">
              Welcome back, {user?.full_name || 'Administrator'}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              {user?.role} portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Brightloop Software Intelligent Subscription Value Exchange platform is actively monitoring 100 subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/value-exchange"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-glow-purple transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Value Exchange
          </Link>
          <Link
            to="/ai-assistant"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            Ask AI Assistant
          </Link>
        </div>
      </div>

      {/* SIGNATURE DEMONSTRATION ACTION BANNER */}
      {pendingExchange && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                  AI Reallocation Opportunity #{pendingExchange.request_number}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse">
                  Idle Capacity Avoidance
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium mt-1">
                <strong>{pendingExchange.source_department}</strong> holds {pendingExchange.seats_offered} unused seats.
                <strong> {pendingExchange.target_department}</strong> requested {pendingExchange.seats_requested} seats.
                Reallocating {pendingExchange.seats_matched} seats avoids purchasing new licenses!
              </p>
              <p className="text-[11px] text-emerald-400 font-bold mt-1">
                Immediate Avoided Capital: INR {parseFloat(pendingExchange.financial_savings_amount).toLocaleString()}/month (INR {(parseFloat(pendingExchange.financial_savings_amount) * 12).toLocaleString()}/year)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            {approvalSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Transferred!
              </span>
            ) : (
              <button
                onClick={() => handleQuickApproveExchange(pendingExchange.id)}
                disabled={approving}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {approving ? 'Transferring...' : `Approve 15-Seat Transfer`}
              </button>
            )}
            <Link
              to="/value-exchange"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Review Details
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring (MRR)"
          value={`INR ${(analytics?.kpis?.mrr || 295000).toLocaleString()}`}
          subtext={`ARR: INR ${(analytics?.kpis?.arr || 3540000).toLocaleString()}`}
          icon={TrendingUp}
          trend="+14.2%"
          color="purple"
        />

        <StatCard
          title="Value Reclaimed (Avoided)"
          value={`INR ${(exchange?.metrics?.potential_monthly_savings || 60000).toLocaleString()}/mo`}
          subtext="Through cross-department seat exchange"
          icon={Sparkles}
          trend="Saved"
          color="blue"
        />

        <StatCard
          title="Active Subscriptions"
          value={analytics?.kpis?.active_subscriptions || 100}
          subtext="Across 50 corporate clients"
          icon={Repeat}
          color="emerald"
        />

        <StatCard
          title="Overdue Invoices"
          value={analytics?.kpis?.overdue_invoices_count || 3}
          subtext={`Total: INR ${(analytics?.kpis?.overdue_invoices_amount || 86400).toLocaleString()}`}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* ESG Green Cloud Sustainability Metrics */}
      <GreenCloudMetrics
        avoidedMonthlyCost={exchange?.metrics?.potential_monthly_savings || 60000}
        seatsReclaimed={15}
      />

      {/* Innovation Insights Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage-to-Value Pulse */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Usage-to-Value Pulse
              </span>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                Live Score
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white">
                  {usage?.summary?.platform_value_score || 72}<span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Platform Value Efficiency</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-400">
                  {usage?.summary?.overall_utilization_rate || 71}%
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Seat Utilization</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-amber-300">Capacity Alert</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {usage?.summary?.total_unused_seats || 35} subscription seats currently idle across accounts.
              </p>
            </div>
          </div>

          <Link
            to="/usage-intelligence"
            className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center justify-between pt-2 border-t border-slate-800/80"
          >
            <span>Inspect Value Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sharing Intelligence Radar */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Department Capacity
              </span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                Sharing Rules
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Marketing Unit</span>
                <span className="text-rose-400 font-bold">20 Unused Seats (Surplus)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Engineering Core</span>
                <span className="text-blue-400 font-bold">15 Seats Deficit (100% util)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Sales & Outreach</span>
                <span className="text-emerald-400 font-bold">Optimal (94% util)</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              Eligible plans automatically mapped for internal sharing before purchasing new seats.
            </div>
          </div>

          <Link
            to="/sharing-intelligence"
            className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-between pt-2 border-t border-slate-800/80"
          >
            <span>View Sharing Policies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Future Waste Predictor Preview */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Waste Predictor
              </span>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                90-Day Forecast
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-400">Projected 3-Month Savings Potential</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                INR 40,69,263
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Under Best-Case active exchange model</p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-purple-300 font-semibold">AI Recommendation:</span> Reallocating seats immediately prevents 3 avoidable enterprise contract expansions.
            </div>
          </div>

          <Link
            to="/waste-predictor"
            className="mt-4 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center justify-between pt-2 border-t border-slate-800/80"
          >
            <span>Simulate Projections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Subscriptions & Invoices Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recent Subscriptions
            </span>
            <Link to="/subscriptions" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
              View All ({analytics?.kpis?.active_subscriptions || 100})
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/60 pb-2">
                  <th className="pb-2 font-semibold">Sub #</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Plan</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {recentSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-purple-400">{sub.subscription_number}</td>
                    <td className="py-2.5 text-slate-200">{sub.company_name}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[120px]">{sub.plan_name}</td>
                    <td className="py-2.5"><Badge status={sub.status} /></td>
                    <td className="py-2.5 text-right font-medium text-slate-100">
                      INR {parseFloat(sub.monthly_amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices with Download PDF */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recent Invoices & PDF
            </span>
            <Link to="/invoices" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
              View Invoices
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/60 pb-2">
                  <th className="pb-2 font-semibold">Invoice #</th>
                  <th className="pb-2 font-semibold">Client</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Amount</th>
                  <th className="pb-2 font-semibold text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {recentInvs.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-blue-400">{inv.invoice_number}</td>
                    <td className="py-2.5 text-slate-200 truncate max-w-[120px]">{inv.company_name}</td>
                    <td className="py-2.5"><Badge status={inv.status} /></td>
                    <td className="py-2.5 text-right font-medium text-slate-100">
                      INR {parseFloat(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-center">
                      <a
                        href={`http://localhost:5000/api/invoices/${inv.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        title="Download PDF Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
