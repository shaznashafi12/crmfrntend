import React, { useState, useEffect } from 'react';
import * as API from '../services/api.js';
import Modal from '../components/Modal.jsx';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users2,
} from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formValue, setFormValue] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('new');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter]);

  const fetchLeads = async (searchOverride = null) => {
    setLoading(true);
    setError('');
    const term = searchOverride !== null ? searchOverride : search;
    try {
      const response = await API.getLeads({
        page,
        limit: 10,
        search: term,
        status: statusFilter,
      });
      if (response.data?.success) {
        setLeads(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalLeads(response.data.totalLeads || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve leads list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    fetchLeads('');
  };
  const openAddModal = () => {
    setFormTitle('');
    setFormContactName('');
    setFormContactEmail('');
    setFormValue(0);
    setFormNotes('');
    setFormStatus('new');
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormTitle(lead.title);
    setFormContactName(lead.contactName);
    setFormContactEmail(lead.contactEmail);
    setFormValue(lead.value);
    setFormNotes(lead.notes || '');
    setFormStatus(lead.status);
    setFormError('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (lead) => {
    setSelectedLead(lead);
    setIsDeleteOpen(true);
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle || !formContactName || !formContactEmail) {
      setFormError('Please fill in title, name, and email fields.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await API.createLead({
        title: formTitle,
        contactName: formContactName,
        contactEmail: formContactEmail,
        value: Number(formValue),
        notes: formNotes,
      });
      if (res.data?.success) {
        setIsAddOpen(false);
        fetchLeads();
      } else {
        setFormError(res.data?.message || 'Error creating lead');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error creating lead');
    } finally {
      setActionLoading(false);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle || !formContactName || !formContactEmail) {
      setFormError('Please fill in title, name, and email fields.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await API.updateLead(selectedLead._id, {
        title: formTitle,
        contactName: formContactName,
        contactEmail: formContactEmail,
        value: Number(formValue),
        status: formStatus,
        notes: formNotes,
      });
      if (res.data?.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l._id === selectedLead._id
              ? {
                  ...l,
                  title: formTitle,
                  contactName: formContactName,
                  contactEmail: formContactEmail,
                  value: Number(formValue),
                  status: formStatus,
                  notes: formNotes,
                }
              : l
          )
        );
        setIsEditOpen(false);
      } else {
        setFormError(res.data?.message || 'Error updating lead');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error updating lead');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await API.deleteLead(selectedLead._id);
      if (res.data?.success) {
        setLeads((prev) => prev.filter((l) => l._id !== selectedLead._id));
        setIsDeleteOpen(false);
        setSelectedLead(null);
        if (leads.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
      } else {
        setError(res.data?.message || 'Error removing lead record.');
      }
    } catch (err) {
      console.error(err);
      setError('Error removing lead record.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleConvertToDeal = async (lead) => {
    setError('');
    try {
      const res = await API.convertLead(lead._id);
      if (res.data?.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l._id === lead._id ? { ...l, status: 'qualified' } : l
          )
        );
        window.dispatchEvent(new Event('refresh-deals'));
      } else {
        setError(res.data?.message || 'Conversion failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to convert lead into deal');
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':       return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'contacted': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'qualified': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'lost':      return 'bg-rose-50 text-rose-700 border-rose-100';
      default:          return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Leads Directory</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">Manage Leads</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 rounded-xl bg-[#2FA77A] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] w-fit"
        >
          <Plus size={16} />
          <span>Add Lead</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search leads, contacts, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </form>
        <div className="flex items-center space-x-1 border border-slate-100 rounded-xl p-1 bg-slate-50 text-xs font-semibold">
          {[
            { label: 'All',       value: '' },
            { label: 'New',       value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Lost',      value: 'lost' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === f.value
                  ? 'bg-white text-slate-800 shadow'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FA77A] border-t-transparent" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users2 size={48} className="text-slate-200 mb-2 stroke-[1.5]" />
            <p className="text-base font-bold">No leads found</p>
            <p className="text-xs mt-1 text-slate-400">Create a new lead to start tracking potential deals.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Lead Title</th>
                  <th className="py-4 px-6">Contact Person</th>
                  <th className="py-4 px-6">Value</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{lead.title}</div>
                      {lead.notes && (
                        <div className="text-xs text-slate-400 max-w-xs truncate mt-0.5">{lead.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-700">{lead.contactName}</div>
                      <div className="text-xs text-slate-400">{lead.contactEmail}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      ₹{lead.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs capitalize font-semibold tracking-wide ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {/* Convert button — hidden once lead is qualified */}
                      {lead.status !== 'qualified' && (
                        <button
                          onClick={() => handleConvertToDeal(lead)}
                          title="Convert to Deal Pipeline"
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-transparent hover:border-emerald-100"
                        >
                          <TrendingUp size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(lead)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(lead)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-semibold">
                Showing page {page} of {totalPages} &bull; Total {totalLeads} records
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-white bg-transparent text-slate-500 hover:text-slate-800 font-semibold transition-all disabled:opacity-40"
                >
                  <ArrowLeft size={14} className="mr-1" />
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-white bg-transparent text-slate-500 hover:text-slate-800 font-semibold transition-all disabled:opacity-40"
                >
                  Next
                  <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Lead">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-lg">{formError}</div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lead Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Licensing Contract Renewal"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alice Johnson"
                value={formContactName}
                onChange={(e) => setFormContactName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Email</label>
              <input
                type="email"
                required
                placeholder="alice@company.com"
                value={formContactEmail}
                onChange={(e) => setFormContactEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lead Value (₹)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-semibold">₹</div>
              <input
                type="number"
                min="0"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              rows="3"
              placeholder="Record any comments here..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-[#2FA77A] text-white rounded-xl shadow font-semibold hover:brightness-105 active:scale-95 text-sm disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Lead">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-lg">{formError}</div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lead Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Licensing Contract Renewal"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alice Johnson"
                value={formContactName}
                onChange={(e) => setFormContactName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Email</label>
              <input
                type="email"
                required
                placeholder="alice@company.com"
                value={formContactEmail}
                onChange={(e) => setFormContactEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lead Value (₹)</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-semibold">₹</div>
                <input
                  type="number"
                  min="0"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              rows="3"
              placeholder="Record updates here..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-[#2FA77A] text-white rounded-xl shadow font-semibold hover:brightness-105 active:scale-95 text-sm disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Remove Lead Record">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">
            Are you sure you want to delete lead{' '}
            <strong className="text-slate-800">"{selectedLead?.title}"</strong>?
            This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl shadow font-semibold hover:bg-rose-700 active:scale-95 text-sm disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leads;