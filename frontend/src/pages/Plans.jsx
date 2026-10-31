import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Layers, Plus, Calendar, Check, X, Shield } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('monthly');
  const [price, setPrice] = useState('');
  const [minQty, setMinQty] = useState(1);
  const [autoClose, setAutoClose] = useState(false);
  const [canPause, setCanPause] = useState(true);
  const [canRenew, setCanRenew] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      const [plRes, prRes] = await Promise.all([
        api.get('/plans'),
        api.get('/products')
      ]);
      if (plRes.data.success) setPlans(plRes.data.plans);
      if (prRes.data.success) setProducts(prRes.data.products);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/plans', {
        product_id: productId,
        name,
        billing_frequency: billingFrequency,
        price: parseFloat(price) || 0,
        minimum_quantity: parseInt(minQty, 10) || 1,
        auto_close: autoClose,
        can_pause: canPause,
        can_renew: canRenew
      });
      setShowModal(false);
      setName('');
      setPrice('');
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Subscription Plan Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure recurring billing cadences (Daily, Weekly, Monthly, Yearly), pause/renew policies and seat minimums.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow-blue flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* Plan Table */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Plan Name</th>
              <th className="pb-3 font-semibold">Linked Product</th>
              <th className="pb-3 font-semibold">Billing Frequency</th>
              <th className="pb-3 font-semibold">Price per Seat</th>
              <th className="pb-3 font-semibold">Min Qty</th>
              <th className="pb-3 font-semibold text-center">Lifecycle Policies</th>
              <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {plans.map((pl) => (
              <tr key={pl.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-white">{pl.name}</td>
                <td className="py-3 text-slate-300">{pl.product_name}</td>
                <td className="py-3">
                  <span className="capitalize px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold text-[10px]">
                    {pl.billing_frequency}
                  </span>
                </td>
                <td className="py-3 font-extrabold text-white">INR {parseFloat(pl.price).toLocaleString()}</td>
                <td className="py-3 text-slate-300">{pl.minimum_quantity} seat(s)</td>
                <td className="py-3 text-center">
                  <div className="inline-flex items-center gap-2 text-[10px] text-slate-400">
                    <span className={pl.can_pause ? 'text-emerald-400' : 'text-slate-600'}>
                      Pause {pl.can_pause ? '✓' : '✗'}
                    </span>
                    <span>•</span>
                    <span className={pl.can_renew ? 'text-emerald-400' : 'text-slate-600'}>
                      Renew {pl.can_renew ? '✓' : '✗'}
                    </span>
                    <span>•</span>
                    <span className={pl.auto_close ? 'text-amber-400' : 'text-slate-600'}>
                      Auto-close {pl.auto_close ? '✓' : '✗'}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Available
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-extrabold text-white mb-4">Create Subscription Plan</h2>
            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Product</label>
                <select
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Monthly Pods"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Billing Frequency</label>
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Price per Seat (INR)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Minimum Seat Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Policies */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canPause"
                    checked={canPause}
                    onChange={(e) => setCanPause(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="canPause" className="text-slate-300">Allow customer / admin to pause subscription</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canRenew"
                    checked={canRenew}
                    onChange={(e) => setCanRenew(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="canRenew" className="text-slate-300">Allow automatic or early renewal</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoClose"
                    checked={autoClose}
                    onChange={(e) => setAutoClose(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="autoClose" className="text-slate-300">Auto-close plan when expiry date reached</label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-500 shadow-glow-blue disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
