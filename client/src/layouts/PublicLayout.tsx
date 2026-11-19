import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Activity, ShieldAlert, HeartHandshake, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'hospital') return '/hospital/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-bg text-primary-text">
      {/* Top Emergency Advisory Bar */}
      <div className="bg-gradient-to-r from-crimson-600 to-burgundy-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Medical Notice: LifeLink AI matching recommendations are preliminary. Certified clinical verification required.</span>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-burgundy-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burgundy-700 via-burgundy-600 to-crimson-600 flex items-center justify-center text-white shadow-md shadow-burgundy-200 transition-transform group-hover:scale-105">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-burgundy-900 group-hover:text-burgundy-700 transition-colors">
                  LifeLink <span className="text-crimson-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-secondary-text tracking-wider">
                  Emergency Blood Network
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-burgundy-600 ${
                  location.pathname === '/' ? 'text-burgundy-600 font-semibold' : 'text-secondary-text'
                }`}
              >
                Home
              </Link>
              <Link
                to="/how-it-works"
                className={`text-sm font-medium transition-colors hover:text-burgundy-600 ${
                  location.pathname === '/how-it-works' ? 'text-burgundy-600 font-semibold' : 'text-secondary-text'
                }`}
              >
                How It Works
              </Link>
              <Link
                to="/safety"
                className={`text-sm font-medium transition-colors hover:text-burgundy-600 ${
                  location.pathname === '/safety' ? 'text-burgundy-600 font-semibold' : 'text-secondary-text'
                }`}
              >
                Safety &amp; Compliance
              </Link>
            </nav>

            {/* Desktop Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-burgundy-50 text-burgundy-800 text-sm font-medium hover:bg-burgundy-100 transition-colors border border-burgundy-200"
                  >
                    <Activity className="w-4 h-4 text-burgundy-600" />
                    Dashboard ({user.name.split(' ')[0]})
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-secondary-text hover:text-crimson-600 transition-colors px-2 py-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-burgundy-800 hover:text-burgundy-900 hover:bg-burgundy-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-burgundy-600" />
                    Sign In
                  </Link>

                  <div className="relative group">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-burgundy-600 to-crimson-600 text-white text-sm font-semibold shadow-sm hover:from-burgundy-700 hover:to-crimson-700 transition-all shadow-burgundy-200">
                      <UserPlus className="w-4 h-4" />
                      Register
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-burgundy-100 py-1.5 hidden group-hover:block transition-all z-50">
                      <Link
                        to="/register/donor"
                        className="block px-4 py-2 text-xs font-medium text-secondary-text hover:text-burgundy-700 hover:bg-burgundy-50"
                      >
                        Register as Blood Donor
                      </Link>
                      <Link
                        to="/register/hospital"
                        className="block px-4 py-2 text-xs font-medium text-secondary-text hover:text-burgundy-700 hover:bg-burgundy-50"
                      >
                        Register as Hospital / Blood Bank
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-secondary-text hover:text-burgundy-700 hover:bg-burgundy-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-burgundy-100 bg-white px-4 pt-2 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-primary-text hover:text-burgundy-600"
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-primary-text hover:text-burgundy-600"
            >
              How It Works
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-primary-text hover:text-burgundy-600"
            >
              Safety Guidelines
            </Link>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-burgundy-600 text-white font-medium"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center text-sm text-secondary-text hover:text-crimson-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg border border-burgundy-300 text-burgundy-800 font-medium hover:bg-burgundy-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/donor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-burgundy-600 text-white font-medium hover:bg-burgundy-700"
                  >
                    Register as Donor
                  </Link>
                  <Link
                    to="/register/hospital"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Register as Hospital
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-burgundy-100 text-secondary-text text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-burgundy-600 flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="font-bold text-base text-burgundy-900">LifeLink AI</span>
              </div>
              <p className="text-xs text-secondary-text max-w-md leading-relaxed">
                LifeLink AI is an intelligent emergency blood matching and coordination network.
                Our algorithms help identify compatible donors swiftly while upholding the highest
                patient privacy and healthcare compliance standards.
              </p>
              <div className="p-3 rounded-lg bg-burgundy-50/60 border border-burgundy-100 text-[11px] text-burgundy-900 leading-normal">
                <strong>Preliminary Medical Notice:</strong> LifeLink AI matching recommendations are
                strictly decision-support tools. All donor-recipient compatibilities must undergo formal
                serological and cross-match verification in accredited clinical laboratories before transfusion.
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-primary-text mb-3 text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/how-it-works" className="hover:text-burgundy-600 transition-colors">How It Works</Link></li>
                <li><Link to="/safety" className="hover:text-burgundy-600 transition-colors">Safety &amp; Compliance</Link></li>
                <li><Link to="/register/donor" className="hover:text-burgundy-600 transition-colors">Become a Donor</Link></li>
                <li><Link to="/register/hospital" className="hover:text-burgundy-600 transition-colors">Hospital Registration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary-text mb-3 text-xs uppercase tracking-wider">Access</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-burgundy-600 transition-colors">Sign In</Link></li>
                <li><Link to="/forgot-password" className="hover:text-burgundy-600 transition-colors">Forgot Password</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} LifeLink AI Platform. All rights reserved.</p>
            <p className="text-gray-400">Built for intelligent healthcare emergency response.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
