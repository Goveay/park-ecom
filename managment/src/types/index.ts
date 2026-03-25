// User types
export interface UserPermissions {
  // Sayfa erişim yetkileri
  pages: {
    dashboard: boolean;
    customers: boolean;
    products: boolean;
    projects: boolean;
    transactions: boolean;
    quotes: boolean;
    subcontractors: boolean;
    workContracts: boolean;
    subcontractorPayments: boolean;
    mediaManagement: boolean;
    users: boolean;
    logs: boolean;
    settings: boolean;
  };
  // İşlem yetkileri
  actions: {
    // Müşteri işlemleri
    customerCreate: boolean;
    customerEdit: boolean;
    customerDelete: boolean;
    customerView: boolean;
    
    // Ürün işlemleri
    productCreate: boolean;
    productEdit: boolean;
    productDelete: boolean;
    productView: boolean;
    
    // Proje işlemleri
    projectCreate: boolean;
    projectEdit: boolean;
    projectDelete: boolean;
    projectView: boolean;
    
    // İşlem işlemleri
    transactionCreate: boolean;
    transactionEdit: boolean;
    transactionDelete: boolean;
    transactionView: boolean;
    
    // Teklif işlemleri
    quoteCreate: boolean;
    quoteEdit: boolean;
    quoteDelete: boolean;
    quoteView: boolean;
    quoteSend: boolean;
    
    // Alt yüklenici işlemleri
    subcontractorCreate: boolean;
    subcontractorEdit: boolean;
    subcontractorDelete: boolean;
    subcontractorView: boolean;
    
    // İş sözleşmesi işlemleri
    workContractCreate: boolean;
    workContractEdit: boolean;
    workContractDelete: boolean;
    workContractView: boolean;
    
    // Alt yüklenici ödeme işlemleri
    subcontractorPaymentCreate: boolean;
    subcontractorPaymentEdit: boolean;
    subcontractorPaymentDelete: boolean;
    subcontractorPaymentView: boolean;
    
    // Medya yönetimi işlemleri
    mediaUpload: boolean;
    mediaEdit: boolean;
    mediaDelete: boolean;
    mediaView: boolean;
    mediaDownload: boolean;
    
    // Kullanıcı işlemleri
    userCreate: boolean;
    userEdit: boolean;
    userDelete: boolean;
    userView: boolean;
    
    // Sistem işlemleri
    systemSettings: boolean;
    systemBackup: boolean;
    systemLogs: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password: string; // Şifre alanı eklendi
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  permissions: UserPermissions;
  lastLogin?: string;
  passwordChangedAt?: string; // Şifre değiştirilme tarihi
  mustChangePassword?: boolean; // İlk girişte şifre değiştirme zorunluluğu
  createdAt: string;
  updatedAt: string;
}

// Activity Log types
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'customer' | 'product' | 'project' | 'transaction' | 'quote' | 'subcontractor' | 'work_contract' | 'subcontractor_payment' | 'media_file' | 'user' | 'system';
  entityId?: string;
  entityName?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

// Contact types
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'company' | 'individual';
  companyName?: string;
  logo?: string;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  unit?: string; // Birim (adet, m2, kg, vb.)
  image?: string; // Base64 encoded image or URL
  vendureId?: string; // Vendure'dan import edilen ürünlerin ID'si
  vendureSlug?: string; // Vendure ürün URL slug'ı
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  customerId: string;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  // Location information
  city: string;
  district: string;
  neighborhood: string;
  // Images and receipts
  images: string[]; // Array of Base64 images
  receipts: string[]; // Array of Base64 receipts
  receiptFileNames?: string[]; // Array of receipt file names
  // Financial tracking
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  createdAt: string;
  updatedAt: string;
}

// Transaction types
export interface Transaction {
  id: string;
  projectId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card';
  receipt?: string;
  receiptFile?: string; // Base64 encoded PDF file
  receiptFileName?: string; // Original filename
  createdAt: string;
  updatedAt: string;
}

// Quote types
export interface QuoteItem {
  productId: string;
  quantity: number;
  price: number;
  description: string;
  productDescription?: string; // Ürünün orijinal açıklaması
  customDescription?: string; // Proje bazlı özel açıklama
  customName?: string; // Proje bazlı özel ürün adı
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  projectId?: string;
  projectName?: string; // Özel proje adı için
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string;
  notes: string;
  customTerms?: string;
  customTermsTitle?: string; // Özel şartlar başlığı için
  createdAt: string;
  updatedAt: string;
}

// Subcontractor types - YENİ EKLENEN
export interface Subcontractor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  specialization: string[]; // ['tel-çit', 'basketbol-saha', 'peyzaj', 'elektrik', 'su-tesisatı']
  hourlyRate?: number;
  dailyRate?: number;
  rating: number; // 1-5 yıldız
  status: 'active' | 'inactive' | 'blacklisted';
  isSupplier: boolean; // Tedarikçi olarak işaretlenmiş mi?
  logo?: string; // Logo URL'si
  notes?: string;
  totalEarnings: number; // Toplam kazanç
  totalProjects: number; // Toplam proje sayısı
  createdAt: string;
  updatedAt: string;
}

// Work Contract types - YENİ EKLENEN
export interface Milestone {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completedDate?: string;
  notes?: string;
}

export interface WorkContract {
  id: string;
  projectId: string;
  subcontractorId: string;
  contractNumber: string;
  workDescription: string;
  customerPrice: number; // Müşteriye verilen fiyat
  subcontractorPrice: number; // Alt yükleniciye ödenen fiyat
  profitMargin: number; // Otomatik hesaplanacak
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  paymentTerms: string; // "Peşin %30, iş bitiminde %70"
  milestones: Milestone[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Subcontractor Payment types - YENİ EKLENEN
export interface SubcontractorPayment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  description: string;
  receipt?: string; // Base64 encoded receipt
  receiptFileName?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  inventoryValue: number;
  activeProjects: number;
  totalCustomers: number;
  totalProducts: number;
  recentTransactions: Transaction[];
  recentProjects: Project[];
  // YENİ EKLENEN - Alt yüklenici metrikleri
  activeSubcontractors: number;
  activeWorkContracts: number;
  totalSubcontractorPayments: number;
  pendingSubcontractorPayments: number;
}

// File and Media Management types - YENİ EKLENEN
export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  fileType: 'image' | 'document' | 'vector' | 'video' | 'audio' | 'archive' | 'other';
  mimeType: string;
  fileSize: number; // bytes
  fileExtension: string;
  filePath: string; // Base64 encoded file or URL
  thumbnail?: string; // Base64 encoded thumbnail
  tags: string[];
  category: string;
  folderId?: string;
  projectId?: string; // Hangi projeye ait
  customerId?: string; // Hangi müşteriye ait
  uploadedBy: string; // User ID
  isPublic: boolean; // Herkese açık mı
  downloadCount: number;
  viewCount: number;
  status: 'active' | 'archived' | 'deleted';
  metadata?: {
    width?: number; // Resim/video genişliği
    height?: number; // Resim/video yüksekliği
    duration?: number; // Video/ses süresi
    pages?: number; // PDF sayfa sayısı
    colorSpace?: string; // Renk uzayı
    dpi?: number; // Çözünürlük
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string; // Üst klasör ID'si
  path: string; // Klasör yolu (örn: /Sözleşmeler/2024)
  icon?: string; // Klasör ikonu
  color?: string; // Klasör rengi
  isPublic: boolean;
  createdBy: string; // User ID
  fileCount: number; // Klasördeki dosya sayısı
  totalSize: number; // Klasördeki toplam boyut
  createdAt: string;
  updatedAt: string;
}

export interface MediaTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number; // Kaç dosyada kullanıldığı
  createdAt: string;
}

export interface MediaCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  allowedFileTypes: string[]; // Hangi dosya türleri kabul ediliyor
  maxFileSize: number; // Maksimum dosya boyutu
  fileCount: number; // Kategorideki dosya sayısı
  createdAt: string;
}

export interface MediaPermission {
  id: string;
  fileId: string;
  userId: string;
  permission: 'read' | 'write' | 'delete' | 'admin';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface MediaVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  filePath: string;
  changeDescription?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: number;
}

// Transaction Category types - YENİ EKLENEN
export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  color: string; // Hex color code
  icon?: string; // Icon name or emoji
  isDefault: boolean; // Sistem varsayılan kategorisi mi
  isActive: boolean;
  usageCount: number; // Kaç kez kullanıldığı
  createdAt: string;
  updatedAt: string;
}

