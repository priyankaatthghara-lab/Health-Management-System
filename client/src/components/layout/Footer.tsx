import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldAlert, Mail, Phone, MapPin, Globe, Award, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-warm-bg border-t border-burgundy-100/80 text-secondary-text text-sm transition-colors">
      {/* Top Clinical & Regulatory Advisory Notice */}
      <div className="bg-burgundy-950 text-white/90 text-xs py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <strong className="text-white font-semibold">Preliminary Clinical Notice:</strong> LifeLink AI algorithmic matching scores and donor rankings are preliminary decision-support indicators. Mandatory serological and laboratory cross-matching must be verified prior to any clinical transfusion.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[10px] text-white/70">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted Transmission</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-burgundy-700 to-crimson-600 flex items-center justify-center text-white shadow-sm">
                <Heart className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl text-burgundy-950">
                LifeLink <span className="text-crimson-600">AI</span>
              </span>
            </Link>

            <p className="text-xs text-secondary-text leading-relaxed max-w-sm">
              LifeLink AI is an intelligent healthcare platform revolutionizing emergency blood matching and rapid clinical coordination. Connecting certified voluntary donors, trauma centers, and blood banks with intelligent multi-factor matching algorithms.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-primary-text font-medium">
                <Mail className="w-3.5 h-3.5 text-burgundy-600" />
                <span>emergency-support@lifelink-ai.org</span>
              </div>
              <div className="flex items-center gap-2 text-primary-text font-medium">
                <Phone className="w-3.5 h-3.5 text-crimson-600" />
                <span>24/7 Clinical Hotline: 1-800-LIFELINK</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-text">
                <MapPin className="w-3.5 h-3.5 text-burgundy-400" />
                <span>Global Healthcare Logistics Coordination Center</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-burgundy-950">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-burgundy-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-burgundy-700 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/register/donor" className="hover:text-burgundy-700 transition-colors">
                  Join as Donor
                </Link>
              </li>
              <li>
                <Link to="/register/hospital" className="hover:text-burgundy-700 transition-colors">
                  For Hospitals &amp; Blood Banks
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-burgundy-700 transition-colors">
                  Safety &amp; Trust Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-burgundy-950">
              Compliance &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#privacy" className="hover:text-burgundy-700 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-burgundy-700 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#safety-info" className="hover:text-burgundy-700 transition-colors">
                  Safety Information
                </a>
              </li>
              <li>
                <a href="#accessibility" className="hover:text-burgundy-700 transition-colors">
                  Accessibility Statement
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-burgundy-700 transition-colors inline-flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-600" />
                  Clinical Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-burgundy-950">
              Community &amp; Media
            </h4>
            <p className="text-xs text-secondary-text leading-relaxed">
              Stay connected with regional blood drives, emergency updates, and healthcare developments.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter/X"
                className="w-8 h-8 rounded-lg bg-white border border-burgundy-200/60 flex items-center justify-center text-secondary-text hover:text-burgundy-700 hover:border-burgundy-300 transition-colors shadow-xs"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white border border-burgundy-200/60 flex items-center justify-center text-secondary-text hover:text-burgundy-700 hover:border-burgundy-300 transition-colors shadow-xs"
              >
                <Award className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-white border border-burgundy-200/60 flex items-center justify-center text-secondary-text hover:text-burgundy-700 hover:border-burgundy-300 transition-colors shadow-xs"
              >
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-burgundy-100/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-secondary-text">
            &copy; {new Date().getFullYear()} LifeLink AI Healthcare Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-secondary-text">
            <span>HIPAA-Aligned Architecture</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>ISO 27001 Preparedness</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Interoperable FHIR Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
