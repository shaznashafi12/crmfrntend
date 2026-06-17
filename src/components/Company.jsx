import React, { useState, useEffect } from 'react';
import * as API from '../services/api.js';
import Modal from '../components/Modal.jsx';
import {
  Plus, Building2, Users, Layers, Coins,
  Activity, User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, Copy, Check, Shield,
  Trash2, X, Save, Edit3, Loader2, AlertCircle
} from 'lucide-react';

const getSubBadgeStyles = (sub) => {
  switch (sub?.toLowerCase()) {
    case 'premium':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'enterprise': return 'bg-purple-50 text-purple-700 border-purple-200';
    default:           return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

/* ── Shared backdrop ── */
const Backdrop = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
);

/* ── Credential Card ── */
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
          <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            {copied ? <><Check size={14} className="text-emerald-500" /> Copied!</> : <><Copy size={14} /> Copy All</>}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] text-white text-sm font-bold shadow hover:brightness-105 transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Field ── */
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

/* ── View Modal ── */
const ViewModal = ({ company, onClose }) => {
  if (!company) return null;
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Company Details</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2FA77A] to-[#3BC08A] flex items-center justify-center text-white text-xl font-bold uppercase shadow-md shadow-[#2FA77A]/20">
                {company.name?.[0] ?? 'C'}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-tight">{company.name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{company.id}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Users',        value: company.metrics?.users ?? 0 },
                { label: 'Leads',        value: company.metrics?.leads ?? 0 },
                { label: 'Deals',        value: company.metrics?.deals ?? 0 },
                { label: 'Subscription', value: <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border ${getSubBadgeStyles(company.subscription)}`}>{company.subscription}</span> },
                { label: 'Created',      value: company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <div className="text-sm font-medium text-slate-700">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Edit Modal ── */
const EditModal = ({ company, onClose, onSave }) => {
  const [form, setForm]     = useState({ name: company.name, subscription: company.subscription ?? 'free' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Company name is required.'); return; }
    try {
      setSaving(true);
      setErr('');
      await onSave(company.id, form);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!company) return null;
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Edit Company</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {err && (
              <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={13} /> {err}
              </div>
            )}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Company Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2FA77A]/50 focus:ring-2 focus:ring-[#2FA77A]/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Subscription Plan</label>
              <div className="flex gap-2">
                {['free', 'premium', 'enterprise'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, subscription: s }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                      form.subscription === s
                        ? 'bg-[#2FA77A] text-white border-[#2FA77A] shadow-sm shadow-[#2FA77A]/30'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#2FA77A]/30">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Delete Modal ── */
const DeleteModal = ({ company, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setErr('');
      await onConfirm(company.id);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to delete. Please try again.');
      setDeleting(false);
    }
  };

  if (!company) return null;
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Delete Company</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl mb-4">
              <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={14} className="text-rose-500" />
              </div>
              <p className="text-sm text-rose-700 font-medium leading-snug">
                This action is permanent and cannot be undone.
              </p>
            </div>
            <p className="text-sm text-slate-600 text-center">
              Are you sure you want to delete{' '}
              <span className="font-bold text-slate-900">{company.name}</span>?
              All associated users, leads, and deals will be permanently removed.
            </p>
            {err && (
              <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 mt-3">
                <AlertCircle size={13} /> {err}
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-[#2FA77A]  hover:bg-[#2FA77A]/70 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Main Component ── */
const Company = () => {
  const [companiesList, setCompaniesList] = useState([]);
  const [aggregates, setAggregates]       = useState({ totalCompanies: 0, totalUsers: 0, totalLeads: 0, totalDeals: 0 });
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const [isAddOpen, setIsAddOpen]         = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError]         = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [credentials, setCredentials]     = useState(null);

  const [viewCompany, setViewCompany]     = useState(null);
  const [editCompany, setEditCompany]     = useState(null);
  const [deleteCompany, setDeleteCompany] = useState(null);

  const [form, setForm] = useState({
    companyName: '', subscription: 'free',
    adminName: '', adminEmail: '', adminPassword: '',
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
        // ✅ Normalize id to string to avoid ObjectId issues
        setCompaniesList(companies.map(c => ({ ...c, id: c.id?.toString() })));
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
    if (!adminName.trim())   return setFormError('Admin name is required.');
    if (!adminEmail.trim())  return setFormError('Admin email is required.');
    if (adminPassword.length < 6) return setFormError('Password must be at least 6 characters.');
    setActionLoading(true);
    try {
      const compRes = await API.createCompany({ name: companyName, subscription });
      const companyId = compRes.data?.data?._id?.toString();
      if (!companyId) throw new Error('Company was created but no ID was returned.');
      await API.createAdminForCompany({ name: adminName, email: adminEmail, password: adminPassword, companyId });
      setIsAddOpen(false);
      setCredentials({ companyName, email: adminEmail, password: adminPassword });
      fetchMetrics();
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubscription = async (companyId, newSub) => {
    try {
      const res = await API.updateCompanySubscription(companyId, { subscription: newSub });
      if (res.data?.success) {
        setCompaniesList(prev => prev.map(c => c.id === companyId ? { ...c, subscription: newSub } : c));
      }
    } catch (err) {
      setError('Failed to update subscription plan. Please try again.');
    }
  };

  const handleEditSave = async (companyId, updates) => {
    // ✅ Ensure id is a plain string before sending to API
    const id = companyId?.toString();
    const res = await API.updateCompany(id, updates);
    if (res.data?.success) {
      setCompaniesList(prev =>
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );
      // ✅ Also update the editCompany state so modal reflects new values
      setEditCompany(prev => prev ? { ...prev, ...updates } : null);
    }
    fetchMetrics();
  };

  const handleDelete = async (companyId) => {
    // ✅ Ensure id is a plain string before sending to API
    const id = companyId?.toString();
    await API.deleteCompany(id);
    setCompaniesList(prev => prev.filter(c => c.id !== id));
    fetchMetrics();
  };

  return (
    <>
      {viewCompany   && <ViewModal   company={viewCompany}   onClose={() => setViewCompany(null)} />}
      {editCompany   && <EditModal   company={editCompany}   onClose={() => setEditCompany(null)}   onSave={handleEditSave} />}
      {deleteCompany && <DeleteModal company={deleteCompany} onClose={() => setDeleteCompany(null)} onConfirm={handleDelete} />}

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
            {/* Stats */}
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

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex items-center gap-2">
                <Activity size={16} className="text-[#2FA77A]" />
                <h3 className="font-semibold text-slate-800 text-sm">Company List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {['Company Name', 'Users', 'Leads', 'Deals', 'Subscription Plan', 'Created Date', 'Actions'].map(h => (
                        <th key={h} className="py-3.5 px-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {companiesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          No companies yet. Click "Add Company" to get started.
                        </td>
                      </tr>
                    ) : companiesList.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors group">

                        {/* Company Name */}
                        <td className="py-3.5 px-5">
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

                        <td className="py-3.5 px-5 font-semibold text-slate-700">{comp.metrics?.users || 0}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-700">{comp.metrics?.leads || 0}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-700">{comp.metrics?.deals || 0}</td>

                        {/* Subscription inline dropdown */}
                        <td className="py-3.5 px-5">
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

                        {/* Created Date */}
                        <td className="py-3.5 px-5 text-xs text-slate-400">
                          {comp.createdAt
                            ? new Date(comp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>

                        {/* Actions — right side, hover reveal */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setViewCompany(comp)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                              title="View"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setEditCompany(comp)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#2FA77A] transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteCompany(comp)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* footer */}
              <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{companiesList.length}</span> companies
                </p>
              </div>
            </div>
          </>
        )}

        {/* Add Company Modal */}
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subscription Plan</label>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Admin Password</label>
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
          <CredentialCard credentials={credentials} onClose={() => setCredentials(null)} />
        )}
      </div>
    </>
  );
};

export default Company;