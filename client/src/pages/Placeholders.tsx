import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import {
  HeartHandshake,
  Activity,
  AlertTriangle,
  Building2,
  Users,
  ShieldAlert,
  MapPin,
  Calendar,
  Clock,
  Bell,
  Settings,
  PlusCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
  category: 'public' | 'donor' | 'hospital' | 'admin';
  icon?: React.ElementType;
}

export const PagePlaceholder: React.FC<PlaceholderProps> = ({
  title,
  description,
  category,
  icon: Icon = Activity,
}) => {
  const location = useLocation();
  const params = useParams();

  const getCategoryTheme = () => {
    switch (category) {
      case 'donor':
        return {
          badge: 'bg-burgundy-100 text-burgundy-800 border-burgundy-200',
          accent: 'text-burgundy-600',
          gradient: 'from-burgundy-600 to-crimson-600',
        };
      case 'hospital':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          accent: 'text-crimson-600',
          gradient: 'from-crimson-600 to-burgundy-600',
        };
      case 'admin':
        return {
          badge: 'bg-slate-800 text-slate-200 border-slate-700',
          accent: 'text-slate-700',
          gradient: 'from-slate-800 to-slate-900',
        };
      default:
        return {
          badge: 'bg-burgundy-50 text-burgundy-700 border-burgundy-100',
          accent: 'text-burgundy-600',
          gradient: 'from-burgundy-700 to-crimson-600',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-burgundy-100/80 p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-burgundy-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center text-white shadow-md`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}
                  >
                    {category.toUpperCase()} MODULE
                  </span>
                  <span className="text-xs text-secondary-text font-mono">
                    {location.pathname}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-text tracking-tight mt-1">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          <p className="text-secondary-text leading-relaxed text-base max-w-2xl mb-8">
            {description}
          </p>

          {/* Dynamic route parameters display if available */}
          {Object.keys(params).length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-warm-bg border border-gray-200">
              <p className="text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2">
                Route Parameters
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(params).map(([key, val]) => (
                  <div key={key} className="bg-white p-2 rounded border border-gray-100">
                    <span className="text-burgundy-700 font-semibold">{key}:</span> {val}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Under construction alert */}
          <div className="rounded-xl bg-burgundy-50/70 border border-burgundy-200 p-4 flex items-start gap-3 text-sm text-burgundy-900">
            <AlertTriangle className="w-5 h-5 text-crimson-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">LifeLink AI Component Blueprint</p>
              <p className="text-xs text-secondary-text">
                This frontend view is currently mapped in the routing architecture. Full interactive
                charts, real-time WebSockets, and geospatial integrations will be wired into this layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Public Route Placeholders
// ==========================================
export const HomePage: React.FC = () => (
  <PagePlaceholder
    title="LifeLink AI Network"
    description="Intelligent emergency blood donation matching and coordination system connecting blood donors with hospitals in real-time."
    category="public"
    icon={HeartHandshake}
  />
);

export { Login as LoginPage } from './auth/Login';
export { RegisterDonor as RegisterDonorPage } from './auth/RegisterDonor';
export { RegisterHospital as RegisterHospitalPage } from './auth/RegisterHospital';
export { ForgotPassword as ForgotPasswordPage } from './auth/ForgotPassword';
export { ResetPassword as ResetPasswordPage } from './auth/ResetPassword';

export const HowItWorksPage: React.FC = () => (
  <PagePlaceholder
    title="How LifeLink AI Works"
    description="Explore our multi-factor matching engine: geospatial proximity, blood compatibility, donor recency, and clinical triage."
    category="public"
    icon={Activity}
  />
);

export const SafetyPage: React.FC = () => (
  <PagePlaceholder
    title="Safety & Compliance Guidelines"
    description="Review medical donation eligibility protocols, strict privacy safeguards, and mandatory lab cross-matching requirements."
    category="public"
    icon={ShieldAlert}
  />
);

// ==========================================
// Donor Route Placeholders
// ==========================================
export const DonorDashboardPage: React.FC = () => (
  <PagePlaceholder
    title="Donor Dashboard"
    description="View your active donation requests, overall impact metrics, eligibility countdown, and nearby donation camps."
    category="donor"
    icon={Activity}
  />
);

export const DonorProfilePage: React.FC = () => (
  <PagePlaceholder
    title="Donor Medical Profile"
    description="Manage your verified blood group, contact preferences, emergency contact details, and location coordinates."
    category="donor"
    icon={UserCheck}
  />
);

export const DonorAvailabilityPage: React.FC = () => (
  <PagePlaceholder
    title="Donation Availability"
    description="Toggle your on-call availability, set temporary vacation freezes, or schedule recurring donation windows."
    category="donor"
    icon={Clock}
  />
);

export const DonorRequestsPage: React.FC = () => (
  <PagePlaceholder
    title="Urgent Blood Requests"
    description="Review matching requests from certified hospitals, review distance and urgency tier, and respond with your acceptance."
    category="donor"
    icon={AlertTriangle}
  />
);

export const DonorDonationsPage: React.FC = () => (
  <PagePlaceholder
    title="Donation History & Certificates"
    description="Track your verified transfusions, units provided, hospital recognition certificates, and next eligible donation date."
    category="donor"
    icon={CheckCircle2}
  />
);

export const DonorNotificationsPage: React.FC = () => (
  <PagePlaceholder
    title="Donor Notifications"
    description="Real-time notifications regarding urgent blood requests, coordination messages, and system alerts."
    category="donor"
    icon={Bell}
  />
);

export const DonorSettingsPage: React.FC = () => (
  <PagePlaceholder
    title="Donor Account Settings"
    description="Update notification channels (SMS, WhatsApp, Push), change password, and configure privacy options."
    category="donor"
    icon={Settings}
  />
);

// ==========================================
// Hospital Route Placeholders
// ==========================================
export const HospitalDashboardPage: React.FC = () => (
  <PagePlaceholder
    title="Hospital Command Dashboard"
    description="Monitor active emergency requests, match response rates, incoming donor arrival estimates, and blood inventory levels."
    category="hospital"
    icon={Activity}
  />
);

export const HospitalRequestsPage: React.FC = () => (
  <PagePlaceholder
    title="Blood Requests Management"
    description="Track all submitted blood requests across wards, triage urgency levels, and oversee ongoing coordination."
    category="hospital"
    icon={FileText}
  />
);

export const NewRequestPage: React.FC = () => (
  <PagePlaceholder
    title="Create Emergency Blood Request"
    description="Initiate a prioritized request specifying patient reference, required blood component, units, and urgency level."
    category="hospital"
    icon={PlusCircle}
  />
);

export const RequestDetailsPage: React.FC = () => (
  <PagePlaceholder
    title="Request Details & Timeline"
    description="Detailed breakdown of patient request, audit history, status transitions, and assigned response team."
    category="hospital"
    icon={FileText}
  />
);

export const RequestMatchesPage: React.FC = () => (
  <PagePlaceholder
    title="Algorithm Matches & Ranking"
    description="Review AI-ranked compatible donors with multi-factor scoring, proximity estimates, and outreach automation."
    category="hospital"
    icon={Users}
  />
);

export const DonorsMapPage: React.FC = () => (
  <PagePlaceholder
    title="Geospatial Donor Map"
    description="Interactive Leaflet map showing compatible donors, distance radii, and regional hospital network distribution."
    category="hospital"
    icon={MapPin}
  />
);

export const HospitalNotificationsPage: React.FC = () => (
  <PagePlaceholder
    title="Hospital Notifications"
    description="Alerts on donor acceptances, incoming emergency requests, and verification status notices."
    category="hospital"
    icon={Bell}
  />
);

export const HospitalProfilePage: React.FC = () => (
  <PagePlaceholder
    title="Hospital & Blood Bank Profile"
    description="Facility licensing, registered address, emergency phone contacts, and blood storage capacity."
    category="hospital"
    icon={Building2}
  />
);

export const HospitalSettingsPage: React.FC = () => (
  <PagePlaceholder
    title="Hospital Settings"
    description="Department dispatch protocols, emergency contact escalation rules, and API integration keys."
    category="hospital"
    icon={Settings}
  />
);

// ==========================================
// Admin Route Placeholders
// ==========================================
export const AdminDashboardPage: React.FC = () => (
  <PagePlaceholder
    title="System Administrator Overview"
    description="Network-wide KPIs: active hospitals, verified donors, pending verification requests, and matching response times."
    category="admin"
    icon={Activity}
  />
);

export const AdminHospitalsPage: React.FC = () => (
  <PagePlaceholder
    title="Hospital Verifications & Registry"
    description="Review medical licenses, verify hospital credentials, and approve or suspend healthcare provider accounts."
    category="admin"
    icon={Building2}
  />
);

export const AdminHospitalDetailsPage: React.FC = () => (
  <PagePlaceholder
    title="Hospital Audit Inspection"
    description="Review uploaded licensing documents, regulatory compliance history, and bed capacity specifications."
    category="admin"
    icon={Building2}
  />
);

export const AdminUsersPage: React.FC = () => (
  <PagePlaceholder
    title="Platform User Directory"
    description="Search, filter, and manage all donor, hospital, and staff accounts with granular role-based permissions."
    category="admin"
    icon={Users}
  />
);

export const AdminRequestsPage: React.FC = () => (
  <PagePlaceholder
    title="Network Requests Triage"
    description="Global view of all blood requests across all registered hospitals with filter by urgency and component."
    category="admin"
    icon={FileText}
  />
);

export const AdminAuditLogsPage: React.FC = () => (
  <PagePlaceholder
    title="Audit & Compliance Logs"
    description="Immutable audit trail of authentication events, matching transactions, data access, and clinical status changes."
    category="admin"
    icon={ShieldAlert}
  />
);

export const AdminSettingsPage: React.FC = () => (
  <PagePlaceholder
    title="Global Platform Settings"
    description="Configure matching weights, geofence radius limits, SMS/Email gateway settings, and compliance policies."
    category="admin"
    icon={Settings}
  />
);

// ==========================================
// 404 Not Found Page
// ==========================================
export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-burgundy-100 text-burgundy-700 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-primary-text mb-2">404</h1>
      <p className="text-xl font-semibold text-secondary-text mb-4">Page Not Found</p>
      <p className="text-sm text-secondary-text max-w-md mb-6">
        The page you are looking for does not exist or may have been relocated within the LifeLink AI network.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-burgundy-600 text-white font-medium hover:bg-burgundy-700 transition-colors shadow-sm"
      >
        Return to Home
      </Link>
    </div>
  );
};
