import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Imports
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserList from './pages/admin/AdminUserList';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStoreList from './pages/admin/AdminStoreList';
import AddUserForm from './pages/admin/AddUserForm';
import AddStoreForm from './pages/admin/AddStoreForm';
import StoreListPage from './pages/user/StoreListPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Layout wrapper to inject Navbar selectively
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col animate-fade-in">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-ink-2 border-t border-paper-3 bg-paper transition-colors duration-300 hover:text-ink-2/80" style={{ borderImage: 'linear-gradient(90deg, transparent, oklch(70% 0.2 290 / 0.2), transparent) 1' }}>
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} Store Ratings. All rights reserved.
        </div>
      </footer>
    </>
  );
};

// Root route switcher to direct logged-in users to their respective homes
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // let ProtectedRoute loading spinner handle it

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'owner') {
    return <Navigate to="/owner/dashboard" replace />;
  } else {
    return <Navigate to="/stores" replace />;
  }
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Root Redirection */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Protected Routes */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'owner']}>
                <Layout>
                  <ChangePasswordPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Normal User Routes */}
          <Route
            path="/stores"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <StoreListPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Store Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Layout>
                  <OwnerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminUserList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminUserDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AddUserForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminStoreList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AddStoreForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
  );
}

export default App;
