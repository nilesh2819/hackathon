import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Gauge,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Plus,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function UsageIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);

  // Manual entry modal form
  const [subId, setSubId] = useState('1');
  const [deptId, setDeptId] = useState('1');
  const [totalSeats, setTotalSeats] = useState(50);
  const [activeSeats, setActiveSeats] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsageData = async () => {
    try {
      const res = await api.get('/intelligence/usage-to-value');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  const handleRecordManual = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/intelligence/usage-to-value/record', {
        subscription_id: parseInt(subId, 10),
        department_id: parseInt(deptId, 10),
        total_seats: parseInt(totalSeats, 10),
        active_seats: parseInt(activeSeats, 10),
        is_simulated: isSimulatedMode
      });
      setShowManualModal(false);
      fetchUsageData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = (data?.subscriptions || []).slice(0, 8).map(s => ({
    name: s.subscription_number,
    active: s.active_seats,
    unused: s.unused_seats,
    rate: s.utilization_rate
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              Usage-to-Value Intelligence
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Signature Innovation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measures the actual value received versus expenditure paid, identifying inactive capacity and cost-per-seat efficiency.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Simulated Mode Toggle */}
          <button
            onClick={() => setIsSimulatedMode(!isSimulatedMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700"
          >
            {isSimulatedMode ? (
              <ToggleRight className="w-5 h-5 text-purple-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
            <span className="text-[11px] font-semibold">
              {isSimulatedMode ? 'Simulated Demo Data' : 'Live Telemetry Mode'}
            </span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-glow-purple flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Manual Telemetry Entry
          </button>
        </div>
      </div>

      {isSimulatedMode && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span><strong>SIMULATED BENCHMARK MODE ACTIVE:</strong> Usage metrics are calculated against synthetic high-concurrency benchmarks for demonstration.</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/40">DEMO TAGGED</span>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Platform Value Score"
          value={`${data?.summary?.platform_value_score || 72} / 100`}
          subtext="Value efficiency index"
          icon={Sparkles}
          color="purple"
        />

        <StatCard
          title="Overall Seat Utilization"
          value={`${data?.summary?.overall_utilization_rate || 71}%`}
          subtext={`${data?.summary?.total_active_seats || 240} of ${data?.summary?.total_purchased_seats || 340} seats in active use`}
          icon={Gauge}
          trend="+5.4%"
          color="blue"
        />

        <StatCard
          title="Idle Capacity Waste"
          value={`INR ${(data?.summary?.total_wasted_expenditure || 1624500).toLocaleString()}`}
          subtext={`${data?.summary?.total_unused_seats || 35} subscription seats unutilized`}
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Active Monthly Expenditure"
          value={`INR ${(data?.summary?.total_monthly_expenditure || 5650000).toLocaleString()}`}
          subtext="Total subscription capital committed"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Utilization Bar Chart */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Subscription Seat Utilization: Active vs. Idle Unused
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Identifies subscriptions with excessive dormant seats</p>
          </div>
          <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            Recharts Engine
          </span>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="active" name="Active Seats (Utilized)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unused" name="Unused Seats (Waste)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Subscriptions Value Breakdown */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <div className="pb-3 border-b border-slate-800 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Subscription Usage-to-Value Scoreboard
          </span>
          <span className="text-[10px] text-slate-400">Showing top monitored allocations</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Subscription #</th>
              <th className="pb-3 font-semibold">Customer / Org</th>
              <th className="pb-3 font-semibold">Purchased</th>
              <th className="pb-3 font-semibold text-emerald-400">Active</th>
              <th className="pb-3 font-semibold text-rose-400">Idle Waste</th>
              <th className="pb-3 font-semibold">Cost / Active User</th>
              <th className="pb-3 font-semibold">Utilization</th>
              <th className="pb-3 font-semibold text-center">Value Score</th>
              <th className="pb-3 font-semibold">AI Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {(data?.subscriptions || []).map((sub) => (
              <tr key={sub.subscription_id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-purple-400">{sub.subscription_number}</td>
                <td className="py-3 text-slate-200 font-semibold">{sub.company_name}</td>
                <td className="py-3 text-slate-300">{sub.total_seats} seats</td>
                <td className="py-3 font-bold text-emerald-400">{sub.active_seats} seats</td>
                <td className="py-3 font-bold text-rose-400">
                  {sub.unused_seats > 0 ? `${sub.unused_seats} seats (INR ${parseFloat(sub.monthly_wasted_spend).toLocaleString()})` : '0 seats (0%)'}
                </td>
                <td className="py-3 font-mono text-slate-200">
                  INR {parseFloat(sub.cost_per_active_seat).toLocaleString()}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.utilization_rate >= 80 ? 'bg-emerald-500' : (sub.utilization_rate >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                        }`}
                        style={{ width: `${sub.utilization_rate}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-300">{sub.utilization_rate}%</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    sub.value_score >= 80
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : sub.value_score >= 60
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}>
                    {sub.value_score} / 100
                  </span>
                </td>
                <td className="py-3 text-slate-300 max-w-xs">
                  {sub.recommendations && sub.recommendations[0] ? (
                    <span className="text-[11px] text-slate-300 italic">
                      {sub.recommendations[0].message}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Normal operations</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-extrabold text-white mb-2">Record Seat Telemetry</h2>
            <p className="text-xs text-slate-400 mb-4">
              Log manual usage count or benchmark telemetry for capacity calculation.
            </p>

            <form onSubmit={handleRecordManual} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Subscription ID</label>
                  <input
                    type="number"
                    required
                    value={subId}
                    onChange={(e) => setSubId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="1">Marketing (MKT)</option>
                    <option value="2">Engineering (ENG)</option>
                    <option value="3">Sales (SLS)</option>
                    <option value="4">Product (PRD)</option>
                    <option value="5">Human Resources (HR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Purchased / Allocated Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Active Users (Logged In)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={activeSeats}
                    onChange={(e) => setActiveSeats(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                Calculated Unused Idle Seats: <strong className="text-rose-400">{Math.max(0, totalSeats - activeSeats)} seats</strong>
                <br />
                Calculated Utilization: <strong className="text-purple-400">{totalSeats > 0 ? Math.round((activeSeats / totalSeats) * 100) : 0}%</strong>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-white font-bold bg-purple-600 hover:bg-purple-500 shadow-glow-purple disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Save Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
