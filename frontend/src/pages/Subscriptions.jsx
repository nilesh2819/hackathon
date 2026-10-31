import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  Repeat,
  Search,
  Filter,
  Play,
  Pause,
  RefreshCw,
  XCircle,
  Eye,
  Calendar,
  Layers,
  Building2
} from 'lucide-react';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [subDetails, setSubDetails] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get(`/subscriptions?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, search]);

  const handleLifecycle = async (id, action) => {
    try {
      const res = await api.post(`/subscriptions/${id}/lifecycle`, { action });
      if (res.data.success) {
        fetchSubscriptions();
        if (selectedSub && selectedSub.id === id) {
          viewDetails(id);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await api.get(`/subscriptions/${id}`);
      if (res.data.success) {
        setSelectedSub(res.data.subscription);
        setSubDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load details:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-purple-400" />
            Subscription Lifecycle Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking 100 enterprise recurring subscriptions, seat allocations and lifecycle workflows.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {['all', 'active', 'confirmed', 'paused', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SUB-2026-XXXX, customer name, or product..."
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Subscription #</th>
              <th className="pb-3 font-semibold">Customer Organization</th>
              <th className="pb-3 font-semibold">Plan & Product</th>
              <th className="pb-3 font-semibold">Seats</th>
              <th className="pb-3 font-semibold">Cadence</th>
              <th className="pb-3 font-semibold">Expiry Date</th>
              <th className="pb-3 font-semibold text-right">Monthly Spend</th>
              <th className="pb-3 font-semibold text-center">Status</th>
              <th className="pb-3 font-semibold text-right">Lifecycle Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-purple-400">
                  <button onClick={() => viewDetails(sub.id)} className="hover:underline flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.subscription_number}</span>
                  </button>
                </td>
                <td className="py-3 text-slate-200 font-medium">
                  <div>{sub.company_name}</div>
                  <div className="text-[10px] text-slate-400">{sub.customer_name}</div>
                </td>
                <td className="py-3 text-slate-300">
                  <div className="font-semibold text-white">{sub.product_name}</div>
                  <div className="text-[10px] text-slate-400">{sub.plan_name}</div>
                </td>
                <td className="py-3 font-bold text-slate-200">
                  {sub.total_seats} seats
                </td>
                <td className="py-3 capitalize text-slate-300">
                  {sub.billing_frequency}
                </td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">
                  {sub.expiry_date}
                </td>
                <td className="py-3 text-right font-extrabold text-white">
                  INR {parseFloat(sub.monthly_amount).toLocaleString()}
                </td>
                <td className="py-3 text-center">
                  <Badge status={sub.status} />
                </td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    {sub.status === 'active' && (
                      <button
                        onClick={() => handleLifecycle(sub.id, 'pause')}
                        title="Pause Subscription"
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {sub.status === 'paused' && (
                      <button
                        onClick={() => handleLifecycle(sub.id, 'activate')}
                        title="Resume Subscription"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleLifecycle(sub.id, 'renew')}
                      title="Renew for 1 Year"
                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    {sub.status !== 'closed' && (
                      <button
                        onClick={() => handleLifecycle(sub.id, 'close')}
                        title="Cancel / Close Subscription"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscription Details Modal */}
      {selectedSub && subDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Subscription Specification</span>
                <h2 className="text-lg font-black text-white">{selectedSub.subscription_number}</h2>
              </div>
              <Badge status={selectedSub.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Client</span>
                <span className="font-bold text-white text-xs">{selectedSub.company_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Plan & Product</span>
                <span className="font-bold text-white text-xs">{selectedSub.product_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monthly Spend</span>
                <span className="font-extrabold text-emerald-400 text-xs">INR {parseFloat(selectedSub.monthly_amount).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Seats</span>
                <span className="font-bold text-white text-xs">{selectedSub.total_seats} seats</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Terms</span>
                <span className="font-bold text-white text-xs">{selectedSub.payment_terms}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Contract Expiry</span>
                <span className="font-mono text-purple-300 text-xs">{selectedSub.expiry_date}</span>
              </div>
            </div>

            {/* Department Allocations */}
            {subDetails.allocations && subDetails.allocations.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Department Seat Breakdown</h3>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  {subDetails.allocations.map(al => (
                    <div key={al.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                      <div>
                        <span className="font-bold text-white">{al.department_name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">Mgr: {al.manager_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold">{al.active_seats} Active</span>
                        <span className="text-slate-400 ml-2">/ {al.allocated_seats} Allocated</span>
                        {al.unused_seats > 0 && (
                          <span className="text-rose-400 font-bold ml-2">({al.unused_seats} Unused!)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
