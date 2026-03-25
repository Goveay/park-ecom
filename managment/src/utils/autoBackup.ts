import { backupService } from './backup';

export const autoBackupService = {
  // Otomatik yedekleme ayarları
  settings: {
    enabled: false, // Geçici olarak devre dışı
    interval: 24 * 60 * 60 * 1000, // 24 saat
    maxBackups: 7, // Son 7 yedeği tut
    backupKey: 'auto_backup_settings'
  },

  // Otomatik yedekleme başlat
  startAutoBackup(): void {
    if (!this.settings.enabled) return;

    // İlk yedekleme
    this.performAutoBackup();

    // Periyodik yedekleme
    setInterval(() => {
      this.performAutoBackup();
    }, this.settings.interval);
  },

  // Otomatik yedekleme yap
  performAutoBackup(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const backupData = backupService.exportAllData();
      const backupKey = `auto_backup_${Date.now()}`;
      
      // localStorage'a kaydet
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Eski yedekleri temizle
      this.cleanOldBackups();
      
      console.log('Otomatik yedekleme tamamlandı:', backupKey);
    } catch (error) {
      console.error('Otomatik yedekleme hatası:', error);
    }
  },

  // Eski yedekleri temizle
  cleanOldBackups(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('auto_backup_'))
      .sort((a, b) => {
        const timestampA = parseInt(a.split('_')[2]);
        const timestampB = parseInt(b.split('_')[2]);
        return timestampB - timestampA; // Yeniden eskiye
      });

    // Fazla yedekleri sil
    if (backupKeys.length > this.settings.maxBackups) {
      const keysToDelete = backupKeys.slice(this.settings.maxBackups);
      keysToDelete.forEach(key => localStorage.removeItem(key));
    }
  },

  // Son yedeği geri yükle
  restoreLatestBackup(): { success: boolean; message: string } {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { success: false, message: 'Tarayıcı ortamı gerekli' };
    }
    
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('auto_backup_'))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_')[2]);
          const timestampB = parseInt(b.split('_')[2]);
          return timestampB - timestampA;
        });

      if (backupKeys.length === 0) {
        return { success: false, message: 'Otomatik yedek bulunamadı' };
      }

      const latestBackupKey = backupKeys[0];
      const backupData = JSON.parse(localStorage.getItem(latestBackupKey) || '{}');
      
      const result = backupService.restoreData(backupData, { overwrite: true });
      
      if (result.success) {
        return { success: true, message: `Son yedek geri yüklendi: ${new Date(parseInt(latestBackupKey.split('_')[2])).toLocaleString('tr-TR')}` };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, message: `Yedek geri yüklenirken hata: ${error}` };
    }
  },

  // Yedekleme ayarlarını güncelle
  updateSettings(newSettings: Partial<typeof autoBackupService.settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.settings.backupKey, JSON.stringify(this.settings));
    }
  },

  // Yedekleme ayarlarını yükle
  loadSettings(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    const saved = localStorage.getItem(this.settings.backupKey);
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  },

  // Mevcut yedekleri listele
  getBackupList(): Array<{ key: string; date: Date; size: number }> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('auto_backup_'))
      .map(key => {
        const timestamp = parseInt(key.split('_')[2]);
        const data = localStorage.getItem(key);
        const size = data ? new Blob([data]).size : 0;
        return {
          key,
          date: new Date(timestamp),
          size
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return backupKeys;
  },

  // Belirli yedeği sil
  deleteBackup(backupKey: string): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    try {
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.error('Yedek silme hatası:', error);
      return false;
    }
  }
};

// Sayfa yüklendiğinde otomatik yedekleme ayarlarını yükle ve başlat
// Bu kod sadece tarayıcı ortamında çalışmalı ve DOM yüklendikten sonra
if (typeof window !== 'undefined') {
  // DOM yüklendikten sonra çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      autoBackupService.loadSettings();
      autoBackupService.startAutoBackup();
    });
  } else {
    // DOM zaten yüklenmiş
    autoBackupService.loadSettings();
    autoBackupService.startAutoBackup();
  }
}
