import React, { useState, useEffect } from 'react';
import * as API from '../services/api.js';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  UserCircle,
  Eye, EyeOff
} from 'lucide-react';
const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
const [showPassword, setShowPassword] = useState(false);  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('user');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  useEffect(() => {
    fetchTeam();
  }, []);
  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
const res = await API.getTeam();
      if (res.data && res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch team members. Ensure you have Admin privileges.');
    } finally {
      setLoading(false);
    }
  };
  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('user');
    setFormError('');
    setIsAddOpen(true);
  };
  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formName || !formEmail || !formPassword) {
      setFormError('Please fill in name, email, and password.');
      return;
    }
    setActionLoading(true);
    try {
     const res = await API.addMember({
  name: formName,
  email: formEmail,
  password: formPassword,
  role: formRole
});
      if (res.data.success) {
        setIsAddOpen(false);
        fetchTeam();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add team member.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await API.deleteMember(selectedMember._id);
      if (res.data.success) {
        setIsDeleteOpen(false);
        fetchTeam();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove team member.');
      setIsDeleteOpen(false);
    } finally {
      setActionLoading(false);
    }
  };
  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <ShieldCheck size={12} className="mr-1" />
          <span>Admin</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
        <UserCircle size={12} className="mr-1" />
        <span>Agent</span>
      </span>
    );
  };
  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Personnel</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">Team Directory</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center bg-[#2FA77A] font-bold text-white justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-light to-brand-dark px-5 py-2.5 text-sm shadow-lg shadow-brand-light/35 transition-all hover:brightness-105 active:scale-[0.98] w-fit"
        >
          <Plus size={16} />
          <span>Add Member</span>
        </button>
      </div>
      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">User Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">System Role</th>
                  <th className="py-4 px-6">Date Added</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {member.name}
                      {member._id === user?.id && (
                        <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{member.email}</td>
                    <td className="py-4 px-6">{getRoleBadge(member.role)}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        disabled={member._id === user?.id}
                        onClick={() => openDeleteModal(member)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-transparent hover:border-rose-100 disabled:opacity-35"
                        title="Remove user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Invite Team Member">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && <div className="text-xs font-bold text-rose-600 bg-rose-50/50 p-3 rounded-lg">{formError}</div>}
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Samuel Green"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-brand-light focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. sam@company.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-brand-light focus:bg-white"
            />
          </div>
          
        <div>
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
    Temporary Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      required
      placeholder="••••••••"
      value={formPassword}
      onChange={(e) => setFormPassword(e.target.value)}
      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 pr-10 text-sm text-slate-800 outline-none focus:border-brand-light focus:bg-white"
    />

    <button
      type="button"
      onClick={() => setShowPassword(prev => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Workspace Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none focus:border-brand-light focus:bg-white font-semibold text-slate-700"
              >
                <option value="user">Agent (Leads, Deals)</option>
                <option value="admin">Administrator (Invite, Delete)</option>
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
              className="px-4 bg-[#2FA77A] font-bold text-white,py-2 bg-gradient-to-r from-brand-light to-brand-dark text-white rounded-xl shadow font-semibold hover:brightness-105 active:scale-95 text-sm disabled:opacity-50"
            >
              {actionLoading ? 'Inviting...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Revoke Team Membership">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">
            Are you sure you want to remove <strong className="text-slate-800">"{selectedMember?.name}"</strong> from your company tenant team? This will immediately terminate their active session and dashboard access.
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
              {actionLoading ? 'Removing...' : 'Confirm Revocation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Team;