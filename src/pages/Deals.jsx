import React, { useState, useEffect } from 'react';
import * as API from '../services/api.js';
import Modal from '../components/Modal.jsx';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Coins,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formValue, setFormValue] = useState(0);
  const [formStage, setFormStage] = useState('proposal');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDeals();

    const handler = () => fetchDeals();
    window.addEventListener('refresh-deals', handler);
    return () => window.removeEventListener('refresh-deals', handler);
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.getDeals();
      // Backend returns: { success: true, data: [...] }
      if (response.data?.success) {
        setDeals(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve deals. Please reload page.');
    } finally {
      setLoading(false);
    }
  };
  const openAddModal = () => {
    setFormTitle('');
    setFormValue(0);
    setFormStage('proposal');
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    setFormTitle(deal.title);
    setFormValue(deal.value);
    setFormStage(deal.stage);
    setFormError('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (deal) => {
    setSelectedDeal(deal);
    setIsDeleteOpen(true);
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle || formValue === undefined || formValue === '') {
      setFormError('Please enter a title and deal value.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await API.createDeal({
        title: formTitle,
        value: Number(formValue),
        stage: formStage,
      });
      if (res.data?.success) {
        // Add new deal directly into local state — no full reload needed
        setDeals((prev) => [res.data.data, ...prev]);
        setIsAddOpen(false);
      } else {
        setFormError(res.data?.message || 'Error creating deal record.');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error creating deal record.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle || formValue === undefined || formValue === '') {
      setFormError('Please enter a title and deal value.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await API.updateDeal(selectedDeal._id, {
        title: formTitle,
        value: Number(formValue),
        stage: formStage,
      });
      if (res.data?.success) {
        // Patch the deal in local state instantly
        setDeals((prev) =>
          prev.map((d) =>
            d._id === selectedDeal._id ? { ...d, title: formTitle, value: Number(formValue), stage: formStage } : d
          )
        );
        setIsEditOpen(false);
      } else {
        setFormError(res.data?.message || 'Error updating deal record.');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error updating deal record.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await API.deleteDeal(selectedDeal._id);
      if (res.data?.success) {
        // Remove from local state instantly
        setDeals((prev) => prev.filter((d) => d._id !== selectedDeal._id));
        setIsDeleteOpen(false);
        setSelectedDeal(null);
      } else {
        setError(res.data?.message || 'Failed to delete deal.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete deal.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleShiftStage = async (deal, newStage) => {
    setError('');
    try {
      const res = await API.updateDeal(deal._id, { stage: newStage });
      if (res.data?.success) {
        // Soft-update local state — no spinner flash
        setDeals((prev) =>
          prev.map((d) => (d._id === deal._id ? { ...d, stage: newStage } : d))
        );
      }
    } catch (err) {
      console.error(err);
      setError('Failed to transition deal stage.');
    }
  };
  const stages = [
    { key: 'proposal',    label: 'Proposal',    color: 'border-t-amber-400 bg-amber-50/20' },
    { key: 'negotiation', label: 'Negotiation', color: 'border-t-sky-500 bg-sky-50/10' },
    { key: 'won',         label: 'Won',         color: 'border-t-emerald-500 bg-emerald-50/10' },
    { key: 'lost',        label: 'Lost',        color: 'border-t-rose-500 bg-rose-50/10' },
  ];

  const stageKeys = ['proposal', 'negotiation', 'won', 'lost'];
  const canMoveLeft  = (key) => stageKeys.indexOf(key) > 0;
  const canMoveRight = (key) => stageKeys.indexOf(key) < stageKeys.length - 1;
  const shiftLeft    = (key) => stageKeys[stageKeys.indexOf(key) - 1];
  const shiftRight   = (key) => stageKeys[stageKeys.indexOf(key) + 1];

  const getStageTotalValue = (stageKey) =>
    deals.filter((d) => d.stage === stageKey).reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sales Pipeline</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">Deals Pipeline</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 rounded-xl bg-[#2FA77A] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] w-fit"
        >
          <Plus size={16} />
          <span>New Deal</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FA77A] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.key);
            const totalVal   = getStageTotalValue(stage.key);

            return (
              <div
                key={stage.key}
                className={`flex flex-col rounded-2xl border border-slate-100/80 shadow-soft bg-white overflow-hidden border-t-4 ${stage.color} min-h-[450px]`}
              >
                <div className="p-4 bg-slate-50/60 border-b border-slate-100/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-slate-700">{stage.label}</span>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-1">
Value: ₹{totalVal.toLocaleString()}                  </span>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                      <Coins size={24} className="stroke-[1.5] opacity-50 mb-1" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">No deals</span>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal._id}
                        className="bg-white border border-slate-100 p-4 rounded-xl shadow-soft hover:shadow-premium transition-all duration-300 relative group"
                      >
                        {/* Title & value */}
                        <div className="font-semibold text-slate-800 text-sm tracking-tight pr-4">
                          {deal.title}
                        </div>
                        <div className="text-xs font-bold text-[#2FA77A] mt-1.5">
₹{deal.value.toLocaleString()}
                        </div>

                        {/* Associated lead contact */}
                        {deal.leadId && (
                          <div className="mt-3 pt-2.5 border-t border-slate-50 text-[10px] text-slate-400">
                            <div className="font-semibold text-slate-500">{deal.leadId.contactName}</div>
                            <div className="truncate">{deal.leadId.contactEmail}</div>
                          </div>
                        )}

                        {/* Action toolbar */}
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-50 text-slate-400">
                          {/* Stage shift */}
                          <div className="flex items-center space-x-1">
                            <button
                              disabled={!canMoveLeft(deal.stage)}
                              onClick={() => handleShiftStage(deal, shiftLeft(deal.stage))}
                              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded transition-colors disabled:opacity-30"
                              title="Move back"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              disabled={!canMoveRight(deal.stage)}
                              onClick={() => handleShiftStage(deal, shiftRight(deal.stage))}
                              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded transition-colors disabled:opacity-30"
                              title="Move forward"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(deal)}
                              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded transition-colors"
                              title="Edit deal"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(deal)}
                              className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors"
                              title="Delete deal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Deal">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50/50 p-3 rounded-lg">{formError}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deal Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Custom API Integration"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deal Value (₹)</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-semibold">₹</div>
                <input
                  type="number"
                  min="0"
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Stage</label>
              <select
                value={formStage}
                onChange={(e) => setFormStage(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              >
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed Won</option>
                <option value="lost">Closed Lost</option>
              </select>
            </div>
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
              {actionLoading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT DEAL MODAL ────────────────────────────────────────────────── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Deal Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50/50 p-3 rounded-lg">{formError}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deal Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Custom API Integration"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deal Value ($)</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-semibold">$</div>
                <input
                  type="number"
                  min="0"
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stage</label>
              <select
                value={formStage}
                onChange={(e) => setFormStage(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-[#2FA77A] focus:bg-white"
              >
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed Won</option>
                <option value="lost">Closed Lost</option>
              </select>
            </div>
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

      {/* ── DELETE CONFIRMATION MODAL ──────────────────────────────────────── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Remove Deal Record">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">
            Are you sure you want to delete deal{' '}
            <strong className="text-slate-800">"{selectedDeal?.title}"</strong>?
            This will clear it from the pipeline metrics permanently.
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

export default Deals;