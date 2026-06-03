import React, { useState, useEffect } from 'react';
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
   Building2 
} from 'lucide-react';

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

      const lStats = {
        total: leads.length,
        new: 0,
        contacted: 0,
        qualified: 0,
        lost: 0,
      };

      leads.forEach((l) => {
        if (l.status === 'new') lStats.new++;
        else if (l.status === 'contacted') lStats.contacted++;
        else if (l.status === 'qualified') lStats.qualified++;
        else if (l.status === 'lost') lStats.lost++;
      });

      setLeadsStats(lStats);

      const dStats = {
        totalVal: 0,
        wonVal: 0,
        count: deals.length,
        proposal: 0,
        negotiation: 0,
        won: 0,
        lost: 0,
      };

      deals.forEach((d) => {
        const value = Number(d.value) || 0;

        dStats.totalVal += value;

        if (d.stage === 'proposal') dStats.proposal++;
        else if (d.stage === 'negotiation') dStats.negotiation++;
        else if (d.stage === 'won') {
          dStats.won++;
          dStats.wonVal += value;
        } else if (d.stage === 'lost') {
          dStats.lost++;
        }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
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
  <div className="mt-4 md:mt-0 flex items-center space-x-2 ...">
          <Clock size={14} className="text-slate-400" />
          <span>Workspace updated real-time</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}
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
                            <span className="font-normal text-slate-500">
                              &mdash; {act.details}
                            </span>
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
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Proposal</span>
                <span className="text-slate-900 font-bold">{dealsStats.proposal} deals</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${dealsStats.count > 0 ? (dealsStats.proposal / dealsStats.count) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Negotiation</span>
                <span className="text-slate-900 font-bold">{dealsStats.negotiation} deals</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${dealsStats.count > 0 ? (dealsStats.negotiation / dealsStats.count) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Won</span>
                <span className="text-slate-900 font-bold text-brand-light">{dealsStats.won} deals</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-light transition-all duration-500" style={{ width: `${dealsStats.count > 0 ? (dealsStats.won / dealsStats.count) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Lost</span>
                <span className="text-slate-900 font-bold text-rose-500">{dealsStats.lost} deals</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-rose-500 transition-all duration-500" style={{ width: `${dealsStats.count > 0 ? (dealsStats.lost / dealsStats.count) * 100 : 0}%` }} />
              </div>
            </div>
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