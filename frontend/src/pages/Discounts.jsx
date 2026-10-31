import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, Plus, Calendar, Percent, DollarSign, CheckCircle } from 'lucide-react';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState(15);
  const [minSpend, setMinSpend] = useState(10000);
  const [minQty, setMinQty] = useState(5);
  const [maxUses, setMaxUses] = useState(500);
  const [appliesTo, setAppliesTo] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/discounts');
      if (res.data.success) {
        setDiscounts(res.data.discounts);
      }
    } catch (err) {
      console.error('Failed to load discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/discounts', {
        code,
        name,
        type,
        value: parseFloat(value),
        min_purchase_amount: parseFloat(minSpend) || 0,
        min_quantity: parseInt(minQty, 10) || 1,
        max_uses: parseInt(maxUses, 10) || 100,
        applies_to: appliesTo
      });
      setShowModal(false);
      setCode('');
      setName('');
      fetchDiscounts();
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
            <Tag className="w-5 h-5 text-amber-400" />
            Discount & Promotion Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define automated pricing discount rules (Percentage / Fixed amount) with minimum seat hurdles and validity periods.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Discount Rule
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {discounts.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {d.code}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{d.type}</span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3">{d.name}</h3>
              <div className="mt-2 text-2xl font-black text-white">
                {d.type === 'percentage' ? `${d.value}% OFF` : `INR ${parseFloat(d.value).toLocaleString()} FLAT`}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Min Purchase:</span>
                  <span className="text-slate-200 font-medium">INR {parseFloat(d.min_purchase_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Seats:</span>
                  <span className="text-slate-200 font-medium">{d.min_quantity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="text-emerald-400 font-bold">{d.times_used} / {d.max_uses} used</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Valid till {d.end_date || '2026-12-31'}</span>
              <span className="text-emerald-400 font-bold">Active Rule</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-extrabold text-white mb-4">Add Discount Rule</h2>
            <form onSubmit={handleCreateDiscount} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ENTERPRISE25"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enterprise 25% Grant"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (INR)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Spend (INR)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Seat Count</label>
                  <input
                    type="number"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
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
                  className="px-4 py-2 rounded-xl text-white font-bold bg-amber-600 hover:bg-amber-500 shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
