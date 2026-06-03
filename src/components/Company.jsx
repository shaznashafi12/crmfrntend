import React, { useState, useEffect } from 'react';
import * as API from '../services/api.js';
import Modal from '../components/Modal.jsx';
import {
  Plus, Building2, Users, Layers, Coins,
  Activity, User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, Copy, Check, Shield
} from 'lucide-react';

const getSubBadgeStyles = (sub) => {
  switch (sub?.toLowerCase()) {
    case 'premium':return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'enterprise': return 'bg-purple-50 text-purple-700 border-purple-200';
    default:return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};
const CredentialCard = ({ credentials, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Company: ${credentials.companyName}\nAdmin Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Company Created!</h3>
            <p className="text-xs text-slate-400">Share these credentials with the admin</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-sans font-bold uppercase tracking-wider">Company</span>
            <span className="font-semibold text-slate-700">{credentials.companyName}</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-sans font-bold uppercase tracking-wider">Admin Email</span>
            <span className="font-semibold text-slate-700">{credentials.email}</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-sans font-bold uppercase tracking-wider">Password</span>
            <span className="font-semibold text-[#2FA77A]">{credentials.password}</span>
          </div>
        </div>

        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
          ⚠ Copy and share these credentials now. The password won't be shown again.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? <><Check size={14} className="text-emerald-500" /> Copied!</> : <><Copy size={14} /> Copy All</>}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] text-white text-sm font-bold shadow hover:brightness-105 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        className={`block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white transition-colors ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
        {...props}
      />
    </div>
  </div>
);

const Company = () => {
  const [companiesList, setCompaniesList] = useState([]);
  const [aggregates, setAggregates]= useState({ totalCompanies: 0, totalUsers: 0, totalLeads: 0, totalDeals: 0 });
  const [loading, setLoading]= useState(true);
  const [error, setError]= useState('');

  const [isAddOpen, setIsAddOpen]= useState(false);
  const [actionLoading, setActionLoading]= useState(false);
  const [formError, setFormError]= useState('');
  const [showPass, setShowPass]= useState(false);
  const [credentials, setCredentials]= useState(null);

  const [form, setForm]=useState({
    companyName: '',
    subscription: 'free',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  useEffect(() => { fetchMetrics(); }, []);
  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.getCompaniesMetrics();
      if (response.data?.success) {
        const { aggregates: aggs, companies } = response.data.data;
        setAggregates(aggs);
        setCompaniesList(companies);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load company data. Please make sure you are logged in as Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({ companyName: '', subscription: 'free', adminName: '', adminEmail: '', adminPassword: '' });
    setFormError('');
    setShowPass(false);
    setIsAddOpen(true);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    const { companyName, subscription, adminName, adminEmail, adminPassword } = form;

    if (!companyName.trim()) return setFormError('Company name is required.');
    if (!adminName.trim())  return setFormError('Admin name is required.');
    if (!adminEmail.trim()) return setFormError('Admin email is required.');
    if (adminPassword.length < 6) return setFormError('Password must be at least 6 characters.');

    setActionLoading(true);
    try {
      const compRes = await API.createCompany({ name: companyName, subscription });
const companyId = compRes.data?.data?._id?.toString();
      if (!companyId) throw new Error('Company was created but no ID was returned.');
      await API.createAdminForCompany({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        companyId,  
          });
      setIsAddOpen(false);
      setCredentials({ companyName, email: adminEmail, password: adminPassword });
      fetchMetrics();
     } catch (err) {
      console.error(err);
      setFormError(
        err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubscription = async (companyId, newSub) => {
    try {
      const res = await API.updateCompanySubscription(companyId, { subscription: newSub });
      if (res.data?.success) {
        setCompaniesList(prev =>
          prev.map(c => c.id === companyId ? { ...c, subscription: newSub } : c)
        );
      }
    } catch (err) {
      setError('Failed to update subscription plan. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Platform Administration</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">Companies</h1>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#2FA77A]/30 hover:brightness-105 active:scale-[0.98] transition-all w-fit"
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      {/* error banner */}
      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FA77A] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Companies', value: aggregates.totalCompanies, Icon: Building2 },
              { label: 'Total Users',     value: aggregates.totalUsers,     Icon: Users     },
              { label: 'Total Leads',     value: aggregates.totalLeads,     Icon: Layers    },
              { label: 'Total Deals',     value: aggregates.totalDeals,     Icon: Coins     },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-white p-5 border border-slate-100 shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{value}</h3>
                </div>
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <Icon size={18} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-2">
              <Activity size={16} className="text-[#2FA77A]" />
              <h3 className="font-semibold text-slate-800 text-sm">Company List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {['Company Name', 'Users', 'Leads', 'Deals', 'Subscription Plan', 'Created Date'].map(h => (
                      <th key={h} className="py-3.5 px-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {companiesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No companies yet. Click "Add Company" to get started.
                      </td>
                    </tr>
                  ) : companiesList.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-[#2FA77A]/10 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-[#2FA77A]" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{comp.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{comp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{comp.metrics?.users || 0}</td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{comp.metrics?.leads || 0}</td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{comp.metrics?.deals || 0}</td>
                      <td className="py-4 px-6">
                        <select
                          value={comp.subscription}
                          onChange={(e) => handleUpdateSubscription(comp.id, e.target.value)}
                          className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 outline-none capitalize cursor-pointer ${getSubBadgeStyles(comp.subscription)}`}
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {comp.createdAt
                          ? new Date(comp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Company">
        <form onSubmit={handleCreate} className="space-y-5">

          {formError && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Building2 size={14} className="text-[#2FA77A]" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Details</p>
            </div>

            <Field
              label="Company Name"
              icon={Building2}
              type="text"
              placeholder="e.g. BrightWave Technologies"
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Subscription Plan
              </label>
              <select
                value={form.subscription}
                onChange={e => setForm({ ...form, subscription: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 font-semibold outline-none focus:border-[#2FA77A] focus:bg-white transition-colors"
              >
                <option value="free">Free Tier</option>
                <option value="premium">Premium Tier</option>
                <option value="enterprise">Enterprise Tier</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Shield size={14} className="text-[#2FA77A]" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Account</p>
              <span className="text-[10px] text-slate-400 font-medium">(credentials to share with admin)</span>
            </div>
          <Field
              label="Admin Full Name"
              icon={User}
              type="text"
              placeholder="e.g. Arjun Menon"
              value={form.adminName}
              onChange={e => setForm({ ...form, adminName: e.target.value })}
              required
            />

            <Field
              label="Admin Email"
              icon={Mail}
              type="email"
              placeholder="e.g. arjun@brightwave.io"
              value={form.adminEmail}
              onChange={e => setForm({ ...form, adminEmail: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="min. 6 characters"
                  value={form.adminPassword}
                  onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                  required
                  minLength={6}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] text-white rounded-xl shadow font-bold hover:brightness-105 active:scale-95 text-sm disabled:opacity-50 transition-all"
            >
              {actionLoading ? 'Adding...' : 'Add Company & Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {credentials && (
        <CredentialCard
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
};

export default Company;