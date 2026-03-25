import React, { useState } from 'react';
import { Download, Upload, Database, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { backupService, BackupData } from '../utils/backup';
import { autoBackupService } from '../utils/autoBackup';
import { versionService } from '../utils/versioning';

const BackupManager: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [importOptions, setImportOptions] = useState({
    merge: false,
    overwrite: false
  });
  const [autoBackupSettings, setAutoBackupSettings] = useState(autoBackupService.settings);
  const [backupList, setBackupList] = useState(autoBackupService.getBackupList());
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'auto' | 'version'>('export');

  const dataTypes = [
    { key: 'customers', label: 'Müşteriler' },
    { key: 'products', label: 'Ürünler' },
    { key: 'projects', label: 'Projeler' },
    { key: 'transactions', label: 'İşlemler' },
    { key: 'quotes', label: 'Teklifler' },
    { key: 'subcontractors', label: 'Alt Yükleniciler' },
    { key: 'workContracts', label: 'İş Sözleşmeleri' },
    { key: 'subcontractorPayments', label: 'Alt Yüklenici Ödemeleri' },
    { key: 'mediaFiles', label: 'Medya Dosyaları' },
    { key: 'mediaFolders', label: 'Medya Klasörleri' },
    { key: 'mediaTags', label: 'Medya Etiketleri' },
    { key: 'mediaCategories', label: 'Medya Kategorileri' }
  ];

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      console.log('Export işlemi başlatılıyor...');
      const backupData = backupService.exportAllData();
      console.log('Backup data oluşturuldu:', backupData);
      backupService.downloadBackup(backupData);
      alert('Tüm veriler başarıyla export edildi!');
    } catch (error) {
      console.error('Export hatası:', error);
      alert(`Export sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSelective = async () => {
    if (selectedDataTypes.length === 0) {
      alert('Lütfen en az bir veri türü seçin');
      return;
    }

    setIsExporting(true);
    try {
      const backupData = backupService.exportSelectiveData(selectedDataTypes);
      backupService.downloadBackup(backupData as BackupData, `secici_yedek_${new Date().toISOString().split('T')[0]}.json`);
      alert(`Seçili veriler başarıyla export edildi! (${selectedDataTypes.length} veri türü)`);
    } catch (error) {
      console.error('Selective export hatası:', error);
      alert(`Export sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Lütfen bir yedek dosyası seçin');
      return;
    }

    setIsImporting(true);
    try {
      const result = await backupService.importBackup(importFile);
      
      if (result.success && result.data) {
        const restoreResult = backupService.restoreData(result.data, importOptions);
        
        if (restoreResult.success) {
          alert('Veri başarıyla geri yüklendi! Sayfayı yenileyin.');
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        } else {
          alert(`Geri yükleme hatası: ${restoreResult.message}`);
        }
      } else {
        alert(`Import hatası: ${result.message}`);
      }
    } catch (error) {
      console.error('Import hatası:', error);
      alert('Import sırasında bir hata oluştu');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleDataType = (type: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleAutoBackupSettingsChange = (key: string, value: any) => {
    const newSettings = { ...autoBackupSettings, [key]: value };
    setAutoBackupSettings(newSettings);
    autoBackupService.updateSettings(newSettings);
  };

  const handleRestoreLatestBackup = () => {
    if (typeof window !== 'undefined' && window.confirm('Son otomatik yedeği geri yüklemek istediğinizden emin misiniz? Bu işlem mevcut verilerinizi değiştirecektir.')) {
      const result = autoBackupService.restoreLatestBackup();
      if (result.success) {
        alert(result.message);
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        alert(result.message);
      }
    }
  };

  const handleDeleteBackup = (backupKey: string) => {
    if (typeof window !== 'undefined' && window.confirm('Bu yedeği silmek istediğinizden emin misiniz?')) {
      const success = autoBackupService.deleteBackup(backupKey);
      if (success) {
        setBackupList(autoBackupService.getBackupList());
        alert('Yedek başarıyla silindi');
      } else {
        alert('Yedek silinirken bir hata oluştu');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const versionInfo = versionService.getVersionInfo();
  const versionHistory = versionService.getVersionHistory();

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'export', label: 'Veri Export', icon: Download },
            { id: 'import', label: 'Veri Import', icon: Upload },
            { id: 'auto', label: 'Otomatik Yedekleme', icon: Clock },
            { id: 'version', label: 'Versiyon Bilgileri', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Veri Export
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Export Ediliyor...' : 'Tüm Veriyi Export Et'}</span>
              </button>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Seçici Export</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {dataTypes.map(type => (
                    <label key={type.key} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedDataTypes.includes(type.key)}
                        onChange={() => toggleDataType(type.key)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleExportSelective}
                  disabled={isExporting || selectedDataTypes.length === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? 'Export Ediliyor...' : 'Seçili Verileri Export Et'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Veri Import
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Yedek Dosyası Seç
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {importFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Seçilen dosya: {importFile.name} ({formatFileSize(importFile.size)})
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3">Import Seçenekleri</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importOptions.overwrite}
                      onChange={() => setImportOptions({ merge: false, overwrite: true })}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-medium">Mevcut veriyi üzerine yaz</span>
                      <p className="text-sm text-gray-500">Tüm mevcut veriler silinir ve yeni veriler yüklenir</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importOptions.merge}
                      onChange={() => setImportOptions({ merge: true, overwrite: false })}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-medium">Mevcut veriyle birleştir</span>
                      <p className="text-sm text-gray-500">Yeni veriler mevcut verilere eklenir</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleImport}
                disabled={isImporting || !importFile}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isImporting ? 'Import Ediliyor...' : 'Veriyi Import Et'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Backup Tab */}
      {activeTab === 'auto' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Otomatik Yedekleme Ayarları
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Otomatik Yedekleme</h4>
                  <p className="text-sm text-gray-500">Sistem otomatik olarak günlük yedek alır</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackupSettings.enabled}
                    onChange={(e) => handleAutoBackupSettingsChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Yedekleme Aralığı (saat)</label>
                  <input
                    type="number"
                    value={autoBackupSettings.interval / (60 * 60 * 1000)}
                    onChange={(e) => handleAutoBackupSettingsChange('interval', parseInt(e.target.value) * 60 * 60 * 1000)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="168"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maksimum Yedek Sayısı</label>
                  <input
                    type="number"
                    value={autoBackupSettings.maxBackups}
                    onChange={(e) => handleAutoBackupSettingsChange('maxBackups', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Otomatik Yedekler</h3>
            
            {backupList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz otomatik yedek bulunmuyor</p>
            ) : (
              <div className="space-y-3">
                {backupList.map((backup) => (
                  <div key={backup.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{backup.date.toLocaleString('tr-TR')}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(backup.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteBackup(backup.key)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={handleRestoreLatestBackup}
                disabled={backupList.length === 0}
                className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Son Yedeği Geri Yükle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version Tab */}
      {activeTab === 'version' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Sistem Versiyonu
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Mevcut Versiyon</h4>
                <p className="text-2xl font-bold text-blue-600">{versionInfo.current}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Desteklenen Versiyonlar</h4>
                <p className="text-sm text-green-600">{versionInfo.supported.length} versiyon</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Migration Sayısı</h4>
                <p className="text-sm text-purple-600">{versionInfo.migrations.length} migration</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Versiyon Geçmişi</h4>
              <div className="space-y-4">
                {versionHistory.map((version, index) => (
                  <div key={version.version} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-lg">v{version.version}</h5>
                      <span className="text-sm text-gray-500">{version.date}</span>
                    </div>
                    <ul className="space-y-1">
                      {version.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager;
