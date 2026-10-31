import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  FileText,
  Search,
  Plus,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchInvoices = async () => {
    try {
      const [invRes, subRes] = await Promise.all([
        api.get(`/invoices?status=${statusFilter}&search=${encodeURIComponent(search)}`),
        api.get('/subscriptions?status=active')
      ]);
      if (invRes.data.success) setInvoices(invRes.data.invoices);
      if (subRes.data.success) setSubscriptions(subRes.data.subscriptions);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  const handleGenerateRecurring = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/invoices/generate-recurring', {
        subscription_id: parseInt(selectedSubId, 10)
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setShowModal(false);
        fetchInvoices();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Invoice generation error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Invoice & Billing Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated recurring invoice generation, duplicate billing prevention, tax calculations and downloadable PDFs.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback({ type: '', message: '' });
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-glow-blue flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Generate Recurring Invoice
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
          feedback.type === 'error'
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {['all', 'confirmed', 'paid', 'overdue', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or client..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Invoice #</th>
              <th className="pb-3 font-semibold">Client Organization</th>
              <th className="pb-3 font-semibold">Invoice Date</th>
              <th className="pb-3 font-semibold">Due Date</th>
              <th className="pb-3 font-semibold text-right">Subtotal</th>
              <th className="pb-3 font-semibold text-right">Taxes (18%)</th>
              <th className="pb-3 font-semibold text-right">Total Amount</th>
              <th className="pb-3 font-semibold text-right">Balance Due</th>
              <th className="pb-3 font-semibold text-center">Status</th>
              <th className="pb-3 font-semibold text-center">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-blue-400">{inv.invoice_number}</td>
                <td className="py-3 text-slate-200 font-semibold">{inv.company_name}</td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">{inv.invoice_date}</td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">
                  <span className={inv.status === 'overdue' ? 'text-rose-400 font-bold' : ''}>
                    {inv.due_date}
                  </span>
                </td>
                <td className="py-3 text-right text-slate-300">
                  INR {parseFloat(inv.subtotal).toLocaleString()}
                </td>
                <td className="py-3 text-right text-slate-400">
                  INR {parseFloat(inv.tax_total).toLocaleString()}
                </td>
                <td className="py-3 text-right font-extrabold text-white">
                  INR {parseFloat(inv.total_amount).toLocaleString()}
                </td>
                <td className="py-3 text-right font-bold">
                  <span className={parseFloat(inv.balance_due) > 0 ? 'text-amber-400' : 'text-slate-500'}>
                    INR {parseFloat(inv.balance_due).toLocaleString()}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <Badge status={inv.status} />
                </td>
                <td className="py-3 text-center">
                  <a
                    href={`http://localhost:5000/api/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-all shadow-sm"
                    title="Download Official PDF Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
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
            <h2 className="text-base font-extrabold text-white mb-2">Generate Recurring Subscription Invoice</h2>
            <p className="text-xs text-slate-400 mb-4">
              Select an active subscription. RECLAIM AI computes line items, taxes, and automatically validates against duplicate billing for this billing cycle.
            </p>

            <form onSubmit={handleGenerateRecurring} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Active Subscription</label>
                <select
                  required
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Select a subscription...</option>
                  {subscriptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.subscription_number} - {s.company_name} ({s.product_name} - INR {parseFloat(s.monthly_amount).toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-slate-300 text-xs space-y-1">
                <p className="font-semibold text-blue-300">Billing Protection Active</p>
                <p className="text-[11px] text-slate-400">
                  If an invoice has already been issued for the target subscription during the current calendar month, the transaction will be blocked to ensure clean zero-duplicate compliance.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  className="px-4 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-500 shadow-glow-blue disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Issue Recurring Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
