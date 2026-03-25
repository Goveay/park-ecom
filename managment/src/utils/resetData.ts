// Sistem verilerini sıfırlama utility fonksiyonları

import { storage } from './storage';

// Tüm verileri temizle
export const clearAllData = () => {
  const keys = [
    'management_customers',
    'management_products', 
    'management_projects',
    'management_transactions',
    'management_quotes',
    'management_subcontractors',
    'management_work_contracts',
    'management_subcontractor_payments',
    'management_media_files',
    'management_media_folders',
    'management_media_tags',
    'management_media_categories',
    'management_media_permissions',
    'management_media_versions',
    'management_activity_logs'
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('Tüm veriler temizlendi');
};

// Sadece iş verilerini temizle (kullanıcıları ve kategorileri koru)
export const clearBusinessData = () => {
  const keys = [
    'management_customers',
    'management_products', 
    'management_projects',
    'management_transactions',
    'management_quotes',
    'management_subcontractors',
    'management_work_contracts',
    'management_subcontractor_payments',
    'management_media_files',
    'management_media_folders',
    'management_media_tags',
    'management_media_categories',
    'management_media_permissions',
    'management_media_versions',
    'management_activity_logs'
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('İş verileri temizlendi');
};

// Kategori kullanım sayılarını sıfırla
export const resetCategoryUsage = () => {
  const categories = storage.get('management_transaction_categories') || [];
  const resetCategories = categories.map(category => ({
    ...category,
    usageCount: 0,
    updatedAt: new Date().toISOString()
  }));
  
  storage.set('management_transaction_categories', resetCategories);
  console.log('Kategori kullanım sayıları sıfırlandı');
};

// Sistem durumunu kontrol et
export const getSystemStatus = () => {
  const status = {
    hasUsers: !!storage.get('management_users')?.length,
    hasCategories: !!storage.get('management_transaction_categories')?.length,
    hasCustomers: !!storage.get('management_customers')?.length,
    hasProducts: !!storage.get('management_products')?.length,
    hasProjects: !!storage.get('management_projects')?.length,
    hasTransactions: !!storage.get('management_transactions')?.length,
    hasQuotes: !!storage.get('management_quotes')?.length,
    hasSubcontractors: !!storage.get('management_subcontractors')?.length,
    hasWorkContracts: !!storage.get('management_work_contracts')?.length,
    hasSubcontractorPayments: !!storage.get('management_subcontractor_payments')?.length,
    hasMediaFiles: !!storage.get('management_media_files')?.length,
    hasActivityLogs: !!storage.get('management_activity_logs')?.length,
  };

  return status;
};

// Sistemin temiz başlangıç durumunda olup olmadığını kontrol et
export const isCleanStart = () => {
  const status = getSystemStatus();
  
  // Temiz başlangıç: sadece kullanıcılar ve kategoriler olmalı
  return status.hasUsers && 
         status.hasCategories && 
         !status.hasCustomers && 
         !status.hasProducts && 
         !status.hasProjects && 
         !status.hasTransactions && 
         !status.hasQuotes && 
         !status.hasSubcontractors && 
         !status.hasWorkContracts && 
         !status.hasSubcontractorPayments && 
         !status.hasMediaFiles;
};

// Sistemi tekrar ilk kurulum durumuna getir
export const resetToInitialState = () => {
  // Sistem başlatıldı işaretini kaldır
  localStorage.removeItem('management_system_initialized');
  
  // Tüm verileri temizle
  clearAllData();
  
  console.log('🔄 Sistem ilk kurulum durumuna sıfırlandı');
  console.log('📋 Sayfayı yenileyin ve sisteme giriş yapın');
};
