import { activityLogStorage } from './storage';
import { userStorage } from './storage';
import { ActivityLog } from '../types';

// Log helper functions
export const logger = {
  // Genel log oluşturma fonksiyonu
  log: (
    action: string,
    entityType: ActivityLog['entityType'],
    details: string,
    entityId?: string,
    entityName?: string,
    severity: ActivityLog['severity'] = 'info'
  ): void => {
    const currentUser = userStorage.getCurrentUser();
    
    if (!currentUser) {
      console.warn('Log oluşturulamadı: Kullanıcı oturumu bulunamadı');
      return;
    }

    const logData: Omit<ActivityLog, 'id' | 'timestamp'> = {
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityName,
      details,
      severity,
      ipAddress: typeof window !== 'undefined' ? '127.0.0.1' : undefined, // Basit IP
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    activityLogStorage.create(logData);
  },

  // CRUD işlemleri için özel log fonksiyonları
  logCreate: (entityType: ActivityLog['entityType'], entityName: string, entityId?: string): void => {
    logger.log(
      'Oluşturuldu',
      entityType,
      `${entityName} oluşturuldu`,
      entityId,
      entityName,
      'success'
    );
  },

  logUpdate: (entityType: ActivityLog['entityType'], entityName: string, entityId?: string): void => {
    logger.log(
      'Güncellendi',
      entityType,
      `${entityName} güncellendi`,
      entityId,
      entityName,
      'info'
    );
  },

  logDelete: (entityType: ActivityLog['entityType'], entityName: string, entityId?: string): void => {
    logger.log(
      'Silindi',
      entityType,
      `${entityName} silindi`,
      entityId,
      entityName,
      'warning'
    );
  },

  logView: (entityType: ActivityLog['entityType'], entityName: string, entityId?: string): void => {
    logger.log(
      'Görüntülendi',
      entityType,
      `${entityName} görüntülendi`,
      entityId,
      entityName,
      'info'
    );
  },

  // Sistem işlemleri için log fonksiyonları
  logLogin: (): void => {
    const currentUser = userStorage.getCurrentUser();
    if (currentUser) {
      logger.log(
        'Giriş Yapıldı',
        'system',
        `${currentUser.name} sisteme giriş yaptı`,
        undefined,
        undefined,
        'success'
      );
    }
  },

  logLogout: (): void => {
    const currentUser = userStorage.getCurrentUser();
    if (currentUser) {
      logger.log(
        'Çıkış Yapıldı',
        'system',
        `${currentUser.name} sistemden çıkış yaptı`,
        undefined,
        undefined,
        'info'
      );
    }
  },

  logExport: (dataType: string, recordCount: number): void => {
    logger.log(
      'Veri Export',
      'system',
      `${dataType} verisi export edildi (${recordCount} kayıt)`,
      undefined,
      undefined,
      'info'
    );
  },

  logImport: (dataType: string, recordCount: number): void => {
    logger.log(
      'Veri Import',
      'system',
      `${dataType} verisi import edildi (${recordCount} kayıt)`,
      undefined,
      undefined,
      'info'
    );
  },

  logBackup: (backupType: 'manual' | 'auto', recordCount: number): void => {
    logger.log(
      'Yedekleme',
      'system',
      `${backupType === 'manual' ? 'Manuel' : 'Otomatik'} yedekleme yapıldı (${recordCount} kayıt)`,
      undefined,
      undefined,
      'success'
    );
  },

  logRestore: (recordCount: number): void => {
    logger.log(
      'Geri Yükleme',
      'system',
      `Veri geri yüklendi (${recordCount} kayıt)`,
      undefined,
      undefined,
      'warning'
    );
  },

  // Kullanıcı yönetimi için log fonksiyonları
  logUserCreate: (userName: string, userRole: string): void => {
    logger.log(
      'Kullanıcı Oluşturuldu',
      'user',
      `${userName} kullanıcısı oluşturuldu (Rol: ${userRole})`,
      undefined,
      userName,
      'success'
    );
  },

  logUserUpdate: (userName: string, changes: string): void => {
    logger.log(
      'Kullanıcı Güncellendi',
      'user',
      `${userName} kullanıcısı güncellendi: ${changes}`,
      undefined,
      userName,
      'info'
    );
  },

  logUserDelete: (userName: string): void => {
    logger.log(
      'Kullanıcı Silindi',
      'user',
      `${userName} kullanıcısı silindi`,
      undefined,
      userName,
      'warning'
    );
  },

  logUserToggle: (userName: string, isActive: boolean): void => {
    logger.log(
      'Kullanıcı Durumu Değiştirildi',
      'user',
      `${userName} kullanıcısı ${isActive ? 'aktif' : 'pasif'} hale getirildi`,
      undefined,
      userName,
      'info'
    );
  },

  // Hata logları
  logError: (error: string, context?: string): void => {
    logger.log(
      'Hata',
      'system',
      context ? `${context}: ${error}` : error,
      undefined,
      undefined,
      'error'
    );
  },

  logWarning: (warning: string, context?: string): void => {
    logger.log(
      'Uyarı',
      'system',
      context ? `${context}: ${warning}` : warning,
      undefined,
      undefined,
      'warning'
    );
  },

  // Ödeme işlemleri için log fonksiyonları
  logPayment: (paymentType: 'income' | 'expense', amount: number, description: string, projectName?: string): void => {
    logger.log(
      'Ödeme İşlemi',
      'transaction',
      `${paymentType === 'income' ? 'Gelir' : 'Gider'} işlemi: ${amount} TL - ${description}${projectName ? ` (Proje: ${projectName})` : ''}`,
      undefined,
      description,
      'success'
    );
  },

  logSubcontractorPayment: (subcontractorName: string, amount: number, contractNumber: string): void => {
    logger.log(
      'Alt Yüklenici Ödemesi',
      'subcontractor_payment',
      `${subcontractorName} alt yüklenicisine ${amount} TL ödeme yapıldı (Sözleşme: ${contractNumber})`,
      undefined,
      subcontractorName,
      'success'
    );
  },

  // Proje işlemleri için log fonksiyonları
  logProjectStatusChange: (projectName: string, oldStatus: string, newStatus: string): void => {
    logger.log(
      'Proje Durumu Değişti',
      'project',
      `${projectName} projesi ${oldStatus} durumundan ${newStatus} durumuna geçirildi`,
      undefined,
      projectName,
      'info'
    );
  },

  // Teklif işlemleri için log fonksiyonları
  logQuoteStatusChange: (quoteNumber: string, oldStatus: string, newStatus: string): void => {
    logger.log(
      'Teklif Durumu Değişti',
      'quote',
      `${quoteNumber} numaralı teklif ${oldStatus} durumundan ${newStatus} durumuna geçirildi`,
      undefined,
      quoteNumber,
      'info'
    );
  }
};

// Log seviyeleri için renk kodları
export const logSeverityColors = {
  info: 'text-blue-600 bg-blue-50',
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50'
};

// Log seviyeleri için ikonlar
export const logSeverityIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌'
};

// Entity türleri için Türkçe isimler
export const entityTypeNames = {
  customer: 'Müşteri',
  product: 'Ürün',
  project: 'Proje',
  transaction: 'İşlem',
  quote: 'Teklif',
  subcontractor: 'Alt Yüklenici',
  work_contract: 'İş Sözleşmesi',
  subcontractor_payment: 'Alt Yüklenici Ödemesi',
  media_file: 'Medya Dosyası',
  user: 'Kullanıcı',
  system: 'Sistem'
};
