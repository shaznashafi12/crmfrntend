import React, { useState, useEffect } from "react";
import {
  Users, Search, Shield, Building2,
  UserCheck, UserX, Mail, Calendar,
  AlertCircle, Trash2, Edit3, Eye, X,
  Save, Loader2
} from "lucide-react";
import { useAuth } from "../context/Authcontext.jsx";
import { getAllUsers, updateUser, deleteUser } from "../services/api";
import toast from "react-hot-toast";

const ROLE_STYLE = {
  superadmin: "bg-violet-100 text-violet-700 border border-violet-200",
  admin:"bg-[#2FA77A]/10 text-[#2FA77A] border border-[#2FA77A]/20",
  user:"bg-slate-100 text-slate-600 border border-slate-200",
};

const STATUS_STYLE = {
  active:"bg-emerald-50 text-emerald-600 border border-emerald-200",
  inactive:"bg-rose-50 text-rose-500 border border-rose-200",
};

const Avatar = ({ name, size = "md" }) => {
  const s = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  const colors = [
    "from-[#2FA77A] to-[#3BC08A]",
    "from-blue-400 to-blue-600",
    "from-violet-400 to-violet-600",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-pink-600",
  ];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  return (
    <div className={`flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br ${colors[idx]} text-white font-bold uppercase ${s}`}>
      {name?.[0] ?? "U"}
    </div>
  );
};
const Backdrop = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    onClick={onClose}
  />
);
const ViewModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">User Details</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-5">

            {/* avatar + name */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2FA77A] to-[#3BC08A] flex items-center justify-center text-white text-xl font-bold uppercase shadow-md shadow-[#2FA77A]/20">
                {user.name?.[0] ?? "U"}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Role",    value: <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${ROLE_STYLE[user.role]}`}>{user.role}</span> },
                { label: "Status",  value: <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLE[user.status] ?? STATUS_STYLE.active}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-rose-400"}`} />
                    {user.status ?? "active"}
                  </span>
                },
                { label: "Company", value: user.company ?? "—" },
                { label: "Joined",  value: new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
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

const EditModal = ({ user, onClose, onSaved }) => {
  const [form, setForm]       = useState({ name: user.name, email: user.email, role: user.role });
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setErr("Name and email are required.");
      return;
    }
    try {
      setSaving(true);
      setErr("");
      const res = await updateUser(user._id, form);
      const updated = res?.data?.data;
      onSaved(updated);
      toast.success("User updated successfully");
      onClose();
    } catch (e) {
      setErr(e?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Edit User</h2>
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
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2FA77A]/50 focus:ring-2 focus:ring-[#2FA77A]/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2FA77A]/50 focus:ring-2 focus:ring-[#2FA77A]/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Role</label>
              <div className="flex gap-2">
                {["admin", "user"].map(r => (
                  <button
                    key={r}
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                      form.role === r
                        ? "bg-[#2FA77A] text-white border-[#2FA77A] shadow-sm shadow-[#2FA77A]/30"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {r}
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
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const DeleteModal = ({ user, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteUser(user._id);
      onDeleted(user._id);
      toast.success("User removed successfully");
      onClose();
    } catch (e) {
      toast.error(e?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Remove User</h2>
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
              Are you sure you want to remove{" "}
              <span className="font-bold text-slate-900">{user.name}</span>?
            </p>
          </div>

          {/* footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? "Removing…" : "Yes, Remove"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Superusers = () => {
  const { token } = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [viewUser, setViewUser]     = useState(null);
  const [editUser, setEditUser]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers();
        const raw = res?.data?.data ?? [];
        const normalized = raw.map(u => ({
          ...u,
          status:   u.status ?? "active",
          company:  u.companyId?.name ?? "—",
          companyId: u.companyId?._id ?? u.companyId,
        }));
        setUsers(normalized);
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleUserUpdated = (updated) => {
    setUsers(prev => prev.map(u =>
      u._id === updated._id
        ? { ...u, name: updated.name, email: updated.email, role: updated.role }
        : u
    ));
  };

  const handleUserDeleted = (id) => {
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        u.company?.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total:    users.length,
    active:   users.filter(u => u.status === "active").length,
    admins:   users.filter(u => u.role === "admin").length,
    inactive: users.filter(u => u.status === "inactive").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#2FA77A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-500 text-sm gap-2">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  return (
    <>
      {viewUser   && <ViewModal   user={viewUser}     onClose={() => setViewUser(null)} />}
      {editUser   && <EditModal   user={editUser}     onClose={() => setEditUser(null)}   onSaved={handleUserUpdated} />}
      {deleteTarget && <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleUserDeleted} />}

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Global Platform Administration
            </p>
            <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Every user across all tenant companies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users",    value: stats.total,    icon: Users,     color: "#3B82F6" },
            { label: "Active Users",   value: stats.active,   icon: UserCheck, color: "#2FA77A" },
            { label: "Company Admins", value: stats.admins,   icon: Shield,    color: "#8B5CF6" },
            { label: "Inactive",       value: stats.inactive, icon: UserX,     color: "#EF4444" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-900 font-mono">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-slate-50">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-0 focus-within:border-[#2FA77A]/50 transition-all">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email, company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {["all", "admin", "user"].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    roleFilter === r
                      ? "bg-[#2FA77A] text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {r === "all" ? "All Roles" : r}
                </button>
              ))}
            </div>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  {["User", "Company", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">{u.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={10} />{u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                        <Building2 size={12} className="text-slate-400" />
                        {u.company}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLE[u.status] ?? STATUS_STYLE.active}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`} />
                        {u.status ?? "active"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>

                    {/* ── Action buttons — now wired up ── */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewUser(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#2FA77A] transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove"
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
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of <span className="font-semibold text-slate-600">{users.length}</span> users
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Superusers;