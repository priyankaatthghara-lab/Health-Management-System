import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hospital Verifications', path: '/admin/hospitals', icon: Building2 },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Blood Requests', path: '/admin/requests', icon: ClipboardList },
    { name: 'Audit & Compliance Logs', path: '/admin/audit-logs', icon: FileText },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-warm-bg text-primary-text">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-burgundy-100 shadow-sm">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-burgundy-900 flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-burgundy-900">
            LifeLink <span className="text-crimson-600">Admin</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-secondary-text hover:text-burgundy-700"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 md:z-30 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-none">LifeLink AI</div>
              <div className="text-[11px] font-semibold text-rose-300 tracking-wider mt-1 uppercase">
                System Administration
              </div>
            </div>
          </Link>
        </div>

        {/* Admin Identity Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-crimson-600 text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-slate-400 truncate">Superuser Role</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-burgundy-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-crimson-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
