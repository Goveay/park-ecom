export interface VersionInfo {
  current: string;
  supported: string[];
  migrations: string[];
}

export const versionService = {
  currentVersion: '1.2.0',
  
  // Desteklenen versiyonlar
  supportedVersions: ['1.0.0', '1.1.0', '1.2.0'],
  
  // Versiyon uyumluluğunu kontrol et
  checkCompatibility: (version: string): boolean => {
    return versionService.supportedVersions.includes(version);
  },
  
  // Versiyon bilgilerini al
  getVersionInfo: (): VersionInfo => {
    return {
      current: versionService.currentVersion,
      supported: versionService.supportedVersions,
      migrations: ['1.0.0->1.1.0', '1.1.0->1.2.0']
    };
  },
  
  // Veri şemasını doğrula
  validateDataSchema: (data: any, version: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Temel veri yapısını kontrol et
    if (!data.customers || !Array.isArray(data.customers)) {
      errors.push('Müşteri verisi bulunamadı veya geçersiz');
    }
    
    if (!data.products || !Array.isArray(data.products)) {
      errors.push('Ürün verisi bulunamadı veya geçersiz');
    }
    
    if (!data.projects || !Array.isArray(data.projects)) {
      errors.push('Proje verisi bulunamadı veya geçersiz');
    }
    
    // Versiyon 1.1.0+ için alt yüklenici verilerini kontrol et
    if (version >= '1.1.0') {
      if (!data.subcontractors || !Array.isArray(data.subcontractors)) {
        errors.push('Alt yüklenici verisi bulunamadı veya geçersiz');
      }
    }
    
    // Versiyon 1.2.0+ için medya verilerini kontrol et
    if (version >= '1.2.0') {
      if (!data.mediaFiles || !Array.isArray(data.mediaFiles)) {
        errors.push('Medya dosya verisi bulunamadı veya geçersiz');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Versiyon geçmişi
  getVersionHistory: (): Array<{ version: string; date: string; features: string[] }> => {
    return [
      {
        version: '1.0.0',
        date: '2025-01-01',
        features: [
          'Temel müşteri yönetimi',
          'Ürün kataloğu',
          'Proje takibi',
          'İşlem kayıtları',
          'Teklif oluşturma'
        ]
      },
      {
        version: '1.1.0',
        date: '2025-06-01',
        features: [
          'Alt yüklenici yönetimi',
          'İş sözleşmeleri',
          'Alt yüklenici ödemeleri',
          'Gelişmiş raporlama'
        ]
      },
      {
        version: '1.2.0',
        date: '2025-09-01',
        features: [
          'Dosya ve medya yönetimi',
          'Klasör organizasyonu',
          'Dosya etiketleme',
          'Otomatik yedekleme sistemi',
          'Veri export/import'
        ]
      }
    ];
  }
};
