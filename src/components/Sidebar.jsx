import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users2, Briefcase, FolderGit2, Building2,
  ChevronLeft, ChevronRight, LogOut, Users, CreditCard,
  Zap,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard, roles: ['superadmin'], section: 'Workspace' },
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin'], section: 'Workspace' },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user'], section: 'Workspace' },

  { name: 'Leads', path: '/leads', icon: Users2, roles: ['user', 'admin'], section: 'Workspace' },
  { name: 'Deals', path: '/deals', icon: Briefcase, roles: ['user', 'admin'], section: 'Workspace' },
  { name: 'Team', path: '/team', icon: FolderGit2, roles: ['admin'], section: 'Workspace' },

  { name: 'Companies', path: '/companies', icon: Building2, roles: ['superadmin'], section: 'System Control' },
  { name: 'All Users', path: '/users', icon: Users, roles: ['superadmin'], section: 'System Control' },
  { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard, roles: ['superadmin'], section: 'System Control' },
];

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'superadmin';

  const filtered = menuItems.filter(item => item.roles.includes(user?.role));

  const sections = filtered.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDashboardPath = (path) =>
    path === '/superadmin' || path === '/admin' || path === '/dashboard';

  return (
    <div className={`fixed top-0 left-0 h-screen flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-[72px]' : 'w-64'
    }`}>
      <div className="flex items-center h-16 px-4 border-b border-slate-800 overflow-hidden">
        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2FA77A] to-[#3BC08A] shadow-lg shadow-[#2FA77A]/30">
          <Zap size={17} className="text-white fill-white" />
        </div>

        {!isCollapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-[15px] font-bold text-white leading-none tracking-tight whitespace-nowrap">
              Client<span className="text-[#2FA77A]">Flow</span>
            </p>

            {isSuperAdmin && (
              <p className="text-[9px] font-bold text-[#2FA77A]/70 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                Super Admin
              </p>
            )}

            {user?.role === 'admin' && (
              <p className="text-[9px] font-bold text-[#2FA77A]/70 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                Admin
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-[52px] z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all shadow"
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName}>
            {!isCollapsed
              ? <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-600">{sectionName}</p>
              : <div className="mx-3 mb-2 h-px bg-slate-800" />
            }

            <div className="space-y-0.5">
              {items.map(item => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={isDashboardPath(item.path)}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#2FA77A]/15 text-[#2FA77A]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!isCollapsed && <span className="truncate leading-none">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 bg-slate-950/50">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2FA77A]/30 to-[#3BC08A]/20 text-[#2FA77A] text-xs font-bold uppercase border border-[#2FA77A]/20">
              {user?.name?.[0] ?? 'U'}
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{user?.name ?? 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate leading-tight capitalize">{user?.role ?? 'user'}</p>
            </div>
          </div>
        )}

        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;