import React, { useState } from 'react';
import { MessageSquare, FileText, Calendar, Send, Clock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OdooChatter({ recordName = 'Subscription' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('note'); // 'msg', 'note', 'activity'
  const [inputText, setInputText] = useState('');
  const [feed, setFeed] = useState([
    {
      id: 1,
      author: 'Eleanor Vance',
      role: 'Chief Admin',
      type: 'system',
      text: `Record created and initialized with 100 DevCloud seats for Brightloop internal operations.`,
      time: 'Today at 09:15 AM'
    },
    {
      id: 2,
      author: 'Marcus Brody',
      role: 'Sales & Billing',
      type: 'note',
      text: `Customer requested usage telemetry review before next quarter renewal cycle.`,
      time: 'Today at 10:30 AM'
    },
    {
      id: 3,
      author: 'RECLAIM AI Bot',
      role: 'Automated Intelligence',
      type: 'ai',
      text: `Value Exchange match detected: 20 idle seats in Marketing eligible for transfer to Engineering.`,
      time: 'Today at 11:45 AM'
    }
  ]);

  const handlePost = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newEntry = {
      id: Date.now(),
      author: user?.full_name || 'Current User',
      role: user?.role === 'admin' ? 'Administrator' : 'Staff Employee',
      type: activeTab,
      text: inputText,
      time: 'Just now'
    };

    setFeed([newEntry, ...feed]);
    setInputText('');
  };

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#714B67]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Odoo Chatter & Activity Log ({recordName})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold bg-slate-800/80 px-2 py-0.5 rounded-full">
          Employee Collaboration
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setActiveTab('note')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'note'
              ? 'bg-[#714B67] text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Log Internal Note</span>
        </button>

        <button
          onClick={() => setActiveTab('msg')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'msg'
              ? 'bg-[#00A09D] text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Message</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule Activity</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handlePost} className="mt-3 relative">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            activeTab === 'note'
              ? 'Log internal note visible only to your Brightloop colleagues...'
              : (activeTab === 'msg' ? 'Send an official email notification to customer...' : 'Schedule a follow-up call or activity...')
          }
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#714B67] pr-24"
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3.5 px-3 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#875A7B] text-white font-bold text-xs shadow-sm flex items-center gap-1"
        >
          <span>Post</span>
          <Send className="w-3 h-3" />
        </button>
      </form>

      {/* Chatter Feed Log */}
      <div className="mt-4 space-y-3">
        {feed.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
              item.type === 'ai'
                ? 'bg-purple-950/20 border-purple-800/40'
                : (item.type === 'note' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-900/60 border-slate-800/60')
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              item.type === 'ai' ? 'bg-[#714B67] text-white' : 'bg-slate-800 text-purple-300'
            }`}>
              {item.type === 'ai' ? 'AI' : item.author[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-white font-bold text-xs">{item.author}</strong>
                  <span className="text-[10px] text-slate-400 ml-2">({item.role})</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
