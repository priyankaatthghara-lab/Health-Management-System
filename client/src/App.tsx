import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicLayout, DonorLayout, HospitalLayout, AdminLayout } from '@/layouts';

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.LoginPage })));
const RegisterDonorPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.RegisterDonorPage })));
const RegisterHospitalPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.RegisterHospitalPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.ResetPasswordPage })));
const HowItWorksPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HowItWorksPage })));
const SafetyPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.SafetyPage })));

// Donor Pages
const DonorDashboardPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorDashboardPage })));
const DonorProfilePage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorProfilePage })));
const DonorAvailabilityPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorAvailabilityPage })));
const DonorRequestsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorRequestsPage })));
const DonorDonationsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorDonationsPage })));
const DonorNotificationsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorNotificationsPage })));
const DonorSettingsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorSettingsPage })));

// Hospital Pages
const HospitalDashboardPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HospitalDashboardPage })));
const HospitalRequestsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HospitalRequestsPage })));
const NewRequestPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.NewRequestPage })));
const RequestDetailsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.RequestDetailsPage })));
const RequestMatchesPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.RequestMatchesPage })));
const DonorsMapPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.DonorsMapPage })));
const HospitalNotificationsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HospitalNotificationsPage })));
const HospitalProfilePage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HospitalProfilePage })));
const HospitalSettingsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.HospitalSettingsPage })));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminDashboardPage })));
const AdminHospitalsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminHospitalsPage })));
const AdminHospitalDetailsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminHospitalDetailsPage })));
const AdminUsersPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminUsersPage })));
const AdminRequestsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminRequestsPage })));
const AdminAuditLogsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminSettingsPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.AdminSettingsPage })));

// 404 Page
const NotFoundPage = lazy(() => import('@/pages/Placeholders').then((m) => ({ default: m.NotFoundPage })));

const SuspenseFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center py-16">
    <div className="w-10 h-10 border-4 border-burgundy-200 border-t-burgundy-600 rounded-full animate-spin"></div>
    <span className="mt-3 text-xs font-medium text-secondary-text tracking-wide">
      Loading view...
    </span>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Public Routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/donor" element={<RegisterDonorPage />} />
            <Route path="/register/hospital" element={<RegisterHospitalPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Donor Routes (Protected: donor or admin) */}
          <Route element={<ProtectedRoute allowedRoles={['donor', 'admin']} />}>
            <Route element={<DonorLayout />}>
              <Route path="/donor" element={<Navigate to="/donor/dashboard" replace />} />
              <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
              <Route path="/donor/profile" element={<DonorProfilePage />} />
              <Route path="/donor/availability" element={<DonorAvailabilityPage />} />
              <Route path="/donor/requests" element={<DonorRequestsPage />} />
              <Route path="/donor/donations" element={<DonorDonationsPage />} />
              <Route path="/donor/notifications" element={<DonorNotificationsPage />} />
              <Route path="/donor/settings" element={<DonorSettingsPage />} />
            </Route>
          </Route>

          {/* Hospital Routes (Protected: hospital or admin) */}
          <Route element={<ProtectedRoute allowedRoles={['hospital', 'admin']} />}>
            <Route element={<HospitalLayout />}>
              <Route path="/hospital" element={<Navigate to="/hospital/dashboard" replace />} />
              <Route path="/hospital/dashboard" element={<HospitalDashboardPage />} />
              <Route path="/hospital/requests" element={<HospitalRequestsPage />} />
              <Route path="/hospital/requests/new" element={<NewRequestPage />} />
              <Route path="/hospital/requests/:id" element={<RequestDetailsPage />} />
              <Route path="/hospital/requests/:id/matches" element={<RequestMatchesPage />} />
              <Route path="/hospital/donors/map" element={<DonorsMapPage />} />
              <Route path="/hospital/notifications" element={<HospitalNotificationsPage />} />
              <Route path="/hospital/profile" element={<HospitalProfilePage />} />
              <Route path="/hospital/settings" element={<HospitalSettingsPage />} />
            </Route>
          </Route>

          {/* Admin Routes (Protected: admin) */}
          <Route element={<ProtectedRoute allowedRoles="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/hospitals" element={<AdminHospitalsPage />} />
              <Route path="/admin/hospitals/:id" element={<AdminHospitalDetailsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/requests" element={<AdminRequestsPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default App;
