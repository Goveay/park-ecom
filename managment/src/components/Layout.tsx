import React, { useState } from 'react';
import {
  Home,
  FolderOpen,
  Users,
  Package,
  FileText,
  DollarSign,
  Menu,
  X,
  LogOut,
  User,
  Wrench, // YENİ - Alt yükleniciler için
  ClipboardList, // YENİ - İş sözleşmeleri için
  CreditCard, // YENİ - Alt yüklenici ödemeleri için
  Folder, // YENİ - Dosya yönetimi için
  Settings, // YENİ - Sistem ayarları için
  Users as UsersIcon, // YENİ - Kullanıcı yönetimi için
  Activity, // YENİ - Log sistemi için
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPagePermission } from '../utils/permissions';

const navigation = [
  { name: 'Ana Sayfa', href: '/dashboard', icon: Home, permission: 'dashboard' as const },
  { name: 'Projeler', href: '/projects', icon: FolderOpen, permission: 'projects' as const },
  { name: 'Müşteriler', href: '/customers', icon: Users, permission: 'customers' as const },
  { name: 'Ürünler', href: '/products', icon: Package, permission: 'products' as const },
  { name: 'İşlemler', href: '/transactions', icon: DollarSign, permission: 'transactions' as const },
  { name: 'Teklifler', href: '/quotes', icon: FileText, permission: 'quotes' as const },
  // YENİ EKLENEN - Alt yüklenici yönetim sistemi
  { name: 'Alt Yükleniciler', href: '/subcontractors', icon: Wrench, permission: 'subcontractors' as const },
  { name: 'İş Sözleşmeleri', href: '/work-contracts', icon: ClipboardList, permission: 'workContracts' as const },
  { name: 'Alt Yüklenici Ödemeleri', href: '/subcontractor-payments', icon: CreditCard, permission: 'subcontractorPayments' as const },
  // YENİ EKLENEN - Dosya ve medya yönetimi
  { name: 'Dosya Yönetimi', href: '/media', icon: Folder, permission: 'mediaManagement' as const },
  // YENİ EKLENEN - Sistem ayarları
  { name: 'Ayarlar', href: '/settings', icon: Settings, permission: 'settings' as const },
  // YENİ EKLENEN - Kullanıcı yönetimi
  { name: 'Kullanıcılar', href: '/users', icon: UsersIcon, permission: 'users' as const },
  // YENİ EKLENEN - Log sistemi
  { name: 'Sistem Logları', href: '/logs', icon: Activity, permission: 'logs' as const },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logoicon.png" alt="ParkPicasso Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                ParkPicasso
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                // Permission kontrolü
                if (!hasPagePermission(user, item.permission)) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-nav-item ${
                      isActive(item.href) ? 'active' : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-300" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-300">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-white bg-indigo-600 hover:text-white hover:bg-indigo-400"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
