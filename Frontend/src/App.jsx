import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import RoleBasedRoute from './components/auth/RoleBasedRoute.jsx';
import AdminRoutes from './routes/AdminRoutes.jsx';
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const InternshipsPage = lazy(() => import('./pages/InternshipsPage.jsx'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const InternshipDetailPage = lazy(() => import('./pages/InternshipDetailPage.jsx'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard.jsx'));
const CompanyDashboard = lazy(() => import('./pages/dashboard/CompanyDashboard.jsx'));
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard.jsx';
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// Email verification components
const EmailVerification = lazy(() => import('./components/EmailVerification.jsx'));
const VerificationRequired = lazy(() => import('./components/VerificationRequired.jsx'));
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage.jsx'));

// Password reset components
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));

// Test pages
const LoginTest = lazy(() => import('./pages/LoginTest.jsx'));
const AdminDebug = lazy(() => import('./pages/AdminDebug.jsx'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const SimpleAdminDashboard = lazy(() => import('./pages/admin/SimpleAdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/Users.jsx'));
const AdminCompanies = lazy(() => import('./pages/admin/Companies.jsx'));
const AdminJobs = lazy(() => import('./pages/admin/Jobs.jsx'));
const AdminResults = lazy(() => import('./pages/admin/Results.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/Settings.jsx'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="internships" element={<InternshipsPage />} />
          <Route path="internships/:id" element={<InternshipDetailPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Login & Register pages - standalone without footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Email verification routes - standalone pages */}
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/verification-required" element={<EmailVerificationPage />} />

        {/* Password reset routes - standalone pages */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Test routes */}
        <Route path="/login-test" element={<LoginTest />} />
        <Route path="/admin-debug" element={<AdminDebug />} />
        <Route path="/simple-admin" element={<SimpleAdminDashboard />} />

        {/* Admin routes - complete admin panel */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminRoutes />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/companies" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminCompanies />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/jobs" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminJobs />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/results" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminResults />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Protected routes based on role */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route path="student" element={<RoleBasedRoute role="student" element={<StudentDashboard />} />} />
          <Route path="company" element={<RoleBasedRoute role="company" element={<CompanyDashboard />} />} />
          <Route path="supervisor" element={<RoleBasedRoute role="supervisor" element={<SupervisorDashboard />} />} />
          <Route path="admin" element={
            <RoleBasedRoute role="admin" element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            } />
          } />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;