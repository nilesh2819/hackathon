import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OdooAppLauncher from './OdooAppLauncher';
import {
  Bell,
  Search,
  LogOut,
  ShieldAlert,
  UserCheck,
  Users,
  Sparkles,
  Grid,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, quickDemoLogin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppLauncher, setShowAppLauncher] = useState(false);

  return (
    <>
      <header className="h-16 bg-[#080C14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Odoo 9-Dot Waffle App Switcher & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAppLauncher(true)}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#714B67] flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm group"
            title="Open Odoo App Launcher"
          >
            <Grid className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* Odoo Platform Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#714B67]/20 border border-[#714B67]/40 text-xs">
            <span className="font-extrabold text-white tracking-wide">odoo</span>
            <span className="text-[10px] text-purple-300 font-bold">18 Enterprise</span>
          </div>

          <div className="relative w-56 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in Odoo (filters, groups)..."
              className="w-full bg-slate-900/90 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#714B67] transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Quick Role Switcher & User Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => quickDemoLogin('admin')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                user?.role === 'admin'
                  ? 'bg-[#714B67] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              Admin
            </button>

            <button
              onClick={() => quickDemoLogin('staff')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                user?.role === 'staff'
                  ? 'bg-[#00A09D] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              Staff
            </button>

            <button
              onClick={() => quickDemoLogin('customer')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                user?.role === 'customer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3 h-3" />
              Customer
            </button>
          </div>

          {/* Value Avoided Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00A09D]/10 border border-[#00A09D]/30 text-[#00C4BF] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#00C4BF]" />
            <span>Avoided: <strong>INR 60,000/mo</strong></span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-[#080C14]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Odoo Activities & Alerts</span>
                  <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md">2 New</span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/60 text-slate-300">
                    <p className="font-semibold text-purple-300 text-[11px]">Value Exchange Opportunity</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Marketing has 20 unused DevCloud seats. Engineering needs 15 seats. Savings: INR 60,000/mo.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/60 text-slate-300">
                    <p className="font-semibold text-amber-300 text-[11px]">3 Overdue Invoices</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Total overdue balance: INR 86,400 across 3 client accounts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={logout}
            title="Sign Out"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Odoo App Launcher Modal */}
      <OdooAppLauncher
        isOpen={showAppLauncher}
        onClose={() => setShowAppLauncher(false)}
      />
    </>
  );
}
