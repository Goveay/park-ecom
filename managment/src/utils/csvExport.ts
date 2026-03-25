// CSV Export utility functions with UTF-8 support for Turkish characters

export interface CSVExportOptions {
  filename?: string;
  includeBOM?: boolean;
  delimiter?: string;
}

/**
 * CSV dosyası oluşturur ve indirir (Türkçe karakter desteği ile)
 * @param data - Export edilecek veri array'i
 * @param headers - CSV başlıkları
 * @param options - Export seçenekleri
 */
export const exportToCSV = (
  data: any[][],
  headers: string[],
  options: CSVExportOptions = {}
): void => {
  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.csv`,
    includeBOM = true,
    delimiter = ','
  } = options;

  try {
    // UTF-8 BOM ekle (Türkçe karakterler için)
    const BOM = includeBOM ? '\uFEFF' : '';
    
    // CSV içeriğini oluştur
    const csvContent = BOM + [
      // Başlık satırı
      headers.join(delimiter),
      // Veri satırları
      ...data.map(row => 
        row.map(cell => {
          // Hücre içeriğini temizle ve escape et
          const cellStr = String(cell || '');
          // Virgül, tırnak veya yeni satır içeriyorsa tırnak içine al
          if (cellStr.includes(delimiter) || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(delimiter)
      )
    ].join('\n');

    // Blob oluştur
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Dosyayı indir
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('CSV dosyası oluşturulurken hata oluştu');
  }
};

/**
 * Object array'ini CSV formatına dönüştürür
 * @param objects - Object array'i
 * @param headers - CSV başlıkları (key-value mapping)
 * @param options - Export seçenekleri
 */
export const exportObjectsToCSV = (
  objects: any[],
  headers: { key: string; label: string }[],
  options: CSVExportOptions = {}
): void => {
  const headerLabels = headers.map(h => h.label);
  const data = objects.map(obj => 
    headers.map(header => obj[header.key] || '')
  );
  
  exportToCSV(data, headerLabels, options);
};

/**
 * Log verilerini CSV olarak export eder
 * @param logs - Log array'i
 * @param filename - Dosya adı
 */
export const exportLogsToCSV = (logs: any[], filename?: string): void => {
  const headers = ['Tarih', 'Kullanıcı', 'Rol', 'İşlem', 'Varlık Türü', 'Varlık Adı', 'Detaylar', 'Önem Derecesi'];
  
  const data = logs.map(log => [
    new Date(log.timestamp).toLocaleString('tr-TR'),
    log.userName,
    log.userRole,
    log.action,
    log.entityType,
    log.entityName || '',
    log.details,
    log.severity
  ]);
  
  exportToCSV(data, headers, { 
    filename: filename || `logs_${new Date().toISOString().split('T')[0]}.csv` 
  });
};

/**
 * Müşteri verilerini CSV olarak export eder
 * @param customers - Müşteri array'i
 * @param filename - Dosya adı
 */
export const exportCustomersToCSV = (customers: any[], filename?: string): void => {
  const headers = [
    'Müşteri Adı',
    'E-posta',
    'Telefon',
    'Adres',
    'Tip',
    'Şirket Adı',
    'Vergi No',
    'Kişi Sayısı',
    'Oluşturulma Tarihi',
    'Güncelleme Tarihi'
  ];
  
  const data = customers.map(customer => [
    customer.name,
    customer.email,
    customer.phone,
    customer.address,
    customer.type === 'company' ? 'Şirket' : 'Bireysel',
    customer.companyName || '',
    (customer as any).taxNumber || '',
    customer.contacts ? customer.contacts.length : 0,
    new Date(customer.createdAt).toLocaleDateString('tr-TR'),
    new Date(customer.updatedAt).toLocaleDateString('tr-TR')
  ]);
  
  exportToCSV(data, headers, { 
    filename: filename || `müşteriler_${new Date().toISOString().split('T')[0]}.csv` 
  });
};

/**
 * Ürün verilerini CSV olarak export eder
 * @param products - Ürün array'i
 * @param filename - Dosya adı
 */
export const exportProductsToCSV = (products: any[], filename?: string): void => {
  const headers = [
    { key: 'name', label: 'Ürün Adı' },
    { key: 'description', label: 'Açıklama' },
    { key: 'category', label: 'Kategori' },
    { key: 'price', label: 'Fiyat' },
    { key: 'stock', label: 'Stok' },
    { key: 'sku', label: 'SKU' },
    { key: 'createdAt', label: 'Oluşturulma Tarihi' }
  ];
  
  const data = products.map(product => [
    product.name,
    product.description,
    product.category,
    product.price,
    product.stock,
    product.sku,
    new Date(product.createdAt).toLocaleDateString('tr-TR')
  ]);
  
  exportToCSV(data, headers.map(h => h.label), { 
    filename: filename || `ürünler_${new Date().toISOString().split('T')[0]}.csv` 
  });
};

/**
 * İşlem verilerini CSV olarak export eder
 * @param transactions - İşlem array'i
 * @param filename - Dosya adı
 */
export const exportTransactionsToCSV = (transactions: any[], filename?: string): void => {
  const headers = [
    'Tarih',
    'Proje',
    'Müşteri',
    'Tür',
    'Kategori',
    'Açıklama',
    'Tutar',
    'Ödeme Yöntemi',
    'Oluşturulma Tarihi'
  ];
  
  const data = transactions.map(transaction => [
    new Date(transaction.date).toLocaleDateString('tr-TR'),
    transaction.projectName || '',
    transaction.customerName || '',
    transaction.type === 'income' ? 'Gelir' : 'Gider',
    transaction.category,
    transaction.description,
    transaction.amount,
    transaction.paymentMethod,
    new Date(transaction.createdAt).toLocaleDateString('tr-TR')
  ]);
  
  exportToCSV(data, headers, { 
    filename: filename || `işlemler_${new Date().toISOString().split('T')[0]}.csv` 
  });
};

/**
 * Proje verilerini CSV olarak export eder
 * @param projects - Proje array'i
 * @param filename - Dosya adı
 */
export const exportProjectsToCSV = (projects: any[], filename?: string): void => {
  const headers = [
    { key: 'name', label: 'Proje Adı' },
    { key: 'customerName', label: 'Müşteri' },
    { key: 'description', label: 'Açıklama' },
    { key: 'status', label: 'Durum' },
    { key: 'startDate', label: 'Başlangıç Tarihi' },
    { key: 'endDate', label: 'Bitiş Tarihi' },
    { key: 'budget', label: 'Bütçe' },
    { key: 'createdAt', label: 'Oluşturulma Tarihi' }
  ];
  
  const data = projects.map(project => [
    project.name,
    project.customerName || '',
    project.description,
    project.status,
    new Date(project.startDate).toLocaleDateString('tr-TR'),
    project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '',
    project.budget,
    new Date(project.createdAt).toLocaleDateString('tr-TR')
  ]);
  
  exportToCSV(data, headers.map(h => h.label), { 
    filename: filename || `projeler_${new Date().toISOString().split('T')[0]}.csv` 
  });
};
