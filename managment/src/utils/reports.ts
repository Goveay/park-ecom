import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Project, Transaction, Customer, Product } from '../types';

// Türkçe karakter dönüştürme fonksiyonu
const turkishToAscii = (text: string): string => {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => turkishChars[char] || char);
};

// Tarih formatı için özel fonksiyon
const formatDateForPDF = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Sayı formatı için özel fonksiyon
const formatNumberForPDF = (num: number): string => {
  return num.toLocaleString('en-US');
};

// PDF rapor oluşturma
export const generatePDFReport = (
  type: 'monthly' | 'quarterly',
  data: {
    projects: Project[];
    transactions: Transaction[];
    customers: Customer[];
    products: Product[];
    metrics: any;
  }
) => {
  const doc = new jsPDF();
  const currentDate = new Date();
  const reportTitle = type === 'monthly' ? 'Aylik Rapor' : 'Uc Aylik Rapor';
  const reportPeriod = type === 'monthly' 
    ? `${currentDate.getFullYear()} - ${currentDate.getMonth() + 1}`
    : `${currentDate.getFullYear()} - Q${Math.ceil((currentDate.getMonth() + 1) / 3)}`;

  // Başlık bölümü - daha profesyonel
  doc.setFillColor(59, 130, 246); // Mavi arka plan
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255); // Beyaz metin
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PARKPICASSO YONETIM SISTEMI', 20, 20);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reportTitle.toUpperCase()} - ${reportPeriod}`, 20, 30);
  
  // Alt bilgi
  doc.setTextColor(0, 0, 0); // Siyah metin
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rapor Tarihi: ${formatDateForPDF(currentDate)}`, 20, 50);
  doc.text(`Rapor Olusturan: Sistem Yoneticisi`, 20, 55);

  let yPosition = 70;

  // Finansal Özet - Tablo formatında
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANSAL OZET', 20, yPosition);
  yPosition += 15;

  // Tablo başlığı
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 5, 170, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Kategori', 25, yPosition);
  doc.text('Tutar', 150, yPosition);
  yPosition += 15;

  // Finansal veriler
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const financialItems = [
    ['Toplam Gelir', `TL ${formatNumberForPDF(data.metrics.totalIncome)}`],
    ['Toplam Gider', `TL ${formatNumberForPDF(data.metrics.totalExpenses)}`],
    ['Net Kar', `TL ${formatNumberForPDF(data.metrics.netProfit)}`],
    ['Kar Marjı', `%${data.metrics.profitMargin.toFixed(1)}`],
    ['Aylik Büyüme', `%${data.metrics.monthlyGrowth.toFixed(1)}`]
  ];

  financialItems.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
    }
    doc.text(item[0], 25, yPosition);
    doc.text(item[1], 150, yPosition);
    yPosition += 10;
  });
  yPosition += 15;

  // Proje Özeti - Tablo formatında
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJE OZETI', 20, yPosition);
  yPosition += 15;

  // Tablo başlığı
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 5, 170, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Kategori', 25, yPosition);
  doc.text('Değer', 150, yPosition);
  yPosition += 15;

  // Proje verileri
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const projectItems = [
    ['Toplam Proje', data.metrics.totalProjects.toString()],
    ['Aktif Projeler', data.metrics.activeProjects.toString()],
    ['Tamamlanan Projeler', data.metrics.completedProjects.toString()],
    ['Ortalama Proje Degeri', `TL ${formatNumberForPDF(data.metrics.averageProjectValue)}`],
    ['Suresi Gecmis Projeler', data.metrics.overdueProjects.toString()]
  ];

  projectItems.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
    }
    doc.text(item[0], 25, yPosition);
    doc.text(item[1], 150, yPosition);
    yPosition += 10;
  });
  yPosition += 15;

  // Son Projeler - Tablo formatında
  if (data.projects.length > 0) {
    // Yeni sayfa kontrolü
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SON PROJELER', 20, yPosition);
    yPosition += 15;

    // Tablo başlığı
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition - 5, 170, 10, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Proje Adi', 25, yPosition);
    doc.text('Durum', 80, yPosition);
    doc.text('Butce', 120, yPosition);
    doc.text('Baslangic', 160, yPosition);
    yPosition += 15;

    // Proje verileri
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    data.projects.slice(0, 15).forEach((project, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPosition - 5, 170, 10, 'F');
      }

      // Proje adını kısalt ve Türkçe karakterleri dönüştür
      const projectName = project.name.length > 20 ? project.name.substring(0, 17) + '...' : project.name;
      const status = project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Tamamlandi' : 'Iptal Edildi';
      
      doc.text(turkishToAscii(projectName), 25, yPosition);
      doc.text(status, 80, yPosition);
      doc.text(`TL ${formatNumberForPDF(project.budget)}`, 120, yPosition);
      doc.text(formatDateForPDF(new Date(project.startDate)), 160, yPosition);
      yPosition += 10;
    });
  }

  // Alt bilgi ve imza alanı
  yPosition += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Bu rapor otomatik olarak sistem tarafindan olusturulmustur.', 20, yPosition);
  yPosition += 10;
  doc.text('Rapor Tarihi: ' + formatDateForPDF(currentDate), 20, yPosition);
  yPosition += 10;
  doc.text('Rapor Saati: ' + currentDate.toLocaleTimeString('en-US'), 20, yPosition);

  // Sayfa numarası
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sayfa ${i} / ${pageCount}`, 20, doc.internal.pageSize.height - 10);
    doc.text('ParkPicasso Yonetim Sistemi', 150, doc.internal.pageSize.height - 10);
  }

  // PDF'i indir
  const fileName = `ParkPicasso_${reportTitle.replace(/\s+/g, '_')}_${reportPeriod.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

// Excel rapor oluşturma
export const generateExcelReport = (data: {
  projects: Project[];
  transactions: Transaction[];
  customers: Customer[];
  products: Product[];
  metrics: any;
}) => {
  // Ana rapor sayfası
  const mainData = [
    ['ParkPicasso Yonetim Sistemi - Genel Rapor'],
    ['Rapor Tarihi', formatDateForPDF(new Date())],
    [''],
    ['FINANSAL OZET'],
    ['Toplam Gelir', data.metrics.totalIncome],
    ['Toplam Gider', data.metrics.totalExpenses],
    ['Net Kar', data.metrics.netProfit],
    ['Kar Marjı (%)', data.metrics.profitMargin],
    [''],
    ['PROJE OZETI'],
    ['Toplam Proje', data.metrics.totalProjects],
    ['Aktif Projeler', data.metrics.activeProjects],
    ['Tamamlanan Projeler', data.metrics.completedProjects],
    ['Ortalama Proje Degeri', data.metrics.averageProjectValue],
  ];

  // Projeler sayfası
  const projectsData = [
    ['Proje Adi', 'Durum', 'Butce', 'Baslangic Tarihi', 'Bitis Tarihi', 'Musteri'],
    ...data.projects.map(project => [
      turkishToAscii(project.name),
      project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Tamamlandi' : 'Iptal Edildi',
      project.budget,
      formatDateForPDF(new Date(project.startDate)),
      project.endDate ? formatDateForPDF(new Date(project.endDate)) : '-',
      turkishToAscii(project.customerName || '-')
    ])
  ];

  // İşlemler sayfası
  const transactionsData = [
    ['Tarih', 'Aciklama', 'Tur', 'Tutar', 'Proje'],
    ...data.transactions.map(transaction => [
      formatDateForPDF(new Date(transaction.date)),
      turkishToAscii(transaction.description),
      transaction.type === 'income' ? 'Gelir' : 'Gider',
      transaction.amount,
      turkishToAscii(transaction.projectName || '-')
    ])
  ];

  // Müşteriler sayfası
  const customersData = [
    ['Ad', 'E-posta', 'Telefon', 'Adres', 'Proje Sayisi'],
    ...data.customers.map(customer => [
      turkishToAscii(customer.name),
      customer.email,
      customer.phone,
      turkishToAscii(customer.address),
      data.projects.filter(p => p.customerId === customer.id).length
    ])
  ];

  // Ürünler sayfası
  const productsData = [
    ['Ad', 'Kategori', 'Stok', 'Birim Fiyat', 'Stok Degeri'],
    ...data.products.map(product => [
      turkishToAscii(product.name),
      turkishToAscii(product.category),
      product.stock,
      product.price,
      product.stock * product.price
    ])
  ];

  // Excel dosyası oluştur
  const wb = XLSX.utils.book_new();
  
  // Sayfaları ekle
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainData), 'Genel Rapor');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(projectsData), 'Projeler');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transactionsData), 'Islemler');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(customersData), 'Musteriler');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(productsData), 'Urunler');

  // Dosyayı indir
  const fileName = `ParkPicasso_Genel_Rapor_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Grafik verilerini hazırlama
export const prepareChartData = (transactions: Transaction[], projects: Project[]) => {
  // Son 12 ayın verilerini hazırla
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push(date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }));
  }

  // Gelir/Gider verileri
  const incomeData = new Array(12).fill(0);
  const expenseData = new Array(12).fill(0);

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const monthIndex = 11 - (currentDate.getMonth() - transactionDate.getMonth() + (currentDate.getFullYear() - transactionDate.getFullYear()) * 12);
    
    if (monthIndex >= 0 && monthIndex < 12) {
      if (transaction.type === 'income') {
        incomeData[monthIndex] += transaction.amount;
      } else {
        expenseData[monthIndex] += transaction.amount;
      }
    }
  });

  // Proje durumu verileri
  const projectStatusData = {
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

  // Aylık performans verileri
  const monthlyProfit = incomeData.map((income, index) => income - expenseData[index]);
  const monthlyProjects = new Array(12).fill(0);

  projects.forEach(project => {
    const projectDate = new Date(project.startDate);
    const monthIndex = 11 - (currentDate.getMonth() - projectDate.getMonth() + (currentDate.getFullYear() - projectDate.getFullYear()) * 12);
    
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyProjects[monthIndex]++;
    }
  });

  return {
    incomeExpense: {
      labels: months,
      income: incomeData,
      expenses: expenseData,
    },
    projectStatus: projectStatusData,
    monthlyPerformance: {
      labels: months,
      profit: monthlyProfit,
      projects: monthlyProjects,
    },
  };
};