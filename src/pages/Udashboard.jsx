import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';
import * as API from '../services/api.js';
import {
  Users2, Briefcase, TrendingUp, Clock,
  ArrowRight, Activity, Target, Award,
  CheckCircle2, Circle, ChevronRight,
  BarChart2, Flame, Star,
} from 'lucide-react';


const useCounter = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, format = 'number' }) => {
  const animated = useCounter(typeof value === 'number' ? Math.round(value) : 0);
  const display = format === 'currency'
? `₹${animated.toLocaleString()}`
    : format === 'percent'
    ? `${value}%`
    : animated.toLocaleString();

  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none font-mono">{display}</p>
        {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
      </div>
      <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const MiniBarChart = ({ data }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 340, H = 120, BAR_W = 28, GAP = 8;
  const cols = data.length;
  const totalW = cols * (BAR_W + GAP) - GAP;
  const startX = (W - totalW) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2FA77A" />
          <stop offset="100%" stopColor="#3BC08A" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = Math.max(((d.value / max) * (H - 28)), 4);
        const x = startX + i * (BAR_W + GAP);
        const y = H - 18 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx="5" fill="url(#barGrad)" opacity="0.9" />
            <text x={x + BAR_W / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
            <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill="#2FA77A">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const GoalItem = ({ label, current, target, done }) => {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${done ? 'bg-[#2FA77A] border-[#2FA77A]' : 'border-slate-200 bg-white'}`}>
        {done ? <CheckCircle2 size={14} className="text-white" /> : <Circle size={14} className="text-slate-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={`text-xs font-semibold truncate ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{label}</p>
          <span className="text-[10px] font-bold text-[#2FA77A] ml-2 flex-shrink-0">{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};
const Udashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leadsStats, setLeadsStats] = useState({ total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 });
  const [dealsStats, setDealsStats] = useState({ totalVal: 0, wonVal: 0, count: 0, proposal: 0, negotiation: 0, won: 0, lost: 0 });
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);

useEffect(() => {
  const load = async () => {
    try {
      const [leadsRes, dealsRes, companyRes] = await Promise.all([
        API.getLeads(),
        API.getDeals(),
        API.getMyCompany()
      ]);

      // ✅ COMPANY
      const c = companyRes?.data?.data;
      setCompany(c);

      // ✅ LEADS
      const leads = leadsRes.data.data || [];
      const lStats = { total: leads.length, new: 0, contacted: 0, qualified: 0, lost: 0 };
      leads.forEach(l => {
        if (lStats[l.status] !== undefined) lStats[l.status]++;
      });
      setLeadsStats(lStats);

      // ✅ DEALS
      const deals = dealsRes.data.data || [];
      const dStats = {
        totalVal: 0,
        wonVal: 0,
        count: deals.length,
        proposal: 0,
        negotiation: 0,
        won: 0,
        lost: 0
      };

      deals.forEach(d => {
        dStats.totalVal += d.value || 0;

        if (d.stage === "won") {
          dStats.won++;
          dStats.wonVal += d.value || 0;
        } else if (dStats[d.stage] !== undefined) {
          dStats[d.stage]++;
        }
      });

      setDealsStats(dStats);

    } catch (e) {
      console.error("DASHBOARD ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);
  const conversionRate = dealsStats.count > 0 ? Math.round((dealsStats.won / dealsStats.count) * 100) : 0;

  const weeklyLeads = [
    { label: 'Mon', value: 3 }, { label: 'Tue', value: 7 }, { label: 'Wed', value: 5 },
    { label: 'Thu', value: 9 }, { label: 'Fri', value: 6 }, { label: 'Sat', value: 2 }, { label: 'Sun', value: 4 },
  ];

  const goals = [
    { label: 'Close 10 deals this month', current: dealsStats.won, target: 10, done: dealsStats.won >= 10 },
    { label: 'Reach 50 qualified leads', current: leadsStats.qualified, target: 50, done: leadsStats.qualified >= 50 },
    { label: 'Hit $50K in pipeline value', current: Math.round(dealsStats.totalVal / 1000), target: 50, done: dealsStats.totalVal >= 50000 },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FA77A] border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2FA77A] to-[#1e7d59] rounded-2xl p-6 text-white shadow-lg shadow-[#2FA77A]/20">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -right-4 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/70 mb-1">{greeting()},</p>
            <h1 className="text-2xl font-bold tracking-tight leading-none">{user?.name ?? 'there'} 👋</h1>

<p className="text-sm text-white/70 mt-1">
  🏢 {company?.name} | {company?.subscription}
</p>
            <p className="text-sm text-white/60 mt-2">
              You have <span className="text-white font-bold">{leadsStats.new} new leads</span> and <span className="text-white font-bold">{dealsStats.proposal} deals</span> waiting for action.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="flex items-center gap-2 bg-white text-[#2FA77A] text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-all shadow-sm"
            >
              View Leads <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/deals')}
              className="flex items-center gap-2 bg-white/15 border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-white/25 transition-all"
            >
              View Deals
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users2}    label="Total Leads"     value={leadsStats.total}      sub={`↑ ${leadsStats.new} new this week`}      iconBg="bg-emerald-50"  iconColor="text-[#2FA77A]" />
        <StatCard icon={Briefcase} label="Pipeline Value"  value={dealsStats.totalVal}   sub={`${dealsStats.count} active deals`}        iconBg="bg-blue-50"     iconColor="text-blue-500"  format="currency" />
        <StatCard icon={TrendingUp} label="Won Revenue"    value={dealsStats.wonVal}     sub={`${dealsStats.won} deals closed`}          iconBg="bg-[#2FA77A]/10" iconColor="text-[#2FA77A]" format="currency" />
        <StatCard icon={Target}    label="Conversion Rate" value={conversionRate}         sub="Won vs total deals"                        iconBg="bg-amber-50"    iconColor="text-amber-500" format="percent" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sales Pipeline Stages</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Current deal distribution</p>
            </div>
            <button
              onClick={() => navigate('/deals')}
              className="flex items-center gap-1 text-xs font-bold text-[#2FA77A] hover:underline"
            >
              Manage <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ProgressBar label="Proposal"    value={dealsStats.proposal}    total={dealsStats.count} color="#F59E0B" />
            <ProgressBar label="Negotiation" value={dealsStats.negotiation} total={dealsStats.count} color="#3B82F6" />
            <ProgressBar label="Won"         value={dealsStats.won}         total={dealsStats.count} color="#2FA77A" />
            <ProgressBar label="Lost"        value={dealsStats.lost}        total={dealsStats.count} color="#F43F5E" />
          </div>

          <div className="pt-2 border-t border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <BarChart2 size={13} className="text-[#2FA77A]" /> Leads This Week
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Daily breakdown</span>
            </div>
            <MiniBarChart data={weeklyLeads} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-[#2FA77A]" />
              <h3 className="text-sm font-bold text-slate-800">Monthly Goals</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 ml-5">Track your targets</p>
          </div>

          <div className="space-y-4">
            {goals.map((g, i) => <GoalItem key={i} {...g} />)}
          </div>

          <div className="mt-4 rounded-xl bg-[#2FA77A]/8 border border-[#2FA77A]/15 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2FA77A] to-[#3BC08A]">
              <Star size={15} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Performance Score</p>
              <p className="text-[11px] text-slate-500">
                {conversionRate >= 60 ? '🔥 Top performer this month!' : conversionRate >= 30 ? '📈 Good progress, keep going!' : '💪 Let\'s pick up the pace!'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#2FA77A]" />
              <h3 className="text-sm font-bold text-slate-800">Lead Status Overview</h3>
            </div>
            <button onClick={() => navigate('/leads')} className="text-[11px] font-bold text-[#2FA77A] hover:underline">
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'New',       value: leadsStats.new,       color: '#3B82F6', bg: 'bg-blue-50',    text: 'text-blue-600' },
              { label: 'Contacted', value: leadsStats.contacted, color: '#F59E0B', bg: 'bg-amber-50',   text: 'text-amber-600' },
              { label: 'Qualified', value: leadsStats.qualified, color: '#2FA77A', bg: 'bg-emerald-50', text: 'text-[#2FA77A]' },
              { label: 'Lost',      value: leadsStats.lost,      color: '#F43F5E', bg: 'bg-rose-50',    text: 'text-rose-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <Users2 size={14} className={s.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                    <p className="text-xs font-bold text-slate-900">{s.value}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${leadsStats.total > 0 ? (s.value / leadsStats.total) * 100 : 0}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-50 pb-4">
            <h3 className="text-sm font-bold text-slate-800">Quick Access</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Jump to your most used actions</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add New Lead',    icon: Users2,    path: '/leads',  desc: 'Capture a prospect',    color: '#2FA77A' },
              { label: 'Create Deal',     icon: Briefcase, path: '/deals',  desc: 'Open a new deal',        color: '#3B82F6' },
              { label: 'View Pipeline',   icon: BarChart2, path: '/deals',  desc: 'Check deal stages',     color: '#8B5CF6' },
              { label: 'Team Activity',   icon: Activity,  path: '/team',   desc: 'See what team is doing', color: '#F59E0B' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-slate-100 hover:border-[#2FA77A]/25 hover:bg-[#2FA77A]/4 transition-all duration-200 text-left"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${a.color}18`, color: a.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#2FA77A] transition-colors leading-tight">{a.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Clock size={10} /> Today's Summary
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Leads',   val: leadsStats.new },
                { label: 'Deals',   val: dealsStats.count },
                { label: 'Won',     val: dealsStats.won },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-slate-900 leading-none">{s.val}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Udashboard;