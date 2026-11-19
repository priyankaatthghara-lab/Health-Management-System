import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  MapPin,
  Bell,
  Hospital as HospitalIcon,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const HospitalLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
    { name: 'Blood Requests', path: '/hospital/requests', icon: ClipboardList },
    { name: 'Donor Geo-Map', path: '/hospital/donors/map', icon: MapPin },
    { name: 'Notifications', path: '/hospital/notifications', icon: Bell },
    { name: 'Hospital Profile', path: '/hospital/profile', icon: HospitalIcon },
    { name: 'System Settings', path: '/hospital/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-warm-bg text-primary-text">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-burgundy-100 shadow-sm">
        <Link to="/hospital/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-burgundy-600 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-burgundy-900">
            LifeLink <span className="text-crimson-600">Hospital</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-secondary-text hover:text-burgundy-700"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 md:z-30 w-64 bg-white border-r border-burgundy-100 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-burgundy-50 hidden md:block">
          <Link to="/hospital/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burgundy-700 to-crimson-600 flex items-center justify-center text-white shadow-md shadow-burgundy-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg text-burgundy-900 leading-none">LifeLink AI</div>
              <div className="text-xs font-semibold text-crimson-600 tracking-wide mt-1">HOSPITAL NETWORK</div>
            </div>
          </Link>
        </div>

        {/* Hospital Entity Card */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-burgundy-50/60 border border-burgundy-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-crimson-600 text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'H'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-primary-text truncate">{user?.name || 'Medical Center'}</p>
            <p className="text-xs text-secondary-text truncate">Verified Partner</p>
          </div>
        </div>

        {/* Quick Action: New Emergency Request */}
        <div className="px-3 py-2">
          <Link
            to="/hospital/requests/new"
            onClick={() => setMobileSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-crimson-600 to-burgundy-600 text-white font-semibold text-sm shadow-sm hover:from-crimson-700 hover:to-burgundy-700 transition-all shadow-crimson-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Blood Request</span>
          </Link>
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
                      ? 'bg-burgundy-600 text-white shadow-sm shadow-burgundy-300'
                      : 'text-secondary-text hover:text-burgundy-800 hover:bg-burgundy-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Clinical Disclaimer */}
        <div className="p-3 mx-3 mb-2 rounded-lg bg-burgundy-50/50 border border-burgundy-100 text-[11px] text-burgundy-900 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-burgundy-700 shrink-0 mt-0.5" />
          <span>Preliminary matching assistance. Cross-match test mandatory prior to transfusion.</span>
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-text hover:text-crimson-600 hover:bg-crimson-50 rounded-lg transition-colors"
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

export default HospitalLayout;
