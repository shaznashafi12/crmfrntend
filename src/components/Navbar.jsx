import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ShieldAlert } from 'lucide-react';
const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/leads')) return 'Leads Directory';
    if (path.startsWith('/deals')) return 'Sales Pipeline';
    if (path.startsWith('/team')) return 'Team Management';
    if (path.startsWith('/companies')) return 'Enterprise Tenants';
    return 'ClientFlow';
  };
  const userName = user?.name || 'CRM User';
  const userRole = user?.role || 'user';
  const companyName = user?.companyId?.name || (userRole === 'superadmin' ? 'Global System' : '');
  const subscription = user?.companyId?.subscription || '';
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  const getSubBadgeStyles = (sub) => {
    switch (sub?.toLowerCase()) {
      case 'premium':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'enterprise':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'free':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100 shadow-sm z-10">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 leading-tight">
          {getPageTitle()}
        </h2>
        {companyName && (
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-xs font-semibold text-slate-400">
              {companyName}
            </span>
            {subscription && (
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getSubBadgeStyles(subscription)}`}>
                {subscription}
              </span>
            )}
          </div>
        )}
      </div>
      {/* User Information Controls */}
      <div className="flex items-center space-x-4">
        {userRole === 'superadmin' && (
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
            <ShieldAlert size={14} />
            <span>Super Admin Context</span>
          </div>
        )}
        
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-100">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-slate-800 leading-tight">{userName}</span>
            <span className="text-[11px] capitalize font-medium text-slate-400 leading-none mt-0.5">{userRole}</span>
          </div>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2FA77A]  bg-brand-light font-display text-sm font-bold  text-white shadow-sm">
            {getInitials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
