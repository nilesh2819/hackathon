import React, { useState } from 'react';
import { Settings, Shield, Database, Percent, Building2, Check, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [taxes, setTaxes] = useState([
    { id: 1, name: 'GST Standard (18%)', rate_percent: 18.00, description: 'Standard B2B tax applied on software & SaaS services', is_active: true },
    { id: 2, name: 'GST Reduced (12%)', rate_percent: 12.00, description: 'Reduced tier for non-profit and education plans', is_active: true },
    { id: 3, name: 'VAT European Union / UK (20%)', rate_percent: 20.00, description: 'Value Added Tax for cross-border contracts', is_active: true },
    { id: 4, name: 'US State Software Tax (8%)', rate_percent: 8.00, description: 'Average US state digital services sales tax', is_active: true }
  ]);

  const [dbMode, setDbMode] = useState('Dual Mode (PostgreSQL + Embedded SQLite Zero-Config)');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          System Settings & Tax Rules
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure corporate entity parameters, automated billing tax engines, and PostgreSQL database connections.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>System configuration updated successfully.</span>
        </div>
      )}

      {/* Taxes Management */}
      <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Automated Tax Calculation Rules
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Applied automatically to invoices & quotes</span>
        </div>

        <div className="space-y-3">
          {taxes.map((t) => (
            <div key={t.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white text-xs">{t.name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-black text-purple-300 text-sm">{t.rate_percent}%</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database & pgAdmin 4 Instructions */}
      <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Database Configuration & pgAdmin 4 Integration
            </h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">Dual-Engine Active</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            RECLAIM AI is built on a relational architecture. It runs out-of-the-box using the embedded zero-config SQLite engine, and connects seamlessly to <strong>PostgreSQL and pgAdmin 4</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-xs">How to Connect to PostgreSQL & pgAdmin 4:</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px]">
              <li>Open <strong>pgAdmin 4</strong> and create a new database named <code className="text-purple-300 font-mono">reclaim_ai_db</code>.</li>
              <li>Right-click the database, open <strong>Query Tool</strong>, open <code className="text-purple-300 font-mono">backend/database/schema.sql</code>, and click <strong>Execute (F5)</strong>.</li>
              <li>Open <code className="text-purple-300 font-mono">backend/.env</code> and set:
                <pre className="mt-1 p-2 rounded-xl bg-black/60 text-emerald-400 font-mono text-[10px]">
USE_POSTGRES=true
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=reclaim_ai_db
                </pre>
              </li>
              <li>Run <code className="text-purple-300 font-mono">npm run seed</code> in <code className="text-purple-300 font-mono">backend/</code> to populate 50 customers and 100 subscriptions.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Corporate Entity Details */}
      <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Corporate Legal Entity (Brightloop Software)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Company Legal Name</label>
            <input
              type="text"
              readOnly
              value="Brightloop Software Technologies Pvt. Ltd."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Registered Tax GSTIN / VAT</label>
            <input
              type="text"
              readOnly
              value="29AAACB1000C1Z5"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Official Support Dispatch Email</label>
            <input
              type="text"
              readOnly
              value="billing@brightloop.io"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Registered Headquarters Address</label>
            <input
              type="text"
              readOnly
              value="Tower B, Outer Ring Road, Bengaluru, Karnataka, 560103"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
