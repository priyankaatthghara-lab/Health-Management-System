import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, LogIn, UserPlus, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'For Donors', path: '/register/donor' },
    { label: 'For Hospitals', path: '/register/hospital' },
    { label: 'Safety & Trust', path: '/safety' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-burgundy-100/70 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* LifeLink AI Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-burgundy-700 via-burgundy-600 to-crimson-600 flex items-center justify-center text-white shadow-md shadow-burgundy-900/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl leading-tight tracking-tight text-burgundy-950 group-hover:text-burgundy-700 transition-colors">
                LifeLink <span className="text-crimson-600">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-secondary-text tracking-widest">
                Intelligent Blood Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                    ${
                      isActive
                        ? 'text-burgundy-700 bg-burgundy-50/80 shadow-sm shadow-burgundy-900/5'
                        : 'text-secondary-text hover:text-burgundy-800 hover:bg-burgundy-50/40'
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 inset-x-3 h-0.5 bg-burgundy-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy-50 border border-burgundy-200/80 text-burgundy-900 text-sm font-semibold hover:bg-burgundy-100 transition-colors shadow-sm"
                >
                  <Activity className="w-4 h-4 text-burgundy-600" />
                  <span>Dashboard ({user.name.split(' ')[0]})</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-secondary-text hover:text-crimson-600 transition-colors px-2 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-burgundy-800 hover:text-burgundy-950 hover:bg-burgundy-50 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-burgundy-600" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register/donor"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-burgundy-600 to-crimson-600 text-white text-sm font-semibold shadow-md shadow-burgundy-900/20 hover:from-burgundy-700 hover:to-crimson-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join as Donor</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 rounded-xl text-secondary-text hover:text-burgundy-800 hover:bg-burgundy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-burgundy-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-b border-burgundy-100 bg-white/95 backdrop-blur-xl overflow-hidden px-4 pt-3 pb-6 space-y-2 shadow-xl"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors
                    ${
                      isActive
                        ? 'bg-burgundy-50 text-burgundy-700'
                        : 'text-primary-text hover:text-burgundy-700 hover:bg-burgundy-50/50'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-burgundy-600 text-white font-semibold shadow-md shadow-burgundy-900/10"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center text-sm font-semibold text-secondary-text hover:text-crimson-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-burgundy-200 text-burgundy-800 font-semibold hover:bg-burgundy-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/donor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-burgundy-600 to-crimson-600 text-white font-semibold shadow-md"
                  >
                    Join as Donor
                  </Link>
                  <Link
                    to="/register/hospital"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-warm-bg border border-gray-200 text-secondary-text text-sm font-semibold hover:bg-gray-100"
                  >
                    Register as Hospital / Blood Bank
                  </Link>
                </>
              )}
            </div>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-secondary-text font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                HIPAA &amp; Healthcare Compliance Standard
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
