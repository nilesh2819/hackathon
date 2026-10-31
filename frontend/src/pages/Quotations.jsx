import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import { FileSpreadsheet, Plus, CheckCircle2, ArrowRight, Clock, FileCheck } from 'lucide-react';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unitPrice, setUnitPrice] = useState(4000);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuotations = async () => {
    try {
      const [qRes, cRes, pRes, plRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/customers'),
        api.get('/products'),
        api.get('/plans')
      ]);
      if (qRes.data.success) setQuotations(qRes.data.quotations);
      if (cRes.data.success) setCustomers(cRes.data.customers);
      if (pRes.data.success) setProducts(pRes.data.products);
      if (plRes.data.success) setPlans(plRes.data.plans);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const validityDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await api.post('/quotations', {
        customer_id: customerId,
        validity_date: validityDate,
        notes,
        items: [
          {
            product_id: selectedProduct,
            plan_id: selectedPlan,
            quantity: parseInt(quantity, 10),
            unit_price: parseFloat(unitPrice),
            tax_rate: 18.00
          }
        ]
      });

      setShowModal(false);
      setNotes('');
      fetchQuotations();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvert = async (quotationId) => {
    try {
      const res = await api.post(`/quotations/${quotationId}/convert`);
      if (res.data.success) {
        alert(res.data.message);
        fetchQuotations();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            Quotation Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build customized client proposals with tiered plans and 1-click conversion into Active Subscriptions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-glow-purple flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </button>
      </div>

      {/* Quotation Table */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Quote #</th>
              <th className="pb-3 font-semibold">Client Company</th>
              <th className="pb-3 font-semibold">Validity Date</th>
              <th className="pb-3 font-semibold">Subtotal</th>
              <th className="pb-3 font-semibold">Taxes (18%)</th>
              <th className="pb-3 font-semibold">Total Amount</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Lifecycle Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-purple-400">{q.quotation_number}</td>
                <td className="py-3 text-slate-200">
                  <div className="font-semibold">{q.company_name}</div>
                  <div className="text-[10px] text-slate-400">{q.customer_name}</div>
                </td>
                <td className="py-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{q.validity_date}</span>
                  </div>
                </td>
                <td className="py-3 text-slate-300">INR {parseFloat(q.subtotal).toLocaleString()}</td>
                <td className="py-3 text-slate-400">INR {parseFloat(q.tax_amount).toLocaleString()}</td>
                <td className="py-3 font-extrabold text-white">INR {parseFloat(q.total_amount).toLocaleString()}</td>
                <td className="py-3"><Badge status={q.status} /></td>
                <td className="py-3 text-right">
                  {q.status === 'converted' ? (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Subscribed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvert(q.id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all inline-flex items-center gap-1"
                    >
                      <span>Convert to Subscription</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
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
            <h2 className="text-base font-extrabold text-white mb-4">Create Client Quotation</h2>
            <form onSubmit={handleCreateQuotation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Client Organization</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Product</label>
                  <select
                    required
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const p = products.find(prod => String(prod.id) === e.target.value);
                      if (p) setUnitPrice(p.sales_price);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Subscription Plan</label>
                  <select
                    required
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Select plan...</option>
                    {plans.map(pl => (
                      <option key={pl.id} value={pl.id}>{pl.name} ({pl.billing_frequency})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Seats / Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Unit Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Proposal Validity (Days)</label>
                <input
                  type="number"
                  min="7"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes & Enterprise Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, deployment timeline, and SLA commitments..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
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
                  className="px-4 py-2 rounded-xl text-white font-bold bg-purple-600 hover:bg-purple-500 shadow-glow-purple disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save & Issue Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
