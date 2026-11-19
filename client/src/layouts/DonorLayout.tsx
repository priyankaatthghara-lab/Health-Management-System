import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  LayoutDashboard,
  Inbox,
  History,
  Clock,
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const DonorLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
    { name: 'Incoming Requests', path: '/donor/requests', icon: Inbox },
    { name: 'Donation History', path: '/donor/donations', icon: History },
    { name: 'Availability', path: '/donor/availability', icon: Clock },
    { name: 'Donor Profile', path: '/donor/profile', icon: User },
    { name: 'Notifications', path: '/donor/notifications', icon: Bell },
    { name: 'Account Settings', path: '/donor/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-warm-bg text-primary-text">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-burgundy-100 shadow-sm">
        <Link to="/donor/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-burgundy-600 flex items-center justify-center text-white">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-burgundy-900">
            LifeLink <span className="text-crimson-600">Donor</span>
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
        className={`fixed md:sticky top-0 h-screen z-50 md:z-30 w-64 bg-white border-r border-burgundy-100 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-burgundy-50 hidden md:block">
          <Link to="/donor/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burgundy-700 to-crimson-600 flex items-center justify-center text-white shadow-md shadow-burgundy-200">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg text-burgundy-900 leading-none">LifeLink AI</div>
              <div className="text-xs font-semibold text-crimson-600 tracking-wide mt-1">DONOR PORTAL</div>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-burgundy-50/60 border border-burgundy-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-burgundy-600 text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'D'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-primary-text truncate">{user?.name || 'Blood Donor'}</p>
            <p className="text-xs text-secondary-text truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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

        {/* Disclaimer Warning */}
        <div className="p-3 mx-3 mb-2 rounded-lg bg-warm-bg border border-gray-200 text-[11px] text-secondary-text flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-burgundy-600 shrink-0 mt-0.5" />
          <span>Preliminary algorithmic match only. Lab cross-match required.</span>
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

export default DonorLayout;
