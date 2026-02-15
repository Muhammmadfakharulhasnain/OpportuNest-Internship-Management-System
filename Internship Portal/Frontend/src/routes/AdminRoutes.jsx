import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';

// Admin Pages
import AdminTest from '../pages/admin/Test';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminCompanies from '../pages/admin/Companies';
import AdminJobs from '../pages/admin/Jobs';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminTest />} />
      <Route path="/" element={<AdminTest />} />
      <Route path="/test" element={<AdminTest />} />
      <Route path="/dashboard" element={
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      } />
      <Route path="/users" element={
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      } />
      <Route path="/companies" element={
        <AdminLayout>
          <AdminCompanies />
        </AdminLayout>
      } />
      <Route path="/jobs" element={
        <AdminLayout>
          <AdminJobs />
        </AdminLayout>
      } />
    </Routes>
  );
};

export default AdminRoutes;