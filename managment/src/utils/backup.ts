import { v4 as uuidv4 } from 'uuid';
import { 
  Customer, Product, Project, Transaction, Quote, 
  Subcontractor, WorkContract, SubcontractorPayment,
  MediaFile, MediaFolder, MediaTag, MediaCategory,
  User
} from '../types';
import { storage } from './storage';

// Güvenli checksum fonksiyonu - Türkçe karakter desteği ile
const createChecksum = (data: string): string => {
  // Basit ve güvenilir hash fonksiyonu - Türkçe karakterlerle uyumlu
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit integer'a çevir
  }
  
  // Pozitif hash değeri al ve hex'e çevir
  const positiveHash = Math.abs(hash);
  return positiveHash.toString(16).padStart(8, '0').slice(0, 32);
};

// Backup/Export interface
export interface BackupData {
  version: string;
  exportDate: string;
  exportId: string;
  data: {
    customers: Customer[];
    products: Product[];
    projects: Project[];
    transactions: Transaction[];
    quotes: Quote[];
    subcontractors: Subcontractor[];
    workContracts: WorkContract[];
    subcontractorPayments: SubcontractorPayment[];
    mediaFiles: MediaFile[];
    mediaFolders: MediaFolder[];
    mediaTags: MediaTag[];
    mediaCategories: MediaCategory[];
    user?: User;
  };
  metadata: {
    totalRecords: number;
    totalSize: number;
    checksum: string;
  };
}

// Migration interface for version compatibility
export interface MigrationRule {
  fromVersion: string;
  toVersion: string;
  description: string;
  transform: (data: any) => any;
}

// Backup/Export functions
export const backupService = {
  // Tüm veriyi export et
  exportAllData: (): BackupData => {
    console.log('Export işlemi başlatılıyor...');
    
    const customers = storage.get<Customer[]>('management_customers') || [];
    const products = storage.get<Product[]>('management_products') || [];
    const projects = storage.get<Project[]>('management_projects') || [];
    const transactions = storage.get<Transaction[]>('management_transactions') || [];
    const quotes = storage.get<Quote[]>('management_quotes') || [];
    const subcontractors = storage.get<Subcontractor[]>('management_subcontractors') || [];
    const workContracts = storage.get<WorkContract[]>('management_work_contracts') || [];
    const subcontractorPayments = storage.get<SubcontractorPayment[]>('management_subcontractor_payments') || [];
    const mediaFiles = storage.get<MediaFile[]>('management_media_files') || [];
    const mediaFolders = storage.get<MediaFolder[]>('management_media_folders') || [];
    const mediaTags = storage.get<MediaTag[]>('management_media_tags') || [];
    const mediaCategories = storage.get<MediaCategory[]>('management_media_categories') || [];
    const user = storage.get<User>('management_user');

    console.log('Veri boyutları:', {
      customers: customers.length,
      products: products.length,
      projects: projects.length,
      transactions: transactions.length,
      quotes: quotes.length,
      subcontractors: subcontractors.length,
      workContracts: workContracts.length,
      subcontractorPayments: subcontractorPayments.length,
      mediaFiles: mediaFiles.length,
      mediaFolders: mediaFolders.length,
      mediaTags: mediaTags.length,
      mediaCategories: mediaCategories.length,
      user: user ? 1 : 0
    });

    const allData = {
      customers,
      products,
      projects,
      transactions,
      quotes,
      subcontractors,
      workContracts,
      subcontractorPayments,
      mediaFiles,
      mediaFolders,
      mediaTags,
      mediaCategories,
      user
    };

    const totalRecords = Object.values(allData).reduce((sum, arr) => {
      return sum + (Array.isArray(arr) ? arr.length : (arr ? 1 : 0));
    }, 0);

    const dataString = JSON.stringify(allData);
    const totalSize = new Blob([dataString]).size;
    const checksum = createChecksum(dataString);

    return {
      version: '1.2.0',
      exportDate: new Date().toISOString(),
      exportId: uuidv4(),
      data: allData,
      metadata: {
        totalRecords,
        totalSize,
        checksum
      }
    };
  },

  // Belirli veri türlerini export et
  exportSelectiveData: (dataTypes: string[]): Partial<BackupData> => {
    const exportData: any = {};
    
    dataTypes.forEach(type => {
      switch (type) {
        case 'customers':
          exportData.customers = storage.get<Customer[]>('management_customers') || [];
          break;
        case 'products':
          exportData.products = storage.get<Product[]>('management_products') || [];
          break;
        case 'projects':
          exportData.projects = storage.get<Project[]>('management_projects') || [];
          break;
        case 'transactions':
          exportData.transactions = storage.get<Transaction[]>('management_transactions') || [];
          break;
        case 'quotes':
          exportData.quotes = storage.get<Quote[]>('management_quotes') || [];
          break;
        case 'subcontractors':
          exportData.subcontractors = storage.get<Subcontractor[]>('management_subcontractors') || [];
          break;
        case 'workContracts':
          exportData.workContracts = storage.get<WorkContract[]>('management_work_contracts') || [];
          break;
        case 'subcontractorPayments':
          exportData.subcontractorPayments = storage.get<SubcontractorPayment[]>('management_subcontractor_payments') || [];
          break;
        case 'mediaFiles':
          exportData.mediaFiles = storage.get<MediaFile[]>('management_media_files') || [];
          break;
        case 'mediaFolders':
          exportData.mediaFolders = storage.get<MediaFolder[]>('management_media_folders') || [];
          break;
        case 'mediaTags':
          exportData.mediaTags = storage.get<MediaTag[]>('management_media_tags') || [];
          break;
        case 'mediaCategories':
          exportData.mediaCategories = storage.get<MediaCategory[]>('management_media_categories') || [];
          break;
      }
    });

    return {
      version: '1.2.0',
      exportDate: new Date().toISOString(),
      exportId: uuidv4(),
      data: exportData,
      metadata: {
        totalRecords: Object.values(exportData).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        totalSize: new Blob([JSON.stringify(exportData)]).size,
        checksum: createChecksum(JSON.stringify(exportData))
      }
    };
  },

  // Backup dosyasını indir
  downloadBackup: (backupData: BackupData, filename?: string): void => {
    console.log('Download işlemi başlatılıyor...', { filename, dataSize: JSON.stringify(backupData).length });
    
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('Download sadece tarayıcı ortamında çalışır');
      return;
    }
    
    try {
      // UTF-8 BOM ekleyerek Türkçe karakterleri koru
      const BOM = '\uFEFF';
      const dataStr = BOM + JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      
      console.log('Blob oluşturuldu:', { size: dataBlob.size, type: dataBlob.type });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `yedek_${new Date().toISOString().split('T')[0]}.json`;
      
      console.log('Download link oluşturuldu:', { href: link.href, download: link.download });
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Download tamamlandı');
    } catch (error) {
      console.error('Download hatası:', error);
      throw error;
    }
  },

  // Backup dosyasını yükle ve import et
  importBackup: async (file: File): Promise<{ success: boolean; message: string; data?: BackupData }> => {
    try {
      // UTF-8 encoding ile dosyayı oku
      const text = await file.text();
      
      // BOM'u temizle (varsa)
      const cleanText = text.replace(/^\uFEFF/, '');
      
      const backupData: BackupData = JSON.parse(cleanText);
      
      // Versiyon kontrolü
      if (!backupData.version) {
        return { success: false, message: 'Geçersiz yedek dosyası: Versiyon bilgisi bulunamadı' };
      }

      // Checksum kontrolü (opsiyonel - hata durumunda devam et)
      try {
        const dataString = JSON.stringify(backupData.data);
        const expectedChecksum = createChecksum(dataString);
        if (backupData.metadata.checksum !== expectedChecksum) {
          console.warn('Checksum uyuşmuyor, ancak import devam ediyor');
        }
      } catch (checksumError) {
        console.warn('Checksum kontrolü başarısız, import devam ediyor:', checksumError);
      }

      return { success: true, message: 'Yedek dosyası başarıyla yüklendi', data: backupData };
    } catch (error) {
      return { success: false, message: `Yedek dosyası yüklenirken hata: ${error}` };
    }
  },

  // Veriyi storage'a geri yükle
  restoreData: (backupData: BackupData, options: {
    merge?: boolean; // Mevcut veriyle birleştir
    overwrite?: boolean; // Mevcut veriyi üzerine yaz
    dataTypes?: string[]; // Sadece belirli veri türlerini geri yükle
  } = {}): { success: boolean; message: string } => {
    try {
      const { merge = false, overwrite = false, dataTypes } = options;
      
      if (merge && overwrite) {
        return { success: false, message: 'Birleştirme ve üzerine yazma seçenekleri aynı anda kullanılamaz' };
      }

      const data = backupData.data;
      const typesToRestore = dataTypes || Object.keys(data);

      typesToRestore.forEach(type => {
        if (data[type as keyof typeof data]) {
          const newData = data[type as keyof typeof data];
          
          if (Array.isArray(newData)) {
            if (merge) {
              // Mevcut veriyle birleştir
              const existingData = storage.get<any[]>(`management_${type}`) || [];
              const mergedData = [...existingData, ...newData];
              storage.set(`management_${type}`, mergedData);
            } else {
              // Üzerine yaz veya yeni ekle
              storage.set(`management_${type}`, newData);
            }
          } else if (type === 'user' && newData) {
            storage.set('management_user', newData);
          }
        }
      });

      return { success: true, message: 'Veri başarıyla geri yüklendi' };
    } catch (error) {
      return { success: false, message: `Veri geri yüklenirken hata: ${error}` };
    }
  }
};

// Migration system for version compatibility
export const migrationService = {
  migrations: new Map<string, MigrationRule[]>(),

  // Migration kuralı ekle
  addMigration(rule: MigrationRule): void {
    const key = `${rule.fromVersion}-${rule.toVersion}`;
    if (!this.migrations.has(key)) {
      this.migrations.set(key, []);
    }
    this.migrations.get(key)!.push(rule);
  },

  // Veriyi belirli versiyondan hedef versiyona migrate et
  migrateData(data: any, fromVersion: string, toVersion: string): any {
    let currentData = data;
    let currentVersion = fromVersion;

    while (currentVersion !== toVersion) {
      const migrationKey = `${currentVersion}-${toVersion}`;
      const migrations = this.migrations.get(migrationKey);

      if (migrations && migrations.length > 0) {
        migrations.forEach(migration => {
          currentData = migration.transform(currentData);
        });
        currentVersion = toVersion;
      } else {
        // Doğrudan migration bulunamadı, adım adım git
        const nextVersion = this.getNextVersion(currentVersion);
        if (nextVersion) {
          const stepMigrationKey = `${currentVersion}-${nextVersion}`;
          const stepMigrations = this.migrations.get(stepMigrationKey);
          
          if (stepMigrations && stepMigrations.length > 0) {
            stepMigrations.forEach(migration => {
              currentData = migration.transform(currentData);
            });
            currentVersion = nextVersion;
          } else {
            throw new Error(`Migration bulunamadı: ${currentVersion} -> ${nextVersion}`);
          }
        } else {
          throw new Error(`Hedef versiyona ulaşılamadı: ${currentVersion} -> ${toVersion}`);
        }
      }
    }

    return currentData;
  },

  // Sonraki versiyonu bul
  getNextVersion(currentVersion: string): string | null {
    // Basit versiyon yönetimi - gerçek uygulamada daha karmaşık olabilir
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    if (patch < 9) {
      return `${major}.${minor}.${patch + 1}`;
    } else if (minor < 9) {
      return `${major}.${minor + 1}.0`;
    } else {
      return `${major + 1}.0.0`;
    }
  }
};

// Örnek migration kuralları
migrationService.addMigration({
  fromVersion: '1.0.0',
  toVersion: '1.1.0',
  description: 'Alt yüklenici özelliklerini ekle',
  transform: (data) => {
    // Eğer subcontractors yoksa boş array ekle
    if (!data.subcontractors) {
      data.subcontractors = [];
    }
    if (!data.workContracts) {
      data.workContracts = [];
    }
    if (!data.subcontractorPayments) {
      data.subcontractorPayments = [];
    }
    return data;
  }
});

migrationService.addMigration({
  fromVersion: '1.1.0',
  toVersion: '1.2.0',
  description: 'Medya yönetimi özelliklerini ekle',
  transform: (data) => {
    // Medya yönetimi verilerini ekle
    if (!data.mediaFiles) data.mediaFiles = [];
    if (!data.mediaFolders) data.mediaFolders = [];
    if (!data.mediaTags) data.mediaTags = [];
    if (!data.mediaCategories) data.mediaCategories = [];
    return data;
  }
});
