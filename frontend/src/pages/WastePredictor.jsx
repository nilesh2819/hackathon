import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function WastePredictor() {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Assumption Parameters
  const [growthRate, setGrowthRate] = useState(5); // 5%
  const [churnRisk, setChurnRisk] = useState(8); // 8%
  const [optimizationEffort, setOptimizationEffort] = useState(65); // 65%

  const fetchPredictions = async () => {
    try {
      const res = await api.post('/intelligence/predict-waste', {
        growthRate: growthRate / 100,
        churnRisk: churnRisk / 100,
        optimizationEffort: optimizationEffort / 100
      });
      if (res.data.success) {
        setPredictionData(res.data);
      }
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [growthRate, churnRisk, optimizationEffort]);

  // Combine scenario projections for charting
  const chartData = (predictionData?.scenarios?.expected || []).map((exp, idx) => {
    const best = predictionData?.scenarios?.best_case?.[idx] || {};
    const worst = predictionData?.scenarios?.worst_case?.[idx] || {};
    return {
      month: exp.month,
      expected_waste: exp.projected_waste_with_reclaim,
      worst_waste: worst.projected_waste,
      best_waste: best.projected_waste,
      savings_achieved: exp.projected_savings
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-400" />
              AI-Powered Future Waste Predictor
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Predictive Modeling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates future unutilized capacity, unoptimized renewals, and project savings across Best, Expected, and Worst Case scenarios.
          </p>
        </div>

        <button
          onClick={fetchPredictions}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          Re-calculate Projections
        </button>
      </div>

      {/* Interactive Assumptions Control Panel */}
      <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Assumption Variables (Modify & Observe Real-Time Impact)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Dynamic simulation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Slider 1: Projected Seat Growth */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Projected Seat Demand Growth</span>
              <span className="text-purple-400 font-extrabold">{growthRate}% / mo</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-slate-500">Anticipated hiring velocity and seat expansions.</p>
          </div>

          {/* Slider 2: Churn / Dormancy Risk */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Seat Underutilization Risk</span>
              <span className="text-rose-400 font-extrabold">{churnRisk}% / mo</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              value={churnRisk}
              onChange={(e) => setChurnRisk(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <p className="text-[10px] text-slate-500">Probability of newly assigned seats going idle.</p>
          </div>

          {/* Slider 3: Optimization Effort */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Value Exchange Reallocation Effort</span>
              <span className="text-emerald-400 font-extrabold">{optimizationEffort}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={optimizationEffort}
              onChange={(e) => setOptimizationEffort(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-500">Percentage of surplus seats matched internally.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Best-Case 90-Day Potential Savings"
          value={`INR ${(predictionData?.cumulative_3_month_potential_savings?.best_case || 4069263).toLocaleString()}`}
          subtext="Under aggressive internal seat redistribution"
          icon={Sparkles}
          color="emerald"
        />

        <StatCard
          title="Expected-Case 90-Day Savings"
          value={`INR ${(predictionData?.cumulative_3_month_potential_savings?.expected || 2540000).toLocaleString()}`}
          subtext={`With ${optimizationEffort}% Value Exchange adoption`}
          icon={TrendingUp}
          color="purple"
        />

        <StatCard
          title="Worst-Case Unchecked Idle Waste"
          value={`INR ${(predictionData?.scenarios?.worst_case?.[2]?.projected_waste || 2450000).toLocaleString()}/mo`}
          subtext="If zero surplus reallocations are executed"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Area Chart Comparison */}
      <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Waste Trajectory Simulation: Worst Case vs. Expected vs. Best Case
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Projected idle capital waste (INR) over the next 90 days</p>
          </div>
          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            3-Scenario Model
          </span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="worstGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="bestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="worst_waste" name="Worst Case (Zero Sharing)" stroke="#F43F5E" fillOpacity={1} fill="url(#worstGrad)" />
              <Area type="monotone" dataKey="expected_waste" name="Expected (Current Trajectory)" stroke="#8B5CF6" fillOpacity={1} fill="url(#expectedGrad)" />
              <Area type="monotone" dataKey="best_waste" name="Best Case (Value Exchange Active)" stroke="#10B981" fillOpacity={1} fill="url(#bestGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictive Insights Cards */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          AI Waste Prediction Syntheses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {(predictionData?.ai_insights || []).map((ins, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
                {idx + 1}
              </span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
