import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Palette, Database, Info } from 'lucide-react';
import BackupManager from '../components/BackupManager';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'general' | 'backup' | 'security' | 'notifications' | 'appearance' | 'about'>('general');

  const sections = [
    { id: 'general', label: 'Genel Ayarlar', icon: Settings },
    { id: 'backup', label: 'Yedekleme ve Veri', icon: Database },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'about', label: 'Hakkında', icon: Info }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistem Ayarları</h1>
        <p className="text-gray-600">Sisteminizi yönetin ve özelleştirin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <nav className="p-4">
              <div className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Genel Ayarlar
                </h2>
                
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-4 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Kullanıcı Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          disabled
                          className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-posta
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kullanıcı Adı
                        </label>
                        <input
                          type="text"
                          value={user?.username || ''}
                          disabled
                          className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rol
                        </label>
                        <input
                          type="text"
                          value={user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                          disabled
                          className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Settings */}
                  <div>
                    <h3 className="font-medium mb-4">Sistem Ayarları</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Otomatik Kaydetme</h4>
                          <p className="text-sm text-gray-500">Değişiklikler otomatik olarak kaydedilir</p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-green-600 font-medium">Aktif</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Gelişmiş Raporlama</h4>
                          <p className="text-sm text-gray-500">Detaylı raporlar ve analizler</p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-green-600 font-medium">Aktif</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeSection === 'backup' && (
            <div>
              <BackupManager />
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Güvenlik Ayarları
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Oturum Güvenliği</h4>
                      <p className="text-sm text-gray-500">Oturum süresi ve güvenlik ayarları</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-green-600 font-medium">Güvenli</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Veri Şifreleme</h4>
                      <p className="text-sm text-gray-500">Yerel veriler şifrelenerek saklanır</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-green-600 font-medium">Aktif</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Yedekleme Güvenliği</h4>
                      <p className="text-sm text-gray-500">Yedek dosyaları güvenli şekilde saklanır</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-green-600 font-medium">Aktif</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Bildirim Ayarları
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sistem Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Sistem güncellemeleri ve önemli duyurular</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Yedekleme Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Otomatik yedekleme durumu bildirimleri</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Hata Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Sistem hataları ve uyarıları</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Görünüm Ayarları
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Tema</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border-2 border-blue-500 rounded-lg cursor-pointer">
                        <div className="w-full h-16 bg-white border rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Açık Tema</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-gray-400">
                        <div className="w-full h-16 bg-gray-800 border rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Koyu Tema</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-gray-400">
                        <div className="w-full h-16 bg-blue-50 border rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Otomatik</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Dil</h3>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Tarih Formatı</h3>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="dd/mm/yyyy">GG/AA/YYYY</option>
                      <option value="mm/dd/yyyy">AA/GG/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-AA-GG</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Settings */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Hakkında
                </h2>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">PP</span>
                    </div>
                    <h3 className="text-xl font-bold">ParkPicasso</h3>
                    <p className="text-gray-600">Proje Yönetim Sistemi</p>
                    <p className="text-sm text-gray-500 mt-2">Versiyon 1.2.0</p>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Sistem Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sistem Versiyonu:</span>
                        <span className="font-medium">1.2.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Son Güncelleme:</span>
                        <span className="font-medium">Eylül 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tarayıcı:</span>
                        <span className="font-medium">{typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Bilinmiyor'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-medium">{typeof navigator !== 'undefined' ? navigator.platform : 'Bilinmiyor'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Özellikler</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Müşteri Yönetimi</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Proje Takibi</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Alt Yüklenici Yönetimi</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Dosya ve Medya Yönetimi</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Otomatik Yedekleme</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Raporlama ve Analiz</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
