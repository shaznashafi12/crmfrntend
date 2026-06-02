import React, { useState, useEffect } from "react";
import {
  CreditCard, TrendingUp, CheckCircle2, AlertCircle,
  Clock, Building2, Calendar, Search, Zap, Star,
  Package, ArrowUpRight, RefreshCw, X, Loader2, Users
} from "lucide-react";
import { getCompaniesMetrics } from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("crm_token")}`,
});

// ── plan config — matched to your DB enum exactly ────────
const PLANS = {
  free:       { label: "Free",       color: "#64748b", bg: "bg-slate-100 text-slate-600 border-slate-200",       price: 0     },
  premium:    { label: "Premium",    color: "#2FA77A", bg: "bg-[#2FA77A]/10 text-[#2FA77A] border-[#2FA77A]/20", price: 2999  },
  enterprise: { label: "Enterprise", color: "#8B5CF6", bg: "bg-violet-50 text-violet-600 border-violet-200",     price: 9999  },
};

const PlanBadge = ({ plan }) => {
  const p = PLANS[plan] ?? PLANS.free;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${p.bg}`}>
      {plan === "enterprise" ? <Star size={10} /> : plan === "premium" ? <Zap size={10} /> : <Package size={10} />}
      {p.label}
    </span>
  );
};

// ── Change Plan Modal ─────────────────────────────────────
const ChangePlanModal = ({ company, onClose, onUpdated }) => {
  const [selected, setSelected] = useState(company.subscription);
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    if (selected === company.subscription) { onClose(); return; }
    try {
      setSaving(true);
      await axios.put(
        `${API_URL}/companies/${company.id}/subscription`,
        { subscription: selected },
        { headers: authHeaders() }
      );
      onUpdated(company.id, selected);
      toast.success(`Plan updated to ${PLANS[selected].label}`);
      onClose();
    } catch (err) {
      toast.error("Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto">

          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Change Plan</h2>
              <p className="text-xs text-slate-400 mt-0.5">{company.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* plan options */}
          <div className="px-6 py-5 space-y-3">
            {Object.entries(PLANS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  selected === key
                    ? "border-[#2FA77A] bg-[#2FA77A]/5"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${p.color}15`, color: p.color }}
                  >
                    {key === "enterprise" ? <Star size={14} /> : key === "premium" ? <Zap size={14} /> : <Package size={14} />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">{p.label}</p>
                    <p className="text-[11px] text-slate-400">
                      {p.price === 0 ? "Free forever" : `₹${p.price.toLocaleString()}/month`}
                    </p>
                  </div>
                </div>
                {/* checkmark */}
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected === key ? "border-[#2FA77A] bg-[#2FA77A]" : "border-slate-300"
                }`}>
                  {selected === key && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#2FA77A]/30"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {saving ? "Saving…" : "Save Plan"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main ──────────────────────────────────────────────────
const Supersubscriptions = () => {
  const [companies, setCompanies]   = useState([]);
  const [aggregates, setAggregates] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [planFilter, setPlan]       = useState("all");
  const [changingPlan, setChangingPlan] = useState(null); // company object for modal

  // ── fetch real data ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getCompaniesMetrics();
        // shape: { success, data: { aggregates, companies: [...] } }
        setAggregates(res?.data?.data?.aggregates ?? {});
        setCompanies(res?.data?.data?.companies   ?? []);
      } catch (err) {
        setError("Failed to load subscriptions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // update plan in local state after modal saves
  const handlePlanUpdated = (companyId, newPlan) => {
    setCompanies(prev =>
      prev.map(c => c.id === companyId ? { ...c, subscription: newPlan } : c)
    );
  };

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) &&
      (planFilter === "all" || c.subscription === planFilter)
    );
  });

  // derive stats from real data
  const totalMRR      = companies.filter(c => c.subscription !== "free")
    .reduce((a, c) => a + (PLANS[c.subscription]?.price ?? 0), 0);
  const premiumCount  = companies.filter(c => c.subscription === "premium").length;
  const enterpriseCount = companies.filter(c => c.subscription === "enterprise").length;
  const freeCount     = companies.filter(c => c.subscription === "free").length;

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
      {/* Change Plan Modal */}
      {changingPlan && (
        <ChangePlanModal
          company={changingPlan}
          onClose={() => setChangingPlan(null)}
          onUpdated={handlePlanUpdated}
        />
      )}

      <div className="space-y-6">

        {/* header */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Global Platform Administration
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage plans and billing across all companies</p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</p>
            <p className="text-[28px] font-bold text-slate-900 font-mono mt-1">
              ₹{totalMRR.toLocaleString()}
            </p>
            <p className="text-xs text-[#2FA77A] font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> Paid plans only
            </p>
          </div>

          {[
            { label: "Total Companies", value: companies.length,  color: "#3B82F6", icon: Building2     },
            { label: "Premium",         value: premiumCount,      color: "#2FA77A", icon: Zap           },
            { label: "Enterprise",      value: enterpriseCount,   color: "#8B5CF6", icon: Star          },
          ].map(({ label, value, color, icon: Icon }) => (
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

        {/* plan breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, p]) => {
            const count = companies.filter(c => c.subscription === key).length;
            const rev   = companies
              .filter(c => c.subscription === key)
              .reduce((a) => a + p.price, 0);
            return (
              <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <PlanBadge plan={key} />
                  <span className="text-xs font-bold text-slate-400">
                    {p.price === 0 ? "Free" : `₹${p.price.toLocaleString()}/mo`}
                  </span>
                </div>
                <p className="text-[28px] font-bold text-slate-900 font-mono">{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">companies</p>
                {rev > 0 && (
                  <p className="text-xs font-semibold text-[#2FA77A] mt-2 flex items-center gap-1">
                    <ArrowUpRight size={11} /> ₹{rev.toLocaleString()} MRR
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-slate-50">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 focus-within:border-[#2FA77A]/50 transition-all">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {["all", "free", "premium", "enterprise"].map(p => (
                <button key={p} onClick={() => setPlan(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    planFilter === p ? "bg-[#2FA77A] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}>
                  {p === "all" ? "All Plans" : p}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  {["Company", "Plan", "Users", "Started", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                      No companies found
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">

                    {/* company */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </div>
                    </td>

                    {/* plan */}
                    <td className="px-5 py-3.5">
                      <PlanBadge plan={c.subscription} />
                    </td>

                    {/* users count — real from metrics */}
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Users size={12} className="text-slate-400" />
                        <span className="font-mono font-semibold text-slate-700">{c.metrics?.users ?? 0}</span>
                        <span className="text-slate-400">users</span>
                      </span>
                    </td>

                    {/* started */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setChangingPlan(c)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2FA77A]/10 text-[#2FA77A] hover:bg-[#2FA77A]/20 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw size={11} /> Change Plan
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-50">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{companies.length}</span> companies
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Supersubscriptions;