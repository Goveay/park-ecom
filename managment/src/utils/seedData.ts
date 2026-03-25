import { v4 as uuidv4 } from 'uuid';
import { User, Customer, Product, Project, Transaction, Quote, Contact, MediaFile, MediaFolder, MediaTag, MediaCategory, TransactionCategory, Subcontractor, WorkContract, SubcontractorPayment } from '../types';
import { storage } from './storage';
import { getDefaultPermissionsForRole, ensureAllAdminsHaveFullPermissions } from './permissions';
import { hashPassword } from './password';

// Seed users - Sadece admin kullanıcısı
export const seedUsers: User[] = [
  {
    id: 'admin-user-id-12345', // Sabit ID - her build'de aynı kalacak
    username: 'admin',
    email: 'admin@example.com',
    name: 'Sistem Yöneticisi',
    password: 'admin123', // Geçici çözüm - hash yerine plain text
    role: 'admin',
    isActive: true,
    permissions: getDefaultPermissionsForRole('admin'),
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Varsayılan admin kullanıcısı (geriye uyumluluk için)
export const seedUser: User = seedUsers[0];

// Seed transaction categories - Sadece temel kategoriler
export const seedTransactionCategories: TransactionCategory[] = [
  // Temel Gelir Kategorileri
  {
    id: uuidv4(),
    name: 'Proje Geliri',
    type: 'income',
    description: 'Proje bazlı gelirler',
    color: '#10B981',
    icon: '💰',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Hizmet Geliri',
    type: 'income',
    description: 'Hizmet bazlı gelirler',
    color: '#059669',
    icon: '💼',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Diğer Gelir',
    type: 'income',
    description: 'Diğer gelir türleri',
    color: '#A7F3D0',
    icon: '📈',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Temel Gider Kategorileri
  {
    id: uuidv4(),
    name: 'Malzeme',
    type: 'expense',
    description: 'Proje malzemeleri',
    color: '#EF4444',
    icon: '🧱',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'İşçilik',
    type: 'expense',
    description: 'İşçilik giderleri',
    color: '#DC2626',
    icon: '👷',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Ekipman',
    type: 'expense',
    description: 'Ekipman giderleri',
    color: '#B91C1C',
    icon: '🔨',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Ulaşım',
    type: 'expense',
    description: 'Ulaşım giderleri',
    color: '#991B1B',
    icon: '🚗',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Ofis Giderleri',
    type: 'expense',
    description: 'Ofis ve idari giderler',
    color: '#FCA5A5',
    icon: '🏢',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Diğer Giderler',
    type: 'expense',
    description: 'Diğer gider türleri',
    color: '#FED7D7',
    icon: '📉',
    isDefault: true,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Seed customers - Sıfırdan başlangıç için boş
export const seedCustomers: Customer[] = [];

// Seed products - Sıfırdan başlangıç için boş
export const seedProducts: Product[] = [];

// Seed projects - Sıfırdan başlangıç için boş
export const seedProjects: Project[] = [];

// Seed transactions - Sıfırdan başlangıç için boş
export const seedTransactions: Transaction[] = [];

// Seed quotes - Sıfırdan başlangıç için boş
export const seedQuotes: Quote[] = [];

// Seed subcontractors - Sıfırdan başlangıç için boş
export const seedSubcontractors: Subcontractor[] = [];

// Seed work contracts - Sıfırdan başlangıç için boş
export const seedWorkContracts: WorkContract[] = [];

// Seed subcontractor payments - Sıfırdan başlangıç için boş
export const seedSubcontractorPayments: SubcontractorPayment[] = [];

// Seed media categories - Sıfırdan başlangıç için boş
export const seedMediaCategories: MediaCategory[] = [];

// Seed media folders - Sıfırdan başlangıç için boş
export const seedMediaFolders: MediaFolder[] = [];

// Seed media tags - Sıfırdan başlangıç için boş
export const seedMediaTags: MediaTag[] = [];

// Function to migrate existing users to include permissions
const migrateUsersWithPermissions = () => {
  const existingUsers = storage.get<User[]>('management_users') || [];
  const updatedUsers = existingUsers.map(user => {
    // Eğer kullanıcının permissions alanı yoksa, varsayılan permissions ekle
    if (!user.permissions) {
      return {
        ...user,
        permissions: getDefaultPermissionsForRole(user.role)
      };
    }
    return user;
  });
  
  // Admin kullanıcılarının tüm yetkilere sahip olduğundan emin ol
  const finalUsers = ensureAllAdminsHaveFullPermissions(updatedUsers);
  
  storage.set('management_users', finalUsers);
  return finalUsers;
};

// Function to initialize seed data
export const initializeSeedData = () => {
  console.log('🚀 Seed data başlatılıyor...');
  
  // Sadece ilk kurulumda temizle, sonra kullanıcı verilerini koru
  const isFirstTime = !storage.get('management_system_initialized');
  
  if (isFirstTime) {
    console.log('İlk kurulum - Demo verileri temizleniyor...');
    
    // Tüm iş verilerini temizle (sadece ilk kurulumda)
    storage.set('management_customers', seedCustomers);
    storage.set('management_products', seedProducts);
    storage.set('management_projects', seedProjects);
    storage.set('management_transactions', seedTransactions);
    storage.set('management_quotes', seedQuotes);
    storage.set('management_subcontractors', seedSubcontractors);
    storage.set('management_work_contracts', seedWorkContracts);
    storage.set('management_subcontractor_payments', seedSubcontractorPayments);
    
    // Sistem başlatıldı işaretini koy
    storage.set('management_system_initialized', true);
  } else {
    console.log('Sistem zaten başlatılmış - Kullanıcı verileri korunuyor');
  }
  
  // HER DURUMDA admin kullanıcısını yükle
  console.log('🔐 Admin kullanıcısı kontrol ediliyor...');
  const existingUsers = storage.get<User[]>('management_users') || [];
  const adminExists = existingUsers.some(user => user.username === 'admin');
  
  if (!adminExists) {
    console.log('✅ Admin kullanıcısı bulunamadı, yükleniyor...');
    const updatedUsers = [...existingUsers, ...seedUsers];
    storage.set('management_users', updatedUsers);
    console.log('✅ Admin kullanıcısı başarıyla yüklendi!');
  } else {
    console.log('✅ Admin kullanıcısı zaten mevcut');
    // Mevcut admin kullanıcısının şifresini güncelle
    const updatedUsers = existingUsers.map(user => {
      if (user.username === 'admin') {
        return {
          ...user,
          password: 'admin123', // Şifreyi güncelle
          isActive: true
        };
      }
      return user;
    });
    storage.set('management_users', updatedUsers);
    console.log('✅ Admin kullanıcısı şifresi güncellendi!');
  }
  
  // Medya verilerini de sadece ilk kurulumda temizle
  if (isFirstTime) {
    storage.set('management_media_categories', seedMediaCategories);
    storage.set('management_media_folders', seedMediaFolders);
    storage.set('management_media_tags', seedMediaTags);
    storage.set('management_media_files', []);
    storage.set('management_media_permissions', []);
    storage.set('management_media_versions', []);
    
    // Kategorileri de temizle ve yeniden oluştur
    storage.set('management_transaction_categories', seedTransactionCategories);
    
    // Aktivite loglarını da temizle
    storage.set('management_activity_logs', []);
  } else {
    // Sadece eksik olanları ekle
    if (!storage.get('management_media_categories')) {
      storage.set('management_media_categories', seedMediaCategories);
    }
    if (!storage.get('management_media_folders')) {
      storage.set('management_media_folders', seedMediaFolders);
    }
    if (!storage.get('management_media_tags')) {
      storage.set('management_media_tags', seedMediaTags);
    }
    if (!storage.get('management_media_files')) {
      storage.set('management_media_files', []);
    }
    if (!storage.get('management_media_permissions')) {
      storage.set('management_media_permissions', []);
    }
    if (!storage.get('management_media_versions')) {
      storage.set('management_media_versions', []);
    }
    if (!storage.get('management_transaction_categories')) {
      storage.set('management_transaction_categories', seedTransactionCategories);
    }
    if (!storage.get('management_activity_logs')) {
      storage.set('management_activity_logs', []);
    }
  }

  if (isFirstTime) {
    console.log('✅ İLK KURULUM TAMAMLANDI!');
    console.log('🔄 Demo veriler temizlendi, sistem hazır');
    console.log('📋 Giriş bilgileri:');
    console.log('   Kullanıcı adı: admin');
    console.log('   Şifre: admin123');
    console.log('🎯 Artık kendi verilerinizi ekleyebilirsiniz!');
  } else {
    console.log('✅ Sistem başlatıldı - Kullanıcı verileri korundu');
  }
};
