import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';
import * as API from '../services/api.js';
import { 
  Users2, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Activity,
  Building2,
  Pencil,
  X,
  Check,
  User,
} from 'lucide-react';

// ── Small inline profile pill + edit popover ──────────────────────────────────
const ProfileWidget = ({ user }) => {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState(user?.name ?? '');
  const [email, setEmail]     = useState(user?.email ?? '');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const ref = useRef(null);
const { updateUser } = useAuth();
  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSave = async () => {
  if (!name.trim()) {
    setError('Name cannot be empty');
    return;
  }

  setSaving(true);
  setError('');

  try {
    const res = await API.updateProfile({
      name: name.trim(),
    });

    const updatedUser = res?.data?.data;

    updateUser(updatedUser);

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1000);

  } catch (err) {
    setError(err?.response?.data?.message || 'Update failed');
  } finally {
    setSaving(false);
  }
};

  const initial = (user?.name?.[0] ?? 'U').toUpperCase();

  return (
    <div className="relative" ref={ref}>

      {/* ── Pill trigger ── */}
      <button
        onClick={() => { setOpen(v => !v); setError(''); setSaved(false); }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-all group"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#2FA77A]/30 to-[#3BC08A]/20 text-[#2FA77A] text-[10px] font-bold uppercase border border-[#2FA77A]/20">
          {initial}
        </div>
        <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate">{user?.name ?? 'User'}</span>
        <Pencil size={11} className="text-slate-400 group-hover:text-[#2FA77A] transition-colors flex-shrink-0" />
      </button>

      {/* ── Edit popover ── */}
      {open && (
       <div className="absolute left-1/2 -translate-x-[40%] md:left-auto md:translate-x-0 md:right-0 top-full mt-2 w-64 max-w-[95vw] bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/60 z-50 p-4 space-y-3">

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-50">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-[#2FA77A]" />
              <p className="text-xs font-bold text-slate-700">Edit Profile</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex justify-center py-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2FA77A]/30 to-[#3BC08A]/20 text-[#2FA77A] text-lg font-bold uppercase border-2 border-[#2FA77A]/20">
              {initial}
            </div>
          </div>

          {/* Name field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium outline-none focus:border-[#2FA77A]/40 focus:bg-white transition-all"
              placeholder="Your name"
            />
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
           <input
  value={email}
  type="email"
  disabled
  className="w-full bg-slate-100 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-400 font-medium cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>
          <p className="text-[10px] text-slate-400">
  Email is managed by Super Admin
</p>

          {/* Role badge (read-only) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2FA77A]/10 text-[#2FA77A] capitalize border border-[#2FA77A]/20">
              {user?.role ?? 'user'}
            </span>
          </div>

          {/* Error */}
          {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              saved
                ? 'bg-emerald-50 text-[#2FA77A] border border-[#2FA77A]/20'
                : 'bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] text-white hover:opacity-90'
            } disabled:opacity-60`}
          >
            {saved ? (
              <><Check size={12} /> Saved!</>
            ) : saving ? (
              'Saving...'
            ) : (
              <><Check size={12} /> Save Changes</>
            )}
          </button>

        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [leadsStats, setLeadsStats] = useState({ total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 });
  const [dealsStats, setDealsStats] = useState({ totalVal: 0, wonVal: 0, count: 0, proposal: 0, negotiation: 0, won: 0, lost: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyInfo, setCompanyInfo] = useState({ name: '', subscription: '' });

  useEffect(() => {
    if (isSuperAdmin) {
      navigate('/companies');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [leadsRes, dealsRes] = await Promise.all([
          API.getLeads(),
          API.getDeals(),
        ]);

        try {
          const companyRes = await API.getMyCompany();
          const c = companyRes?.data?.data;
          if (c) setCompanyInfo({ name: c.name, subscription: c.subscription });
        } catch (_) {}

        const leads = Array.isArray(leadsRes?.data?.data)
          ? leadsRes.data.data
          : Array.isArray(leadsRes?.data?.leads)
            ? leadsRes.data.leads
            : Array.isArray(leadsRes?.data)
              ? leadsRes.data
              : [];

        const deals = Array.isArray(dealsRes?.data?.data)
          ? dealsRes.data.data
          : Array.isArray(dealsRes?.data?.deals)
            ? dealsRes.data.deals
            : Array.isArray(dealsRes?.data)
              ? dealsRes.data
              : [];

        const lStats = { total: leads.length, new: 0, contacted: 0, qualified: 0, lost: 0 };
        leads.forEach((l) => {
          if (l.status === 'new') lStats.new++;
          else if (l.status === 'contacted') lStats.contacted++;
          else if (l.status === 'qualified') lStats.qualified++;
          else if (l.status === 'lost') lStats.lost++;
        });
        setLeadsStats(lStats);

        const dStats = { totalVal: 0, wonVal: 0, count: deals.length, proposal: 0, negotiation: 0, won: 0, lost: 0 };
        deals.forEach((d) => {
          const value = Number(d.value) || 0;
          dStats.totalVal += value;
          if (d.stage === 'proposal') dStats.proposal++;
          else if (d.stage === 'negotiation') dStats.negotiation++;
          else if (d.stage === 'won') { dStats.won++; dStats.wonVal += value; }
          else if (d.stage === 'lost') { dStats.lost++; }
        });
        setDealsStats(dStats);

        setActivities([]);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Error loading dashboard analytics. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSuperAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-transparent"></div>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">

      {/* ── HERO HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-6 border border-slate-100 shadow-soft gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Here is what is happening with your organization's sales metrics today.
          </p>
          {companyInfo.name && (
            <div className="mt-3 flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                <Building2 size={13} className="text-brand-light" />
                <span>{companyInfo.name}</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border capitalize
                ${companyInfo.subscription === 'enterprise' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                  companyInfo.subscription === 'premium'    ? 'bg-amber-50  text-amber-700  border-amber-100'  :
                                                              'bg-slate-50  text-slate-600  border-slate-100'}`}>
                {companyInfo.subscription}
              </span>
            </div>
          )}
        </div>

        {/* Right side — profile pill + timestamp */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* ← Profile pill */}
          <ProfileWidget user={user} />

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <Clock size={14} className="text-slate-400" />
            <span>Workspace updated real-time</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-premium transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">{leadsStats.total}</h3>
            <div className="text-xs text-slate-400 font-medium">
              <span className="text-brand-light font-bold">{leadsStats.new} new</span> this week
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-brand-light">
            <Users2 size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-premium transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Value</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">
              ${dealsStats.totalVal.toLocaleString()}
            </h3>
            <div className="text-xs text-slate-400 font-medium">
              Across <span className="text-brand-light font-bold">{dealsStats.count} deals</span> in progress
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-premium transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Won Sales</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">
              ${dealsStats.wonVal.toLocaleString()}
            </h3>
            <div className="text-xs text-slate-400 font-medium">
              Conversion rate:{' '}
              <span className="text-brand-light font-bold">
                {dealsStats.count > 0 ? Math.round((dealsStats.won / dealsStats.count) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light/10 text-brand-light">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* ── ACTIVITY + PIPELINE ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center space-x-2">
              <Activity size={18} className="text-brand-light" />
              <h3 className="text-base font-bold text-slate-800">Recent Workspace Activities</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Recent 50 logs</span>
          </div>
          <div className="flow-root overflow-y-auto max-h-96 pr-2">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock size={36} className="text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold">No recent activity logs</p>
                <p className="text-xs text-slate-400 mt-1">Actions you take will appear here in real-time.</p>
              </div>
            ) : (
              <ul className="-mb-8">
                {activities.map((act, index) => (
                  <li key={act._id}>
                    <div className="relative pb-8">
                      {index !== activities.length - 1 && (
                        <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 font-semibold text-xs shadow-inner">
                            {act.action?.[0] || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-sm font-semibold text-slate-800">
                            {act.action}{' '}
                            <span className="font-normal text-slate-500">&mdash; {act.details}</span>
                          </p>
                          <div className="flex items-center space-x-2 mt-1 text-[11px] font-medium text-slate-400">
                            <span className="font-bold text-slate-500">{act.userId?.name || 'Agent'}</span>
                            <span>&bull;</span>
                            <span>{formatTime(act.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-6">
          <div className="border-b border-slate-50 pb-4">
            <h3 className="text-base font-bold text-slate-800">Sales Pipeline Stages</h3>
            <p className="text-xs text-slate-400 mt-0.5">Summary by stage count</p>
          </div>
          <div className="space-y-5">
            {[
              { label: 'Proposal',    value: dealsStats.proposal,    color: 'bg-amber-400' },
              { label: 'Negotiation', value: dealsStats.negotiation, color: 'bg-sky-500' },
              { label: 'Won',         value: dealsStats.won,         color: 'bg-brand-light', textColor: 'text-brand-light' },
              { label: 'Lost',        value: dealsStats.lost,        color: 'bg-rose-500',    textColor: 'text-rose-500' },
            ].map(s => (
              <div key={s.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">{s.label}</span>
                  <span className={`text-slate-900 font-bold ${s.textColor ?? ''}`}>{s.value} deals</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                    style={{ width: `${dealsStats.count > 0 ? (s.value / dealsStats.count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4 mt-6">
            <button
              onClick={() => navigate('/deals')}
              className="flex w-full items-center justify-center space-x-2 text-xs font-bold text-brand-light hover:text-brand-dark transition-colors py-2 border border-brand-light/20 hover:border-brand-light rounded-xl hover:bg-brand-light/5"
            >
              <span>Manage Pipeline Board</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;