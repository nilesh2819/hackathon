import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Plus, CheckCircle, Search, DollarSign } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      const [payRes, invRes] = await Promise.all([
        api.get('/payments'),
        api.get('/invoices')
      ]);
      if (payRes.data.success) setPayments(payRes.data.payments);
      if (invRes.data.success) {
        // filter invoices with balance > 0
        setInvoices(invRes.data.invoices.filter(i => parseFloat(i.balance_due) > 0));
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payments', {
        invoice_id: parseInt(selectedInvoiceId, 10),
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        reference_notes: notes
      });
      setShowModal(false);
      setAmount('');
      setNotes('');
      fetchPayments();
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
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Payment Reconciliation Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Record customer remittance, link transactions to invoices, and track outstanding ledger balances.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record Incoming Payment
        </button>
      </div>

      {/* Payments Table */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Payment #</th>
              <th className="pb-3 font-semibold">Target Invoice</th>
              <th className="pb-3 font-semibold">Client Company</th>
              <th className="pb-3 font-semibold">Payment Date</th>
              <th className="pb-3 font-semibold">Method</th>
              <th className="pb-3 font-semibold">Transaction Notes</th>
              <th className="pb-3 font-semibold text-right">Amount Paid</th>
              <th className="pb-3 font-semibold text-center">Reconciliation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-bold text-emerald-400">{p.payment_number}</td>
                <td className="py-3 font-bold text-blue-400">{p.invoice_number}</td>
                <td className="py-3 text-slate-200 font-medium">{p.company_name}</td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">{p.payment_date}</td>
                <td className="py-3 text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                    {p.payment_method}
                  </span>
                </td>
                <td className="py-3 text-slate-400 text-[11px] max-w-[200px] truncate">{p.reference_notes || 'Direct settlement'}</td>
                <td className="py-3 text-right font-extrabold text-emerald-400">
                  INR {parseFloat(p.amount).toLocaleString()}
                </td>
                <td className="py-3 text-center">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Settled
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-extrabold text-white mb-4">Record Customer Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Outstanding Invoice</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => String(i.id) === e.target.value);
                    if (inv) setAmount(inv.balance_due);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Select an outstanding invoice...</option>
                  {invoices.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.invoice_number} - {i.company_name} (Balance: INR {parseFloat(i.balance_due).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Amount (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Credit Card">Corporate Credit Card</option>
                    <option value="UPI">UPI Instant Pay</option>
                    <option value="Stripe">Stripe Checkout</option>
                    <option value="Cash">Cheque / Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Transaction Ref / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. HDFC Ref #UTR991823746"
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
                  className="px-4 py-2 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-500 shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
