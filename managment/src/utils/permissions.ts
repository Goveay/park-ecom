import { User, UserPermissions } from '../types';

// Varsayılan permission şablonları
export const defaultPermissions: Record<User['role'], UserPermissions> = {
  admin: {
    pages: {
      dashboard: true,
      customers: true,
      products: true,
      projects: true,
      transactions: true,
      quotes: true,
      subcontractors: true,
      workContracts: true,
      subcontractorPayments: true,
      mediaManagement: true,
      users: true,
      logs: true,
      settings: true,
    },
    actions: {
      // Müşteri işlemleri
      customerCreate: true,
      customerEdit: true,
      customerDelete: true,
      customerView: true,
      
      // Ürün işlemleri
      productCreate: true,
      productEdit: true,
      productDelete: true,
      productView: true,
      
      // Proje işlemleri
      projectCreate: true,
      projectEdit: true,
      projectDelete: true,
      projectView: true,
      
      // İşlem işlemleri
      transactionCreate: true,
      transactionEdit: true,
      transactionDelete: true,
      transactionView: true,
      
      // Teklif işlemleri
      quoteCreate: true,
      quoteEdit: true,
      quoteDelete: true,
      quoteView: true,
      quoteSend: true,
      
      // Alt yüklenici işlemleri
      subcontractorCreate: true,
      subcontractorEdit: true,
      subcontractorDelete: true,
      subcontractorView: true,
      
      // İş sözleşmesi işlemleri
      workContractCreate: true,
      workContractEdit: true,
      workContractDelete: true,
      workContractView: true,
      
      // Alt yüklenici ödeme işlemleri
      subcontractorPaymentCreate: true,
      subcontractorPaymentEdit: true,
      subcontractorPaymentDelete: true,
      subcontractorPaymentView: true,
      
      // Medya yönetimi işlemleri
      mediaUpload: true,
      mediaEdit: true,
      mediaDelete: true,
      mediaView: true,
      mediaDownload: true,
      
      // Kullanıcı işlemleri
      userCreate: true,
      userEdit: true,
      userDelete: true,
      userView: true,
      
      // Sistem işlemleri
      systemSettings: true,
      systemBackup: true,
      systemLogs: true,
    },
  },
  manager: {
    pages: {
      dashboard: true,
      customers: true,
      products: true,
      projects: true,
      transactions: true,
      quotes: true,
      subcontractors: true,
      workContracts: true,
      subcontractorPayments: true,
      mediaManagement: true,
      users: false,
      logs: true,
      settings: false,
    },
    actions: {
      // Müşteri işlemleri
      customerCreate: true,
      customerEdit: true,
      customerDelete: false,
      customerView: true,
      
      // Ürün işlemleri
      productCreate: true,
      productEdit: true,
      productDelete: false,
      productView: true,
      
      // Proje işlemleri
      projectCreate: true,
      projectEdit: true,
      projectDelete: false,
      projectView: true,
      
      // İşlem işlemleri
      transactionCreate: true,
      transactionEdit: true,
      transactionDelete: false,
      transactionView: true,
      
      // Teklif işlemleri
      quoteCreate: true,
      quoteEdit: true,
      quoteDelete: false,
      quoteView: true,
      quoteSend: true,
      
      // Alt yüklenici işlemleri
      subcontractorCreate: true,
      subcontractorEdit: true,
      subcontractorDelete: false,
      subcontractorView: true,
      
      // İş sözleşmesi işlemleri
      workContractCreate: true,
      workContractEdit: true,
      workContractDelete: false,
      workContractView: true,
      
      // Alt yüklenici ödeme işlemleri
      subcontractorPaymentCreate: true,
      subcontractorPaymentEdit: true,
      subcontractorPaymentDelete: false,
      subcontractorPaymentView: true,
      
      // Medya yönetimi işlemleri
      mediaUpload: true,
      mediaEdit: true,
      mediaDelete: false,
      mediaView: true,
      mediaDownload: true,
      
      // Kullanıcı işlemleri
      userCreate: false,
      userEdit: false,
      userDelete: false,
      userView: false,
      
      // Sistem işlemleri
      systemSettings: false,
      systemBackup: false,
      systemLogs: true,
    },
  },
  user: {
    pages: {
      dashboard: true,
      customers: true,
      products: true,
      projects: true,
      transactions: true,
      quotes: true,
      subcontractors: true,
      workContracts: true,
      subcontractorPayments: true,
      mediaManagement: true,
      users: false,
      logs: false,
      settings: false,
    },
    actions: {
      // Müşteri işlemleri
      customerCreate: false,
      customerEdit: false,
      customerDelete: false,
      customerView: true,
      
      // Ürün işlemleri
      productCreate: false,
      productEdit: false,
      productDelete: false,
      productView: true,
      
      // Proje işlemleri
      projectCreate: false,
      projectEdit: false,
      projectDelete: false,
      projectView: true,
      
      // İşlem işlemleri
      transactionCreate: false,
      transactionEdit: false,
      transactionDelete: false,
      transactionView: true,
      
      // Teklif işlemleri
      quoteCreate: false,
      quoteEdit: false,
      quoteDelete: false,
      quoteView: true,
      quoteSend: false,
      
      // Alt yüklenici işlemleri
      subcontractorCreate: false,
      subcontractorEdit: false,
      subcontractorDelete: false,
      subcontractorView: true,
      
      // İş sözleşmesi işlemleri
      workContractCreate: false,
      workContractEdit: false,
      workContractDelete: false,
      workContractView: true,
      
      // Alt yüklenici ödeme işlemleri
      subcontractorPaymentCreate: false,
      subcontractorPaymentEdit: false,
      subcontractorPaymentDelete: false,
      subcontractorPaymentView: true,
      
      // Medya yönetimi işlemleri
      mediaUpload: false,
      mediaEdit: false,
      mediaDelete: false,
      mediaView: true,
      mediaDownload: true,
      
      // Kullanıcı işlemleri
      userCreate: false,
      userEdit: false,
      userDelete: false,
      userView: false,
      
      // Sistem işlemleri
      systemSettings: false,
      systemBackup: false,
      systemLogs: false,
    },
  },
};

// Permission kontrol fonksiyonları
export const hasPagePermission = (user: User | null, page: keyof UserPermissions['pages']): boolean => {
  if (!user || !user.isActive) return false;
  
  // Admin kullanıcısı her zaman tüm sayfalara erişebilir
  if (user.role === 'admin') return true;
  
  return user.permissions.pages[page];
};

export const hasActionPermission = (user: User | null, action: keyof UserPermissions['actions']): boolean => {
  if (!user || !user.isActive) return false;
  
  // Admin kullanıcısı her zaman tüm işlemleri yapabilir
  if (user.role === 'admin') return true;
  
  return user.permissions.actions[action];
};

// Kullanıcı oluştururken varsayılan permissions atama
export const getDefaultPermissionsForRole = (role: User['role']): UserPermissions => {
  return JSON.parse(JSON.stringify(defaultPermissions[role]));
};

// Permission güncelleme yardımcı fonksiyonu
export const updateUserPermissions = (user: User, newPermissions: Partial<UserPermissions>): User => {
  return {
    ...user,
    permissions: {
      pages: { ...user.permissions.pages, ...newPermissions.pages },
      actions: { ...user.permissions.actions, ...newPermissions.actions },
    },
  };
};

// Rol değiştiğinde permissions'ı sıfırla
export const resetPermissionsForRole = (user: User, newRole: User['role']): User => {
  return {
    ...user,
    role: newRole,
    permissions: getDefaultPermissionsForRole(newRole),
  };
};

// Admin kullanıcısının tüm yetkilere sahip olduğunu garanti et
export const ensureAdminHasAllPermissions = (user: User): User => {
  if (user.role === 'admin') {
    return {
      ...user,
      permissions: getDefaultPermissionsForRole('admin')
    };
  }
  return user;
};

// Tüm admin kullanıcılarını kontrol et ve gerekirse güncelle
export const ensureAllAdminsHaveFullPermissions = (users: User[]): User[] => {
  return users.map(user => ensureAdminHasAllPermissions(user));
};

// Permission grupları
export const permissionGroups = {
  pages: {
    title: 'Sayfa Erişim Yetkileri',
    permissions: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'customers', label: 'Müşteriler' },
      { key: 'products', label: 'Ürünler' },
      { key: 'projects', label: 'Projeler' },
      { key: 'transactions', label: 'İşlemler' },
      { key: 'quotes', label: 'Teklifler' },
      { key: 'subcontractors', label: 'Alt Yükleniciler' },
      { key: 'workContracts', label: 'İş Sözleşmeleri' },
      { key: 'subcontractorPayments', label: 'Alt Yüklenici Ödemeleri' },
      { key: 'mediaManagement', label: 'Medya Yönetimi' },
      { key: 'users', label: 'Kullanıcılar' },
      { key: 'logs', label: 'Loglar' },
      { key: 'settings', label: 'Ayarlar' },
    ],
  },
  actions: {
    title: 'İşlem Yetkileri',
    groups: [
      {
        title: 'Müşteri İşlemleri',
        permissions: [
          { key: 'customerView', label: 'Müşteri Görüntüleme' },
          { key: 'customerCreate', label: 'Müşteri Oluşturma' },
          { key: 'customerEdit', label: 'Müşteri Düzenleme' },
          { key: 'customerDelete', label: 'Müşteri Silme' },
        ],
      },
      {
        title: 'Ürün İşlemleri',
        permissions: [
          { key: 'productView', label: 'Ürün Görüntüleme' },
          { key: 'productCreate', label: 'Ürün Oluşturma' },
          { key: 'productEdit', label: 'Ürün Düzenleme' },
          { key: 'productDelete', label: 'Ürün Silme' },
        ],
      },
      {
        title: 'Proje İşlemleri',
        permissions: [
          { key: 'projectView', label: 'Proje Görüntüleme' },
          { key: 'projectCreate', label: 'Proje Oluşturma' },
          { key: 'projectEdit', label: 'Proje Düzenleme' },
          { key: 'projectDelete', label: 'Proje Silme' },
        ],
      },
      {
        title: 'İşlem İşlemleri',
        permissions: [
          { key: 'transactionView', label: 'İşlem Görüntüleme' },
          { key: 'transactionCreate', label: 'İşlem Oluşturma' },
          { key: 'transactionEdit', label: 'İşlem Düzenleme' },
          { key: 'transactionDelete', label: 'İşlem Silme' },
        ],
      },
      {
        title: 'Teklif İşlemleri',
        permissions: [
          { key: 'quoteView', label: 'Teklif Görüntüleme' },
          { key: 'quoteCreate', label: 'Teklif Oluşturma' },
          { key: 'quoteEdit', label: 'Teklif Düzenleme' },
          { key: 'quoteDelete', label: 'Teklif Silme' },
          { key: 'quoteSend', label: 'Teklif Gönderme' },
        ],
      },
      {
        title: 'Alt Yüklenici İşlemleri',
        permissions: [
          { key: 'subcontractorView', label: 'Alt Yüklenici Görüntüleme' },
          { key: 'subcontractorCreate', label: 'Alt Yüklenici Oluşturma' },
          { key: 'subcontractorEdit', label: 'Alt Yüklenici Düzenleme' },
          { key: 'subcontractorDelete', label: 'Alt Yüklenici Silme' },
        ],
      },
      {
        title: 'İş Sözleşmesi İşlemleri',
        permissions: [
          { key: 'workContractView', label: 'İş Sözleşmesi Görüntüleme' },
          { key: 'workContractCreate', label: 'İş Sözleşmesi Oluşturma' },
          { key: 'workContractEdit', label: 'İş Sözleşmesi Düzenleme' },
          { key: 'workContractDelete', label: 'İş Sözleşmesi Silme' },
        ],
      },
      {
        title: 'Alt Yüklenici Ödeme İşlemleri',
        permissions: [
          { key: 'subcontractorPaymentView', label: 'Ödeme Görüntüleme' },
          { key: 'subcontractorPaymentCreate', label: 'Ödeme Oluşturma' },
          { key: 'subcontractorPaymentEdit', label: 'Ödeme Düzenleme' },
          { key: 'subcontractorPaymentDelete', label: 'Ödeme Silme' },
        ],
      },
      {
        title: 'Medya Yönetimi İşlemleri',
        permissions: [
          { key: 'mediaView', label: 'Medya Görüntüleme' },
          { key: 'mediaUpload', label: 'Medya Yükleme' },
          { key: 'mediaEdit', label: 'Medya Düzenleme' },
          { key: 'mediaDelete', label: 'Medya Silme' },
          { key: 'mediaDownload', label: 'Medya İndirme' },
        ],
      },
      {
        title: 'Kullanıcı İşlemleri',
        permissions: [
          { key: 'userView', label: 'Kullanıcı Görüntüleme' },
          { key: 'userCreate', label: 'Kullanıcı Oluşturma' },
          { key: 'userEdit', label: 'Kullanıcı Düzenleme' },
          { key: 'userDelete', label: 'Kullanıcı Silme' },
        ],
      },
      {
        title: 'Sistem İşlemleri',
        permissions: [
          { key: 'systemSettings', label: 'Sistem Ayarları' },
          { key: 'systemBackup', label: 'Sistem Yedekleme' },
          { key: 'systemLogs', label: 'Sistem Logları' },
        ],
      },
    ],
  },
};
