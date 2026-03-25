import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import QuotesPage from './pages/QuotesPage';
import SubcontractorsPage from './pages/SubcontractorsPage'; // YENİ
import WorkContractsPage from './pages/WorkContractsPage'; // YENİ
import SubcontractorPaymentsPage from './pages/SubcontractorPaymentsPage'; // YENİ
import MediaManagementPage from './pages/MediaManagementPage'; // YENİ EKLENEN
import SettingsPage from './pages/SettingsPage'; // YENİ EKLENEN
import UsersPage from './pages/UsersPage'; // YENİ EKLENEN
import LogsPage from './pages/LogsPage'; // YENİ EKLENEN
import NotFoundPage from './pages/NotFoundPage';
import { initializeSeedData } from './utils/seedData';
import './index.css';

// Initialize seed data on app start
initializeSeedData();

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute requiredPage="dashboard">
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="projects" 
              element={
                <ProtectedRoute requiredPage="projects">
                  <ProjectsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="customers" 
              element={
                <ProtectedRoute requiredPage="customers">
                  <CustomersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="products" 
              element={
                <ProtectedRoute requiredPage="products">
                  <ProductsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="transactions" 
              element={
                <ProtectedRoute requiredPage="transactions">
                  <TransactionsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="quotes" 
              element={
                <ProtectedRoute requiredPage="quotes">
                  <QuotesPage />
                </ProtectedRoute>
              } 
            />
            {/* YENİ EKLENEN - Alt yüklenici yönetim sistemi */}
            <Route 
              path="subcontractors" 
              element={
                <ProtectedRoute requiredPage="subcontractors">
                  <SubcontractorsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="work-contracts" 
              element={
                <ProtectedRoute requiredPage="workContracts">
                  <WorkContractsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="subcontractor-payments" 
              element={
                <ProtectedRoute requiredPage="subcontractorPayments">
                  <SubcontractorPaymentsPage />
                </ProtectedRoute>
              } 
            />
            {/* YENİ EKLENEN - Dosya ve medya yönetimi */}
            <Route 
              path="media" 
              element={
                <ProtectedRoute requiredPage="mediaManagement">
                  <MediaManagementPage />
                </ProtectedRoute>
              } 
            />
            {/* YENİ EKLENEN - Sistem ayarları */}
            <Route 
              path="settings" 
              element={
                <ProtectedRoute requiredPage="settings">
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            {/* YENİ EKLENEN - Kullanıcı yönetimi */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute requiredPage="users">
                  <UsersPage />
                </ProtectedRoute>
              } 
            />
            {/* YENİ EKLENEN - Log sistemi */}
            <Route 
              path="logs" 
              element={
                <ProtectedRoute requiredPage="logs">
                  <LogsPage />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
