import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCompaniesMetrics } from '../services/api';
import {
  Building2, Users, CreditCard, TrendingUp, Activity,
  Bell, Search, ChevronDown, Plus, UserPlus, ShieldCheck,
  BarChart2, CheckCircle2, AlertCircle, Clock, RefreshCw,
  ArrowUpRight, Server, Loader2,
} from 'lucide-react';

const PLAN_PRICE = { free: 0, premium: 2999, enterprise: 9999 };
const LineChart = ({ data }) => {
  const W = 520, H = 180, PAD = { t: 16, r: 16, b: 36, l: 44 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const vals = data.map((d) => d.companies);
  const minV = Math.min(...vals) - 5;
  const maxV = Math.max(...vals) + 5;
  const px = (i) => PAD.l + (i / (data.length - 1)) * iW;
  const py = (v) => PAD.t + iH - ((v - minV) / (maxV - minV)) * iH;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(d.companies).toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L ${px(data.length - 1).toFixed(1)} ${(PAD.t + iH).toFixed(1)} L ${PAD.l.toFixed(1)} ${(PAD.t + iH).toFixed(1)} Z`;
  const yTicks = 4;
  const yStep = (maxV - minV) / yTicks;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2FA77A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2FA77A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2FA77A" />
          <stop offset="100%" stopColor="#3BC08A" />
        </linearGradient>
      </defs>
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const yVal = minV + i * yStep;
        const yPos = py(yVal);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={yPos} x2={PAD.l + iW} y2={yPos} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.l - 8} y={yPos + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(yVal)}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={linePath} fill="none" stroke="url(#strokeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.companies)} r="3.5" fill="#2FA77A" stroke="white" strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.month}</text>
      ))}
    </svg>
  );
};
const PieChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 90, cy = 90, r = 72, gap = 0.02;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const start = angle;
    const sweep = (d.value / total) * (2 * Math.PI) - gap;
    angle += (d.value / total) * (2 * Math.PI);
    return { ...d, start, sweep };
  });
  const arc = ({ start, sweep }) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(start + sweep);
    const y2 = cy + r * Math.sin(start + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  };
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" style={{ width: 160, height: 160, flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r + 6} fill="#f8fafc" />
        {slices.map((s, i) => <path key={i} d={arc(s)} fill={s.color} opacity="0.9" />)}
        <circle cx={cx} cy={cy} r={40} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">TOTAL</text>
      </svg>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <div>
              <p className="text-xs font-semibold text-slate-700">{d.label}</p>
              <p className="text-[11px] text-slate-400">{d.value} companies · {Math.round((d.value / total) * 100)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
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

const MetricCard = ({ icon: Icon, label, value, sub, accent, format = 'number' }) => {
  const animated = useCounter(typeof value === 'number' ? value : 0);
  const display =
    format === 'currency' ? `₹${animated.toLocaleString()}` :
    format === 'percent'  ? `${value}%` :
    animated.toLocaleString();
  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-[28px] font-bold text-slate-900 leading-none font-mono">{display}</p>
        {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
      </div>
      <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${accent}18`, color: accent }}>
        <Icon size={20} />
      </div>
    </div>
  );
};

const HealthCard = () => (
  <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start justify-between gap-3">
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">System Health</p>
      <p className="text-[28px] font-bold text-slate-900 leading-none font-mono">99.9%</p>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2FA77A] animate-pulse" />
        <p className="text-xs text-[#2FA77A] font-semibold">All systems operational</p>
      </div>
    </div>
    <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2FA77A]/10 text-[#2FA77A] group-hover:scale-110 transition-transform duration-300">
      <Server size={20} />
    </div>
  </div>
);

const tagStyle = {
  Company:      'bg-[#2FA77A]/10 text-[#2FA77A]',
  User:         'bg-blue-50 text-blue-600',
  Subscription: 'bg-purple-50 text-purple-600',
};

const QuickAction = ({ icon: Icon, label, desc, onClick }) => (
  <button onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-[#2FA77A]/30 hover:bg-[#2FA77A]/5 transition-all duration-200 group text-left">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2FA77A] to-[#3BC08A] text-white shadow-sm shadow-[#2FA77A]/25 group-hover:shadow-md group-hover:shadow-[#2FA77A]/30 transition-shadow">
      <Icon size={16} />
    </div>
    <div className="overflow-hidden">
      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#2FA77A] transition-colors truncate">{label}</p>
      <p className="text-[11px] text-slate-400 truncate">{desc}</p>
    </div>
    <ArrowUpRight size={14} className="ml-auto flex-shrink-0 text-slate-300 group-hover:text-[#2FA77A] transition-colors" />
  </button>
);
const Header = ({ user, onRefresh, refreshing }) => {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 sticky top-0 z-20">
      <div>
        <h1 className="text-[15px] font-bold text-slate-900 leading-none">
          Welcome back, <span className="text-[#2FA77A]">Super Admin</span> 👋
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-56 focus-within:border-[#2FA77A]/50 focus-within:ring-2 focus-within:ring-[#2FA77A]/10 transition-all">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Search companies, users…" className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full" />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2FA77A] border-2 border-white" />
        </button>

        <button
          onClick={onRefresh}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#2FA77A] hover:border-[#2FA77A]/30 transition-all"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#2FA77A]' : ''} />
        </button>

        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 hover:border-[#2FA77A]/30 transition-all">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#2FA77A] to-[#3BC08A] text-white text-[10px] font-bold uppercase">
              {user?.name?.[0] ?? 'S'}
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[80px] truncate">
              {user?.name ?? 'Super Admin'}
            </span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-30">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name ?? 'Super Admin'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email ?? ''}</p>
              </div>
              {['Profile Settings', 'Platform Settings', 'Sign Out'].map((item) => (
                <button key={item}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                    item === 'Sign Out' ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Sdashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics]       = useState(null);   // real data
  const [companies, setCompanies]   = useState([]);     // real companies array
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);

  const buildGrowthData = (companiesList) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const year = now.getFullYear();
    const monthlyCounts = Array(12).fill(0);
    companiesList.forEach(c => {
      const d = new Date(c.createdAt);
      if (d.getFullYear() === year) {
        monthlyCounts[d.getMonth()]++;
      }
    });

    let cumulative = 0;
    return months.map((month, i) => {
      cumulative += monthlyCounts[i];
      return { month, companies: cumulative };
    }).filter((_, i) => i <= now.getMonth()); // only up to current month
  };

  const buildPieData = (companiesList) => {
    const premium    = companiesList.filter(c => c.subscription === 'premium').length;
    const enterprise = companiesList.filter(c => c.subscription === 'enterprise').length;
    const free       = companiesList.filter(c => c.subscription === 'free').length;
    return [
      { label: 'Premium',    value: premium    || 0, color: '#2FA77A' },
      { label: 'Enterprise', value: enterprise || 0, color: '#8B5CF6' },
      { label: 'Free',       value: free       || 0, color: '#94a3b8' },
    ].filter(d => d.value > 0); 
  };

  const loadData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const res = await getCompaniesMetrics();
      const agg  = res?.data?.data?.aggregates  ?? {};
      const list = res?.data?.data?.companies   ?? [];
      const mrr = list.reduce((sum, c) => sum + (PLAN_PRICE[c.subscription] ?? 0), 0);

      setMetrics({
        totalCompanies:      agg.totalCompanies ?? list.length,
        totalUsers:          agg.totalUsers     ?? 0,
        paidSubscriptions:   list.filter(c => c.subscription !== 'free').length,
        monthlyRevenue:      mrr,
      });
      setCompanies(list);

    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#2FA77A] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-rose-500">
          <AlertCircle size={28} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => loadData()}
            className="mt-1 px-4 py-2 rounded-xl bg-[#2FA77A] text-white text-xs font-semibold hover:bg-[#2a956d] transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const growthData = buildGrowthData(companies);
  const pieData    = buildPieData(companies);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-y-auto">
      <Header user={user} onRefresh={() => loadData(true)} refreshing={refreshing} />

      <main className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Metrics</h2>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2FA77A] bg-[#2FA77A]/8 px-3 py-1 rounded-full">
              <Activity size={11} /> Live data
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
            <MetricCard
              icon={Building2} label="Total Companies"
              value={metrics.totalCompanies}
              sub="All registered tenants"
              accent="#2FA77A"
            />
            <MetricCard
              icon={Users} label="Total Users"
              value={metrics.totalUsers}
              sub="Across all tenants"
              accent="#3B82F6"
            />
            <MetricCard
              icon={CreditCard} label="Paid Subscriptions"
              value={metrics.paidSubscriptions}
              sub={`of ${metrics.totalCompanies} companies`}
              accent="#8B5CF6"
            />
            <MetricCard
              icon={TrendingUp} label="Monthly Revenue"
              value={metrics.monthlyRevenue}
              sub="From paid plans"
              accent="#F59E0B"
              format="currency"
            />
            <HealthCard />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Company Growth — {new Date().getFullYear()}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Cumulative companies registered this year</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2FA77A]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#2FA77A]" />
                Companies
              </div>
            </div>
            {growthData.length >= 2
              ? <LineChart data={growthData} />
              : (
                <div className="flex items-center justify-center h-[180px] text-slate-400 text-xs">
                  Not enough data to plot growth yet
                </div>
              )
            }
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Subscription Breakdown</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">By plan type</p>
            </div>

            {pieData.length > 0
              ? <PieChart data={pieData} />
              : (
                <div className="flex items-center justify-center h-[160px] text-slate-400 text-xs">
                  No subscription data yet
                </div>
              )
            }

            {pieData.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                {pieData.map((d) => (
                  <div key={d.label} className="text-center">
                    <p className="text-base font-bold text-slate-800">{d.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{d.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#2FA77A]" />
                <h3 className="text-sm font-bold text-slate-800">Recently Added Companies</h3>
              </div>
              <button
                onClick={() => navigate('/companies')}
                className="text-[11px] font-bold text-[#2FA77A] hover:underline"
              >
                View all →
              </button>
            </div>

            <ul className="space-y-0 divide-y divide-slate-50">
              {companies.length === 0 ? (
                <li className="py-8 text-center text-slate-400 text-sm">No companies yet</li>
              ) : (
                [...companies]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 7)
                  .map((c) => {
                    const planColor =
                      c.subscription === 'enterprise' ? '#8B5CF6' :
                      c.subscription === 'premium'    ? '#2FA77A' : '#94a3b8';
                    const planBg =
                      c.subscription === 'enterprise' ? 'bg-violet-50 text-violet-600' :
                      c.subscription === 'premium'    ? 'bg-[#2FA77A]/10 text-[#2FA77A]' :
                      'bg-slate-100 text-slate-500';

                    return (
                      <li key={c.id} className="flex items-center gap-3 py-3 group">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:border-[#2FA77A]/20 group-hover:text-[#2FA77A] transition-colors">
                          <Building2 size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 font-semibold leading-snug truncate">{c.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${planBg}`}>
                              {c.subscription}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Users size={10} /> {c.metrics?.users ?? 0} users
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })
              )}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Common admin operations</p>
            </div>
            <div className="space-y-2.5">
              <QuickAction icon={Plus}       label="Create Company"     desc="Register a new tenant"        onClick={() => navigate('/companies')} />
              <QuickAction icon={UserPlus}   label="Add Admin"          desc="Create a company admin"       onClick={() => navigate('/users')} />
              <QuickAction icon={ShieldCheck} label="Manage Users"      desc="View all users & roles"       onClick={() => navigate('/users')} />
              <QuickAction icon={BarChart2}  label="Subscriptions"      desc="View & manage plans"          onClick={() => navigate('/subscriptions')} />
            </div>

            <div className="mt-4 rounded-xl bg-[#2FA77A]/8 border border-[#2FA77A]/15 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-[#2FA77A]" />
                <p className="text-xs font-bold text-[#2FA77A]">Platform Status</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'API Server',   ok: true },
                  { label: 'Database',     ok: true },
                  { label: 'Auth Service', ok: true },
                  { label: 'File Storage', ok: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{s.label}</span>
                    <span className={`font-bold flex items-center gap-1 ${s.ok ? 'text-[#2FA77A]' : 'text-rose-500'}`}>
                      {s.ok ? <><CheckCircle2 size={10} /> Operational</> : <><AlertCircle size={10} /> Degraded</>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Sdashboard;