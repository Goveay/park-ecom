import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Shield, Users, Eye, EyeOff, Settings, Key, RefreshCw } from 'lucide-react';
import { usersStorage } from '../utils/storage';
import { logger } from '../utils/logger';
import { User, UserPermissions } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultPermissionsForRole, permissionGroups } from '../utils/permissions';
import { hashPassword, validatePasswordStrength, generateRandomPassword } from '../utils/password';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    role: 'user' as User['role'],
    isActive: true,
    permissions: getDefaultPermissionsForRole('user'),
    mustChangePassword: true
  });
  const [showPermissions, setShowPermissions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Sadece admin kullanıcılar bu sayfaya erişebilir
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-500">Bu sayfaya erişmek için yönetici yetkisi gereklidir.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = usersStorage.getAll();
    setUsers(allUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Şifre validasyonu (yeni kullanıcı için)
    if (!editingUser && formData.password) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        setPasswordErrors(passwordValidation.errors);
        return;
      }
    }
    
    if (editingUser) {
      // Kullanıcı güncelleme - şifre değişikliği yoksa mevcut şifreyi koru
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Şifre alanı boşsa güncelleme
      } else {
        updateData.password = hashPassword(updateData.password);
        updateData.passwordChangedAt = new Date().toISOString();
      }
      
      const updatedUser = usersStorage.update(editingUser.id, updateData);
      if (updatedUser) {
        logger.logUserUpdate(updatedUser.name, `Kullanıcı bilgileri güncellendi`);
        loadUsers();
        resetForm();
      }
    } else {
      // Yeni kullanıcı oluşturma
      const newUserData = {
        ...formData,
        password: hashPassword(formData.password)
      };
      const newUser = usersStorage.create(newUserData);
      if (newUser) {
        logger.logUserCreate(newUser.name, newUser.role);
        loadUsers();
        resetForm();
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      password: '', // Şifre alanını boş bırak
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`${user.name} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      if (usersStorage.delete(user.id)) {
        logger.logUserDelete(user.name);
        loadUsers();
      }
    }
  };

  const handleToggleActive = (user: User) => {
    if (usersStorage.toggleActive(user.id)) {
      logger.logUserToggle(user.name, !user.isActive);
      loadUsers();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      password: '',
      role: 'user',
      isActive: true,
      permissions: getDefaultPermissionsForRole('user'),
      mustChangePassword: true
    });
    setEditingUser(null);
    setIsModalOpen(false);
    setShowPermissions(false);
    setShowPassword(false);
    setPasswordErrors([]);
  };

  const resetPasswordForm = () => {
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordFields({
      current: false,
      new: false,
      confirm: false
    });
    setSelectedUser(null);
    setIsPasswordModalOpen(false);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    // Şifre validasyonu
    const passwordValidation = validatePasswordStrength(passwordFormData.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      return;
    }
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordErrors(['Yeni şifreler eşleşmiyor']);
      return;
    }
    
    // Mevcut şifre kontrolü (basit hash karşılaştırması)
    if (hashPassword(passwordFormData.currentPassword) !== selectedUser.password) {
      setPasswordErrors(['Mevcut şifre yanlış']);
      return;
    }
    
    // Şifreyi güncelle
    const updatedUser = usersStorage.update(selectedUser.id, {
      password: hashPassword(passwordFormData.newPassword),
      passwordChangedAt: new Date().toISOString(),
      mustChangePassword: false
    });
    
    if (updatedUser) {
      logger.logUserUpdate(updatedUser.name, 'Şifre değiştirildi');
      loadUsers();
      resetPasswordForm();
      alert('Şifre başarıyla değiştirildi');
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true);
  };

  const handleRoleChange = (newRole: User['role']) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: getDefaultPermissionsForRole(newRole)
    });
  };

  const handlePermissionChange = (type: 'pages' | 'actions', key: string, value: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [type]: {
          ...formData.permissions[type],
          [key]: value
        }
      }
    });
  };

  const getRoleBadge = (role: User['role']) => {
    const roleConfig = {
      admin: { label: 'Yönetici', color: 'bg-red-100 text-red-800' },
      manager: { label: 'Müdür', color: 'bg-blue-100 text-blue-800' },
      user: { label: 'Kullanıcı', color: 'bg-green-100 text-green-800' }
    };
    
    const config = roleConfig[role];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600">Sistem kullanıcılarını yönetin</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Yöneticiler</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pasif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => !u.isActive).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Kullanıcı Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Hiç giriş yapmamış'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleChangePassword(user)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Şifre Değiştir"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={user.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                        title={user.isActive ? "Pasif Yap" : "Aktif Yap"}
                      >
                        {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Şifre Alanı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? 'Yeni Şifre (boş bırakırsanız değişmez)' : 'Şifre'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setPasswordErrors([]);
                      }}
                      className="w-full p-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={editingUser ? 'Yeni şifre girin' : 'Güçlü bir şifre oluşturun'}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {!editingUser && (
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-gray-400 hover:text-gray-600"
                          title="Rastgele şifre oluştur"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {passwordErrors.length > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      {passwordErrors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                  {formData.password && !editingUser && (
                    <div className="mt-2 text-xs text-gray-500">
                      Şifre güçlülük kontrolü: {validatePasswordStrength(formData.password).isValid ? 
                        <span className="text-green-600">✓ Güçlü</span> : 
                        <span className="text-red-600">✗ Zayıf</span>
                      }
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as User['role'])}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">Kullanıcı</option>
                    <option value="manager">Müdür</option>
                    <option value="admin">Yönetici</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Aktif
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mustChangePassword"
                      checked={formData.mustChangePassword}
                      onChange={(e) => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mustChangePassword" className="ml-2 block text-sm text-gray-900">
                      İlk girişte şifre değiştirme zorunlu
                    </label>
                  </div>
                </div>
                
                {/* Permissions Toggle */}
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Yetki Ayarları
                  </label>
                  {formData.role === 'admin' ? (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Yönetici - Tüm Yetkiler</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPermissions(!showPermissions)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">
                        {showPermissions ? 'Gizle' : 'Düzenle'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Permissions Panel */}
                {showPermissions && formData.role !== 'admin' && (
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {permissionGroups.pages.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {permissionGroups.pages.permissions.map((permission) => (
                        <label key={permission.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions.pages[permission.key as keyof UserPermissions['pages']]}
                            onChange={(e) => handlePermissionChange('pages', permission.key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{permission.label}</span>
                        </label>
                      ))}
                    </div>

                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {permissionGroups.actions.title}
                    </h4>
                    {permissionGroups.actions.groups.map((group) => (
                      <div key={group.title} className="mb-3">
                        <h5 className="text-xs font-medium text-gray-600 mb-2">{group.title}</h5>
                        <div className="grid grid-cols-1 gap-1 ml-2">
                          {group.permissions.map((permission) => (
                            <label key={permission.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.permissions.actions[permission.key as keyof UserPermissions['actions']]}
                                onChange={(e) => handlePermissionChange('actions', permission.key, e.target.checked)}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-xs text-gray-600">{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Güncelle' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Şifre Değiştirme Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Şifre Değiştir - {selectedUser.name}
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mevcut Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordFields.current ? 'text' : 'password'}
                      required
                      value={passwordFormData.currentPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                      className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields({ ...showPasswordFields, current: !showPasswordFields.current })}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswordFields.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordFields.new ? 'text' : 'password'}
                      required
                      value={passwordFormData.newPassword}
                      onChange={(e) => {
                        setPasswordFormData({ ...passwordFormData, newPassword: e.target.value });
                        setPasswordErrors([]);
                      }}
                      className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields({ ...showPasswordFields, new: !showPasswordFields.new })}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswordFields.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifre (Tekrar)
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordFields.confirm ? 'text' : 'password'}
                      required
                      value={passwordFormData.confirmPassword}
                      onChange={(e) => {
                        setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value });
                        setPasswordErrors([]);
                      }}
                      className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields({ ...showPasswordFields, confirm: !showPasswordFields.confirm })}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswordFields.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {passwordErrors.length > 0 && (
                  <div className="text-sm text-red-600">
                    {passwordErrors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
                
                {passwordFormData.newPassword && (
                  <div className="text-xs text-gray-500">
                    Şifre güçlülük kontrolü: {validatePasswordStrength(passwordFormData.newPassword).isValid ? 
                      <span className="text-green-600">✓ Güçlü</span> : 
                      <span className="text-red-600">✗ Zayıf</span>
                    }
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetPasswordForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
