import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  Layers,
  Users,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Tag,
  Gauge,
  Share2,
  ArrowLeftRight,
  TrendingUp,
  Bot,
  BarChart3,
  Settings,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  // Navigation config with role permissions
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard, roles: ['admin', 'staff', 'customer'] },
    
    // Core Subscription Management (Brightloop Odoo Challenge Modules)
    { section: 'Subscription Engine' },
    { label: 'Products & Variants', path: '/products', icon: Box, roles: ['admin'] },
    { label: 'Subscription Plans', path: '/plans', icon: Layers, roles: ['admin'] },
    { label: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'staff'] },
    { label: 'Quotations', path: '/quotations', icon: FileSpreadsheet, roles: ['admin', 'staff'] },
    { label: 'Subscriptions', path: '/subscriptions', icon: Repeat, roles: ['admin', 'staff', 'customer'] },
    { label: 'Invoices & Billing', path: '/invoices', icon: FileText, roles: ['admin', 'staff', 'customer'] },
    { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['admin', 'staff', 'customer'] },
    { label: 'Discounts & Promo', path: '/discounts', icon: Tag, roles: ['admin'] },

    // Signature Innovations & AI Intelligence
    { section: 'Reclaim Intelligence' },
    { label: 'Usage-to-Value', path: '/usage-intelligence', icon: Gauge, badge: 'Core', roles: ['admin', 'staff', 'customer'] },
    { label: 'Sharing Intelligence', path: '/sharing-intelligence', icon: Share2, roles: ['admin', 'staff'] },
    { label: 'Value Exchange', path: '/value-exchange', icon: ArrowLeftRight, badge: 'Live', roles: ['admin'] },
    { label: 'Future Waste Predictor', path: '/waste-predictor', icon: TrendingUp, badge: 'AI', roles: ['admin'] },
    { label: 'AI Business Assistant', path: '/ai-assistant', icon: Bot, roles: ['admin', 'staff'] },

    // Reporting & System
    { section: 'Analytics & Controls' },
    { label: 'Financial Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'staff'] },
    { label: 'Taxes & Settings', path: '/settings', icon: Settings, roles: ['admin'] }
  ];

  return (
    <aside className="w-64 bg-[#080C14] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#714B67] to-[#00A09D] flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-base text-white">
              odoo
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#714B67] text-white">
              RECLAIM
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Brightloop Platform</p>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-5 py-3 border-b border-slate-800/50 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {role === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
          {role === 'staff' && <UserCheck className="w-4 h-4 text-blue-400" />}
          {role === 'customer' && <Users className="w-4 h-4 text-emerald-400" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {role} PORTAL
          </span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
          v1.0
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="pt-4 pb-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.section}
                </span>
              </div>
            );
          }

          if (!item.roles.includes(role)) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    item.badge === 'Live'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : item.badge === 'Core'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Preview */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Guest User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'No email'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
