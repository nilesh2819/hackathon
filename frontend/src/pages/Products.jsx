import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Box, Plus, Search, Tag, Check, Edit2, Trash2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('software');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [description, setDescription] = useState('');
  const [hasOdooVariant, setHasOdooVariant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const variants = hasOdooVariant ? [
        { variant_name: 'Brand: Odoo Integrated', attribute_name: 'Brand', attribute_value: 'Odoo Edition', price_extra: 560.00 }
      ] : [];

      await api.post('/products', {
        name,
        code,
        type,
        sales_price: parseFloat(salesPrice) || 0,
        cost_price: parseFloat(costPrice) || 0,
        description,
        variants
      });

      setShowModal(false);
      setName('');
      setCode('');
      setSalesPrice('');
      setCostPrice('');
      setDescription('');
      setHasOdooVariant(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-purple-400" />
            Product Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure software products, add-ons, pricing structures and variants (e.g. Odoo brand edition).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-glow-purple flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by title or code..."
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {prod.code}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 capitalize">
                  {prod.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3">{prod.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description || 'Standard subscription product.'}</p>

              {/* Pricing breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Sales Price</span>
                  <span className="text-sm font-extrabold text-white">INR {parseFloat(prod.sales_price).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Cost Price</span>
                  <span className="text-xs font-semibold text-slate-400">INR {parseFloat(prod.cost_price).toLocaleString()}</span>
                </div>
              </div>

              {/* Variants Pill List */}
              {prod.variants && prod.variants.length > 0 && (
                <div className="mt-3.5 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 block">Variants & Price Adders:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {prod.variants.map((v) => (
                      <span key={v.id} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                        {v.variant_name} (+INR {parseFloat(v.price_extra).toLocaleString()})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{prod.plans?.length || 0} Billing Plans linked</span>
              <span className="text-emerald-400 font-semibold">Active Catalog</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-extrabold text-white mb-4">Add Subscription Product</h2>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brightloop CRM Suite"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BL-CRM-01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Product Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="software">Software (Seat-Based)</option>
                    <option value="service">Dedicated Service</option>
                    <option value="addon">Addon Resource</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Sales Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cost Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Subscription details and value propositions..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Odoo Variant Checkbox Option from Challenge */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="odooVariant"
                  checked={hasOdooVariant}
                  onChange={(e) => setHasOdooVariant(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="odooVariant" className="text-slate-200 font-medium">
                  Add <strong>Odoo Brand Variant</strong> (+INR 560 to sales price)
                </label>
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
                  className="px-4 py-2 rounded-xl text-white font-bold bg-purple-600 hover:bg-purple-500 shadow-glow-purple disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
