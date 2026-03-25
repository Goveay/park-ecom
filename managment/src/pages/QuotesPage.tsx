import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Edit, Trash2, Download, Eye, User, Calendar, DollarSign, Package, Filter, Grid, List, Move, X, ShoppingCart, CheckCircle, Truck } from 'lucide-react';
import { Quote, QuoteItem, Customer, Product, Project, Subcontractor } from '../types';
import { quoteStorage, customerStorage, productStorage, projectStorage, subcontractorStorage } from '../utils/storage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { turkishFont } from '../utils/font';
import { turkishFontBold } from '../utils/font-bold';



interface QuoteFormData {
  customerId: string;
  quoteNumber: string;
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
}

const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  
  // Filtreleme state'leri
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Kategori bazlı ürün seçimi için yeni state'ler
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Sürükle-bırak için state'ler
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  
  // Hızlı ürün ekleme için state'ler
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [quickAddProductData, setQuickAddProductData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    sku: '',
    image: ''
  });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedQuoteForSupplier, setSelectedQuoteForSupplier] = useState<Quote | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Customer | null>(null);
  const [dragOverImage, setDragOverImage] = useState(false);
  
  // Collapsible items için state
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<QuoteFormData>({
    customerId: '',
    quoteNumber: '',
    projectId: '',
    projectName: '', // Özel proje adı
    items: [],
    subtotal: 0,
    vatRate: 20, // Default VAT rate changed to 20%
    vatAmount: 0,
    total: 0,
    status: 'draft',
    validUntil: '',
    notes: '',
    customTerms: '',
    customTermsTitle: '', // Özel şartlar başlığı
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const quotesData = quoteStorage.getAll();
      const customersData = customerStorage.getAll();
      const productsData = productStorage.getAll();
      const projectsData = projectStorage.getAll();
      const subcontractorsData = subcontractorStorage.getAll();
      
      setQuotes(quotesData);
      setCustomers(customersData);
      setProducts(productsData);
      setProjects(projectsData);
      setSubcontractors(subcontractorsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const customer = customers.find(c => c.id === quote.customerId);
    const customerName = customer ? customer.name.toLowerCase() : '';
    const quoteNumber = quote.quoteNumber.toLowerCase();
    const projectName = quote.projectName?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    // Ana arama filtresi
    const matchesSearch = quoteNumber.includes(searchLower) ||
                         customerName.includes(searchLower) ||
                         projectName.includes(searchLower);
    
    // Müşteri filtresi
    const matchesCustomer = !filterCustomer || quote.customerId === filterCustomer;
    
    // Durum filtresi
    const matchesStatus = !filterStatus || quote.status === filterStatus;
    
    // Tarih filtresi
    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const quoteDate = new Date(quote.createdAt);
      const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
      const toDate = filterDateTo ? new Date(filterDateTo + 'T23:59:59') : null;
      
      if (fromDate && quoteDate < fromDate) matchesDate = false;
      if (toDate && quoteDate > toDate) matchesDate = false;
    }
    
    return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.quoteNumber || formData.items.length === 0) {
      alert('Lütfen tüm gerekli alanları doldurun ve en az bir ürün ekleyin');
      return;
    }

    // Total hesaplaması
    const subtotal = calculateSubtotal();
    const vatAmount = calculateTax();
    const total = calculateTotal();

    const quoteData = {
      ...formData,
      subtotal,
      vatAmount,
      total,
      projectName: formData.projectName || '',
      customTermsTitle: formData.customTermsTitle || '',
    };

    try {
      if (editingQuote) {
        quoteStorage.update(editingQuote.id, quoteData);
      } else {
        quoteStorage.create(quoteData);
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Teklif kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    
    // Ürün açıklamalarını doldur
    const itemsWithDescriptions = quote.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        productDescription: product?.description || '',
        customDescription: item.customDescription || ''
      };
    });
    
    setFormData({
      customerId: quote.customerId,
      quoteNumber: quote.quoteNumber,
      projectId: quote.projectId || '',
      projectName: quote.projectName || '',
      items: itemsWithDescriptions,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      total: quote.total,
      status: quote.status,
      validUntil: quote.validUntil,
      notes: quote.notes,
      customTerms: quote.customTerms || '',
      customTermsTitle: quote.customTermsTitle || '',
    });
    setShowModal(true);
  };

  const handleDelete = (quoteId: string) => {
    if (window.confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      try {
        quoteStorage.delete(quoteId);
        loadData();
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Teklif silinirken hata oluştu');
      }
    }
  };

  const clearFilters = () => {
    setFilterCustomer('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchTerm('');
  };

  // Müşteri bazında teklif sayısını hesapla
  const getQuoteCountByCustomer = (customerId: string) => {
    return quotes.filter(quote => quote.customerId === customerId).length;
  };

  // Aktif filtreleri say
  const activeFiltersCount = [filterCustomer, filterStatus, filterDateFrom, filterDateTo].filter(Boolean).length;

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuote(null);
    setFormData({
      customerId: '',
      quoteNumber: quoteStorage.generateQuoteNumber(),
      projectId: '',
      projectName: '',
      items: [],
      subtotal: 0,
      vatRate: 20,
      vatAmount: 0,
      total: 0,
      status: 'draft',
      validUntil: '',
      notes: '',
      customTerms: '',
      customTermsTitle: '',
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, price: 0, description: '' }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate price if product is selected
    if (field === 'productId' && typeof value === 'string') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].price = product.price;
        newItems[index].description = product.name;
        newItems[index].productDescription = product.description; // Ürünün orijinal açıklamasını sakla
        newItems[index].customDescription = ''; // Özel açıklamayı temizle
        newItems[index].customName = ''; // Özel ürün adını temizle
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Bilinmeyen Müşteri';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Bilinmeyen Ürün';
  };

  const getProductPrice = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.price : 0;
  };

  const getProductImage = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.image : null;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.vatRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const generatePDF = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    if (!customer) return;
    
    try {
      const calculateQuoteSubtotal = () => {
        return quote.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      };
      const calculateQuoteTax = () => {
        return calculateQuoteSubtotal() * (quote.vatRate / 100);
      };
      const calculateQuoteTotal = () => {
        return calculateQuoteSubtotal() + calculateQuoteTax();
      };

      // jsPDF oluştur
      const doc = new jsPDF();
      
      // Calibri font ekle ve ayarla
      doc.addFileToVFS('Calibri-Regular.ttf', turkishFont);
      doc.addFileToVFS('Calibri-Bold.ttf', turkishFontBold);
      doc.addFont('Calibri-Regular.ttf', 'Calibri', 'normal');
      doc.addFont('Calibri-Bold.ttf', 'Calibri', 'bold');
      doc.setFont('Calibri', 'normal');
      doc.setFontSize(12);
      
      // Font override fonksiyonları - sadece font adını değiştir, stilini koru
      const originalSetFont = doc.setFont;
      
      doc.setFont = function(fontName: string, fontStyle?: string) {
        if (fontName !== 'Calibri') {
          return originalSetFont.call(this, 'Calibri', fontStyle || 'normal');
        }
        return originalSetFont.call(this, fontName, fontStyle);
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Boşluklar
      const marginTop = 15;
      const marginLeft = 7;
      const marginRight = 7;
      const marginBottom = 13;

      // Dikdörtgenin konumu ve boyutu
      const x = marginLeft;
      const y = marginTop;
      const w = pageWidth - marginLeft - marginRight;
      const h = pageHeight - marginTop - marginBottom;

      // Ana border çiz
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, w, h, 'S');

      // Ana başlık - TEKLİF FORMU
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Calibri', 'bold');
      doc.text('TEKLİF FORMU', 15, 35);

      // Müşteri bilgileri (sol taraf)
      doc.setFontSize(11);
      doc.setFont('Calibri', 'bold');
      doc.text(customer.name, 15, 50);
      doc.setFontSize(10);
      doc.setFont('Calibri', 'normal');
      if (customer.contacts && customer.contacts.length > 0) {
        const primaryContact = customer.contacts[0];
        doc.text(`Sayın: ${primaryContact.name}`, 15, 60);
      }
      if (customer.address) {
        doc.text(`Adres: ${customer.address}`, 15, 70);
      }

      // Teklif detayları (sağ taraf)
      doc.setFontSize(10);
      doc.setFont('Calibri', 'bold');
      doc.text(`Tarih: ${new Date(quote.createdAt).toLocaleDateString('tr-TR')}`, 190, 35, { align: 'right' });
      
      // Teklif No - başlık bold, değer normal
      doc.setFont('Calibri', 'bold');
      doc.text('Teklif No : ', 130, 50);
      doc.setFont('Calibri', 'normal');
      const quoteText = quote.quoteNumber;
      const quoteMaxWidth = 200 - 130 - 25; // Sağ border'a kadar olan alan - başlık genişliği
      const quoteLines = doc.splitTextToSize(quoteText, quoteMaxWidth);
      let quoteY = 50;
      quoteLines.forEach((line: string) => {
        doc.text(line, 130 + 25, quoteY, { align: 'left' });
        quoteY += 5; // Satır arası boşluk
      });
      
      // Proje adı - başlık bold, değer normal
      doc.setFont('Calibri', 'bold');
      doc.text('Proje Adi : ', 130, Math.max(60, quoteY + 5));
      doc.setFont('Calibri', 'normal');
      const projectText = quote.projectName || 'N/A';
      const maxWidth = 200 - 130 - 25; // Sağ border'a kadar olan alan - başlık genişliği
      const projectLines = doc.splitTextToSize(projectText, maxWidth);
      let projectY = Math.max(60, quoteY + 5); // Teklif no'dan sonra en az 5px boşluk
      projectLines.forEach((line: string) => {
        doc.text(line, 130 + 25, projectY, { align: 'left' });
        projectY += 5; // Satır arası boşluk
      });

      // Tablo verilerini hazırla
      const tableData = quote.items.map((item, index) => {
        const product = products.find(p => p.id === item.productId);
        const productName = product?.name || 'Bilinmeyen Ürün';
        const total = item.price * item.quantity;
        
        return [
          (index + 1).toString(),
          '', // Resim sütunu boş bırakılır, didDrawCell'de eklenir
          '', // Ürün adı ve açıklama tamamen didDrawCell'de manuel olarak yazılır
          formatCurrency(item.price),
          item.quantity.toString(),
          formatCurrency(total)
        ];
      });

      // Tablo başlangıç pozisyonunu hesapla
      const tableStartY = Math.max(85, projectY + 10); // Proje adından sonra en az 10px boşluk
      
      // autoTable ile tablo oluştur
      autoTable(doc, {
        head: [['No', 'Görsel', 'Ürün/Hizmet', 'Birim Fiyat', 'Adet', 'Toplam']],
        body: tableData,
        startY: tableStartY,
        margin: { left: 15, right: 15, top: 25 }, // Top margin eklendi
        tableWidth: 180, // Tablo genişliği sabit - sayfa genişliğine uygun
        styles: {
          font: 'Calibri',
          fontSize: 10,
          cellPadding: 6,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'top',
          minCellHeight: 20,
          cellWidth: 'auto'
        },
        columnStyles: {
          0: { cellWidth: 12, overflow: 'visible' }, // No - %7
          1: { cellWidth: 18 }, // Ürün Resmi - %10
          2: { cellWidth: 75, overflow: 'linebreak', halign: 'left', valign: 'top', fontSize: 10 }, // Ürün/Hizmet - %42 (küçültüldü)
          3: { cellWidth: 28, fontSize: 9 }, // Birim Fiyat - %16
          4: { cellWidth: 17, overflow: 'visible' }, // Adet - %9 (artırıldı)
          5: { cellWidth: 30, fontSize: 9 }, // Toplam - %16
        },
        headStyles: {
          fillColor: [255, 137, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          minCellHeight: 8,  // Başlık yüksekliği artırıldı
          cellPadding: 4      // Başlık padding'i artırıldı
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        pageBreak: 'auto',
        didDrawPage: function(data) {
          // Her sayfada border çiz
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.rect(marginLeft, marginTop, w, h, 'S');
          
          // Her sayfada logo ve mail bilgileri
          doc.setFontSize(9);
          doc.setTextColor(128, 128, 128);
          doc.text('info@parkpicasso.com | www.parkpicasso.com', 201, 13, { align: 'right' });

          try {
            doc.addImage('/src/assets/logov2.png', 'PNG', 15, 8, 60, 10);
          } catch (error) {
            console.log('Logo eklenirken hata:', error);
          }
          
          // İlk sayfa için ek bilgiler
          if (data.pageNumber === 1) {
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.setFont('Calibri', 'bold');
            doc.text('TEKLİF FORMU', 15, 35);

            doc.setFontSize(11);
            doc.setFont('Calibri', 'bold');
            doc.text(customer.name, 15, 50);
            doc.setFontSize(10);
            doc.setFont('Calibri', 'normal');
            if (customer.contacts && customer.contacts.length > 0) {
              const primaryContact = customer.contacts[0];
              doc.text(`Sayın: ${primaryContact.name}`, 15, 60);
            }
            if (customer.address) {
              doc.text(`Adres: ${customer.address}`, 15, 70);
            }

            doc.setFontSize(10);
            doc.setFont('Calibri', 'bold');
            doc.text(`Tarih: ${new Date(quote.createdAt).toLocaleDateString('tr-TR')}`, 190, 35, { align: 'right' });
            
            // Teklif No - başlık bold, değer normal
            doc.setFont('Calibri', 'bold');
            doc.text('Teklif No : ', 130, 50);
            doc.setFont('Calibri', 'normal');
            const quoteText = quote.quoteNumber;
            const quoteMaxWidth = 200 - 130 - 25; // Sağ border'a kadar olan alan - başlık genişliği
            const quoteLines = doc.splitTextToSize(quoteText, quoteMaxWidth);
            let quoteY = 50;
            quoteLines.forEach((line: string) => {
              doc.text(line, 130 + 25, quoteY, { align: 'left' });
              quoteY += 5; // Satır arası boşluk
            });
            // Proje adı ana kısımda yazılıyor, burada tekrar yazmıyoruz
          }
        },
        didParseCell: function(data) {
          // Sütun genişlikleri columnStyles ile ayarlanıyor
        },
        didDrawCell: function(data) {
          // Birim fiyat ve toplam sütunlarını sağa hizala ve font boyutunu küçült
          if (data.column.index === 3 || data.column.index === 5) {
            data.cell.styles.halign = 'right';
            data.cell.styles.fontSize = 9; // Fiyat sütunları için daha küçük font
          }
          

          
          // Ürün/Hizmet sütunu için manuel metin yazma
          if (data.column.index === 2 && data.row.section === 'body' && data.row.index >= 0) {
            const item = quote.items[data.row.index];
            const product = products.find(p => p.id === item.productId);
            const productName = product?.name || 'Bilinmeyen Ürün';
            
            // Hangi ürün adını kullanacağımızı belirle
            let displayName = productName;
            if (item.customName && item.customName.trim()) {
              displayName = item.customName.trim();
            }
            
            // Hangi açıklamayı kullanacağımızı belirle
            let descriptionText = '';
            
            // Önce custom description kontrol et
            if (item.customDescription && item.customDescription.trim()) {
              descriptionText = item.customDescription.trim().replace(/\n+/g, ' ');
            } 
            // Custom description yoksa product description kontrol et
            else if (item.productDescription && item.productDescription.trim()) {
              descriptionText = item.productDescription.trim().replace(/\n+/g, ' ');
            }
            
            // Ürün adını bold olarak yaz
            doc.setFontSize(10);
            doc.setFont('Calibri', 'bold');
            doc.text(displayName, data.cell.x + 3, data.cell.y + 6);
            
            // Eğer açıklama varsa, altına ekle
            if (descriptionText) {
              doc.setFont('Calibri', 'normal');
              doc.setFontSize(9);
              
              // Açıklamayı satırlara böl
              const maxWidth = data.cell.width - 6; // Padding için 6px çıkar
              const lines = doc.splitTextToSize(descriptionText, maxWidth);
              
              let yOffset = 12; // Ürün adından sonra başla
              lines.forEach((line: string) => {
                doc.text(line, data.cell.x + 3, data.cell.y + yOffset);
                yOffset += 4; // Satır arası boşluk
              });
            }
          }
          
          // Ürün resmi sütunu için gerçek resim ekle (sadece veri satırları için)
          // Header satırı kontrolü: data.row.section === 'body' ile kontrol edelim
          if (data.column.index === 1 && data.row.section === 'body' && data.row.index >= 0) {
            const item = quote.items[data.row.index];
            const product = products.find(p => p.id === item.productId);
            
            if (product?.image) {
              try {
                // Resim boyutları - hücre genişliğine uygun
                const cellWidth = data.cell.width;
                const cellHeight = data.cell.height;
                
                // Resim boyutunu hücre boyutuna göre ayarla (padding için boşluk bırak)
                const imageSize = Math.min(cellWidth - 4, cellHeight - 4, 25); // Maksimum 25px
                
                // Resmi hücrenin ortasına yerleştir
                const imageX = data.cell.x + (cellWidth - imageSize) / 2;
                const imageY = data.cell.y + (cellHeight - imageSize) / 2;
                
                doc.addImage(product.image, 'JPEG', imageX, imageY, imageSize, imageSize);
              } catch (error) {
                console.log('Ürün resmi eklenirken hata:', error);
                // Hata durumunda image-off icon ekle
                const iconSize = 10;
                const iconX = data.cell.x + (data.cell.width - iconSize) / 2;
                const iconY = data.cell.y + (data.cell.height - iconSize) / 2;
                addImageOffIcon(doc, iconX, iconY, iconSize);
              }
            } else {
              // Resim yoksa image-off icon ekle
              const iconSize = 10;
              const iconX = data.cell.x + (data.cell.width - iconSize) / 2;
              const iconY = data.cell.y + (data.cell.height - iconSize) / 2;
              addImageOffIcon(doc, iconX, iconY, iconSize);
            }
          }
        }
      });

      // Toplam bilgileri ve Custom Terms & Conditions için sayfa kontrolü
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const currentPageHeight = doc.internal.pageSize.getHeight();
      const currentMarginBottom = 13;
      const availableSpace = currentPageHeight - currentMarginBottom - finalY;
      
      // Toplam bilgileri için gerekli alan hesaplama
      const totalsHeight = 10; // Ara toplam, KDV, Genel toplam için
      let customTermsHeight = 0;
      
      if (quote.customTerms) {
        // Custom Terms başlığı için alan
        if (quote.customTermsTitle) {
          const titleMaxWidth = 190 - 20;
          const titleLines = doc.splitTextToSize(quote.customTermsTitle, titleMaxWidth);
          customTermsHeight += titleLines.length * 6 + 4;
        }
        
        // Custom Terms içeriği için alan
        const contentMaxWidth = 190 - 20;
        const contentLines = doc.splitTextToSize(quote.customTerms, contentMaxWidth);
        customTermsHeight += contentLines.length * 5 + 35; // 35 = başlık ile toplam arası boşluk
      }
      
      const totalRequiredHeight = totalsHeight + customTermsHeight;
      
      // Daha esnek alan kontrolü - sadece gerçekten gerekli olduğunda yeni sayfa ekle
      // Minimum 50px boşluk bırak ve QR kodu için 25px alan ayır
      const minimumRequiredSpace = totalRequiredHeight ;
      const shouldAddNewPage = availableSpace < minimumRequiredSpace;
      
      // Eğer yeterli alan yoksa yeni sayfa ekle
      if (shouldAddNewPage) {
        doc.addPage();
        // Yeni sayfada border çiz
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(marginLeft, marginTop, w, h, 'S');
        
        // Yeni sayfada logo ve mail bilgileri
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('info@parkpicasso.com | www.parkpicasso.com', 201, 13, { align: 'right' });

        try {
          doc.addImage('/src/assets/logov2.png', 'PNG', 15, 8, 60, 10);
        } catch (error) {
          console.log('Logo eklenirken hata:', error);
        }
        
        // Yeni sayfada başlangıç pozisyonu
        const newPageStartY = marginTop + 20;
        
                 // Toplam bilgileri - Yeni sayfada
         doc.setFontSize(11);
         doc.setTextColor(0, 0, 0); // Siyah renk
         doc.setFont('Calibri', 'bold');
         doc.text('Ara Toplam:', 140, newPageStartY, { align: 'right' });
         doc.setFont('Calibri', 'normal');
         doc.text(formatCurrency(calculateQuoteSubtotal()), 190, newPageStartY, { align: 'right' });
         
         // Separator çizgisi - Ara Toplam ile KDV arası
         doc.setDrawColor(180, 180, 180);
         doc.setLineWidth(0.2);
         doc.line(120, newPageStartY + 6, 190, newPageStartY + 6);
         
         doc.setFont('Calibri', 'bold');
         doc.text(`KDV (${quote.vatRate}%):`, 140, newPageStartY + 10, { align: 'right' });
         doc.setFont('Calibri', 'normal');
         doc.text(formatCurrency(calculateQuoteTax()), 190, newPageStartY + 10, { align: 'right' });
         
         // Separator çizgisi - KDV ile Genel Toplam arası
         doc.setDrawColor(180, 180, 180);
         doc.setLineWidth(0.2);
         doc.line(120, newPageStartY + 16, 190, newPageStartY + 16);
         
         doc.setFontSize(12);
         doc.setFont('Calibri', 'bold');
         doc.text('Genel Toplam:', 140, newPageStartY + 20, { align: 'right' });
         const totalAmount = calculateQuoteTotal();
         const formattedTotal = new Intl.NumberFormat('tr-TR', {
           style: 'currency',
           currency: 'TRY',
           minimumFractionDigits: 2,
           maximumFractionDigits: 2
         }).format(totalAmount);
         doc.text(formattedTotal, 190, newPageStartY + 20, { align: 'right' });
         

                 // Custom Terms & Conditions - Yeni sayfada
         if (quote.customTerms) {
           let termsY = newPageStartY + 35;
           
           // Başlık (bold) - uzun ise aşağı satıra geçer
           if (quote.customTermsTitle) {
             doc.setFontSize(11);
             doc.setTextColor(0, 0, 0); // Siyah renk
             doc.setFont('Calibri', 'bold');
             const titleMaxWidth = 190 - 20; // Sağ border'a kadar olan alan
             const titleLines = doc.splitTextToSize(quote.customTermsTitle, titleMaxWidth);
             titleLines.forEach((line: string) => {
               doc.text(line, 20, termsY);
               termsY += 6; // Başlık satır arası boşluk
             });
             termsY += 4; // Başlık ile içerik arası ekstra boşluk
           }
           
           // İçerik (normal) - uzun ise aşağı satıra geçer
           doc.setFontSize(10);
           doc.setTextColor(0, 0, 0); // Siyah renk
           doc.setFont('Calibri', 'normal');
           const contentMaxWidth = 190 - 20; // Sağ border'a kadar olan alan
           const contentLines = doc.splitTextToSize(quote.customTerms, contentMaxWidth);
           contentLines.forEach((line: string) => {
             doc.text(line, 20, termsY);
             termsY += 5; // İçerik satır arası boşluk
           });
         }
        
                 // QR kodu ve footer - Yeni sayfada
         try {
           const qrSize = 15;
           const margin = 13;
           doc.addImage('/qr-code.png', 'PNG', margin, currentPageHeight - 20, qrSize, qrSize);
         } catch (error) {
           console.log('QR kodu eklenirken hata:', error);
         }

         // Footer - Yeni sayfada
         doc.setFontSize(8);
         doc.setTextColor(128, 128, 128);
         doc.setFont('Calibri', 'normal');
         doc.text('+90 553 886 5598 | info@parkpicasso.com | www.parkpicasso.com', 105, currentPageHeight - 9, { align: 'center' });
         doc.text('Güller pınarı mahallesi, Demirel sokak, Güvercin apt , no:27/c', 105, currentPageHeight - 4, { align: 'center' });
        
             } else {
                  // Yeterli alan varsa mevcut sayfada devam et (daha esnek kontrol)
         doc.setFontSize(11);
         doc.setFont('Calibri', 'bold');
         doc.text('Ara Toplam:', 140, finalY, { align: 'right' });
         doc.setFont('Calibri', 'normal');
         doc.text(formatCurrency(calculateQuoteSubtotal()), 190, finalY, { align: 'right' });
         
         // Separator çizgisi - Ara Toplam ile KDV arası
         doc.setDrawColor(180, 180, 180);
         doc.setLineWidth(0.2);
         doc.line(120, finalY + 2, 190, finalY + 2);
         
         doc.setFont('Calibri', 'bold');
         doc.text(`KDV (${quote.vatRate}%):`, 140, finalY + 10, { align: 'right' });
         doc.setFont('Calibri', 'normal');
         doc.text(formatCurrency(calculateQuoteTax()), 190, finalY + 10, { align: 'right' });
         
         // Separator çizgisi - KDV ile Genel Toplam arası
         doc.setDrawColor(180, 180, 180);
         doc.setLineWidth(0.2);
         doc.line(120, finalY + 13, 190, finalY + 13);
         
         doc.setFontSize(12);
         doc.setFont('Calibri', 'bold');
         doc.text('Genel Toplam:', 140, finalY + 20, { align: 'right' });
         const totalAmount = calculateQuoteTotal();
         const formattedTotal = new Intl.NumberFormat('tr-TR', {
           style: 'currency',
           currency: 'TRY',
           minimumFractionDigits: 2,
           maximumFractionDigits: 2
         }).format(totalAmount);
         doc.text(formattedTotal, 190, finalY + 20, { align: 'right' });

        // Custom Terms & Conditions - Mevcut sayfada
        if (quote.customTerms) {
          let termsY = finalY + 35;
          
          // Başlık (bold) - uzun ise aşağı satıra geçer
          if (quote.customTermsTitle) {
            doc.setFontSize(11);
            doc.setFont('Calibri', 'bold');
            const titleMaxWidth = 190 - 20; // Sağ border'a kadar olan alan
            const titleLines = doc.splitTextToSize(quote.customTermsTitle, titleMaxWidth);
            titleLines.forEach((line: string) => {
              doc.text(line, 20, termsY);
              termsY += 6; // Başlık satır arası boşluk
            });
            termsY += 4; // Başlık ile içerik arası ekstra boşluk
          }
          
          // İçerik (normal) - uzun ise aşağı satıra geçer
          doc.setFontSize(10);
          doc.setFont('Calibri', 'normal');
          const contentMaxWidth = 190 - 20; // Sağ border'a kadar olan alan
          const contentLines = doc.splitTextToSize(quote.customTerms, contentMaxWidth);
          contentLines.forEach((line: string) => {
            doc.text(line, 20, termsY);
            termsY += 5; // İçerik satır arası boşluk
          });
        }
      }

             // QR kodu ve footer - Son sayfada (daha esnek kontrol)
       // Eğer toplam bilgileri mevcut sayfada gösterildiyse QR kodu da göster
       if (!shouldAddNewPage) {
        try {
          const qrSize = 15;
          const margin = 13;
          doc.addImage('/qr-code.png', 'PNG', margin, currentPageHeight - 20, qrSize, qrSize);
        } catch (error) {
          console.log('QR kodu eklenirken hata:', error);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont('Calibri', 'normal');
        doc.text('+90 553 886 5598 | info@parkpicasso.com | www.parkpicasso.com', 105, currentPageHeight - 9, { align: 'center' });
        doc.text('Güller pınarı mahallesi, Demirel sokak, Güvercin apt , no:27/c', 105, currentPageHeight - 4, { align: 'center' });
      }

      // PDF'i kaydet
      doc.save(`Teklif_${quote.quoteNumber}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Image-off icon'u eklemek için yardımcı fonksiyon
  const addImageOffIcon = (doc: jsPDF, x: number, y: number, size: number) => {
    try {
      // Image-off icon'u SVG olarak oluştur
      const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
          <line x1="3" y1="3" x2="21" y2="21"/>
        </svg>
      `;
      
      // SVG'yi base64'e çevir
      const svgBase64 = btoa(svgIcon);
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
      
      // Icon'u ekle
      doc.addImage(dataUrl, 'SVG', x, y, size, size);
    } catch (error) {
      console.log('Image-off icon eklenirken hata:', error);
    }
  };

  // Kategori listesini oluştur
  const getCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.filter(category => category && category.trim() !== '');
  };

  // Seçili kategoriye göre ürünleri filtrele
  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  // Ürün arama filtresi
  const getFilteredProducts = () => {
    let filtered = selectedCategory 
      ? getProductsByCategory(selectedCategory)
      : products;
    
    if (productSearchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Kategori seçimi
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setProductSearchTerm(''); // Arama terimini temizle
  };

  // Ürün seçimi
  const handleProductSelect = (product: Product) => {
    if (currentItemIndex >= 0) {
      updateItem(currentItemIndex, 'productId', product.id);
      setShowProductSelector(false);
      setSelectedCategory('');
      setProductSearchTerm('');
      setCurrentItemIndex(-1);
    }
  };

  // Ürün seçici modalını aç
  const openProductSelector = (itemIndex: number) => {
    setCurrentItemIndex(itemIndex);
    setShowProductSelector(true);
    setSelectedCategory('');
    setProductSearchTerm('');
  };

  // Sürükle-bırak fonksiyonları
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex !== null && draggedItemIndex !== dropIndex) {
      const newItems = [...formData.items];
      const draggedItem = newItems[draggedItemIndex];
      newItems.splice(draggedItemIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      setFormData({ ...formData, items: newItems });
    }
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  // Collapsible items için fonksiyonlar
  const toggleItemExpansion = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };

  // Resim yükleme fonksiyonları
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setQuickAddProductData({ ...quickAddProductData, image: result });
    };
    reader.readAsDataURL(file);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImage(true);
  };

  const handleImageDragLeave = () => {
    setDragOverImage(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImage(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  // Hızlı ürün ekleme fonksiyonları
  const handleQuickAddProduct = () => {
    if (!quickAddProductData.name || !quickAddProductData.category) {
      alert('Ürün adı ve kategori zorunludur');
      return;
    }

    try {
      const newProduct = productStorage.create({
        name: quickAddProductData.name,
        description: quickAddProductData.description,
        price: quickAddProductData.price,
        category: quickAddProductData.category,
        stock: quickAddProductData.stock,
        sku: quickAddProductData.sku || `SKU-${Date.now()}`,
        image: quickAddProductData.image
      });

      // Ürün listesini güncelle
      setProducts([...products, newProduct]);
      
      // Hızlı eklenen ürünü otomatik seç
      handleProductSelect(newProduct);
      
      // Form'u temizle
      setQuickAddProductData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        sku: '',
        image: ''
      });
      setShowQuickAddProduct(false);
      
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Ürün eklenirken hata oluştu');
    }
  };

  const handleCreateSupplierOrder = (quote: Quote) => {
    // Tedarikçi seçim modalını aç
    setSelectedQuoteForSupplier(quote);
    setShowSupplierModal(true);
  };

  const handleSupplierSelect = (supplier: Customer) => {
    setSelectedSupplier(supplier);
  };

  const generateSupplierOrderPDF = async () => {
    if (!selectedQuoteForSupplier || !selectedSupplier) return;

    try {
      // jsPDF oluştur
      const doc = new jsPDF();
      
      // Calibri font ekle ve ayarla
      doc.addFileToVFS('Calibri-Regular.ttf', turkishFont);
      doc.addFileToVFS('Calibri-Bold.ttf', turkishFontBold);
      doc.addFont('Calibri-Regular.ttf', 'Calibri', 'normal');
      doc.addFont('Calibri-Bold.ttf', 'Calibri', 'bold');
      doc.setFont('Calibri', 'normal');
      doc.setFontSize(12);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Boşluklar
      const marginTop = 15;
      const marginLeft = 7;
      const marginRight = 7;
      const marginBottom = 13;

      // Dikdörtgenin konumu ve boyutu
      const x = marginLeft;
      const y = marginTop;
      const w = pageWidth - marginLeft - marginRight;
      const h = pageHeight - marginTop - marginBottom;

      // Ana border çiz
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, w, h, 'S');

      // Ana başlık - SİPARİŞ FORMU
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Calibri', 'bold');
      doc.text('SİPARİŞ FORMU', 15, 35);

      // Tedarikçi bilgileri (sol taraf)
      if (selectedSupplier.logo) {
        // Logo varsa logo göster - Canvas ile transparanlık düzeltmesi
        try {
          // Canvas oluştur ve logo'yu işle
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          // Promise ile asenkron işlemi bekleyelim
          await new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                // Yüksek kalite için 4x çözünürlük kullan
                const scaleFactor = 4;
                canvas.width = 30 * scaleFactor; // 120
                canvas.height = 12 * scaleFactor; // 48
                
                // Canvas kalite ayarları
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Transparan arkaplanı koru - beyaz arkaplan ekleme
                // ctx.fillStyle = '#FFFFFF';
                // ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Logo'yu yüksek kalitede canvas'a çiz
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Canvas'ı yüksek kalitede data URL'e çevir
                const processedLogoDataURL = canvas.toDataURL('image/png', 1.0);
                
                // PDF'e yüksek kalitede ekle (30x12 boyut)
                doc.addImage(processedLogoDataURL, 'PNG', 15, 45, 30, 12, undefined, 'MEDIUM');
                
                resolve(true);
              } catch (error) {
                reject(error);
              }
            };
            
            img.onerror = () => {
              reject(new Error('Logo yüklenemedi'));
            };
            
            img.src = selectedSupplier.logo;
          });
          
          // Logo varsa firma ismini gizle, sadece "Sayın [İletişim Kişisi]" yaz
          if (selectedSupplier.contacts && selectedSupplier.contacts.length > 0) {
            const primaryContact = selectedSupplier.contacts.find(c => c.isPrimary) || selectedSupplier.contacts[0];
            doc.setFontSize(10);
            doc.setFont('Calibri', 'normal');
            doc.text(`Sayın ${primaryContact.name}`, 15, 65);
          }
        } catch (error) {
          console.log('Logo yükleme hatası:', error);
          // Logo yüklenemezse firma ismini göster
          doc.setFontSize(11);
          doc.setFont('Calibri', 'bold');
          doc.text(selectedSupplier.name, 15, 50);
        }
      } else {
        // Logo yoksa firma ismini göster
        doc.setFontSize(11);
        doc.setFont('Calibri', 'bold');
        doc.text(selectedSupplier.name, 15, 50);
      }
      
      doc.setFontSize(10);
      doc.setFont('Calibri', 'normal');
      if (selectedSupplier.contacts && selectedSupplier.contacts.length > 0) {
        const primaryContact = selectedSupplier.contacts.find(c => c.isPrimary) || selectedSupplier.contacts[0];
        // Logo varsa "Sayın" yazısı zaten var, tekrar yazma
        if (!selectedSupplier.logo) {
          doc.text(`İletişim: ${primaryContact.name}`, 15, 60);
        }
      }
      if (selectedSupplier.address) {
        const addressY = selectedSupplier.logo ? 75 : 70;
        doc.text(`Adres: ${selectedSupplier.address}`, 15, addressY);
      }

      // Sipariş detayları (sağ taraf)
      doc.setFontSize(10);
      doc.setFont('Calibri', 'bold');
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 190, 35, { align: 'right' });
      
      // Sipariş No
      doc.setFont('Calibri', 'bold');
      doc.text('Sipariş No : ', 130, 50);
      doc.setFont('Calibri', 'normal');
      doc.text(`SO-${Date.now()}`, 130 + 25, 50);
      
      // Proje adı
      const project = projects.find(p => p.id === selectedQuoteForSupplier.projectId);
      doc.setFont('Calibri', 'bold');
      doc.text('Proje Adi : ', 130, 60);
      doc.setFont('Calibri', 'normal');
      doc.text(project?.name || 'Proje Adı Yok', 130 + 25, 60);

      // Tablo verilerini hazırla (4 kolon: No, Görsel, Ürün/Hizmet, Adet)
      const tableData = selectedQuoteForSupplier.items.map((item, index) => {
        return [
          (index + 1).toString(),
          '', // Resim sütunu boş bırakılır, didDrawCell'de eklenir
          '', // Ürün adı tamamen didDrawCell'de manuel olarak yazılır
          item.quantity.toString()
        ];
      });

      // Tablo başlangıç pozisyonunu hesapla
      const tableStartY = 85;
      
      // autoTable ile tablo oluştur - teklif formu mantığı
      autoTable(doc, {
        head: [['No', 'Görsel', 'Ürün/Hizmet', 'Adet']],
        body: tableData,
        startY: tableStartY,
        margin: { left: 22, right: 10, top: 25 },
        tableWidth: 220,
        styles: {
          font: 'Calibri',
          fontSize: 10,
          cellPadding: 6,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'top',
          minCellHeight: 20,
          cellWidth: 'auto'
        },
        columnStyles: {
          0: { cellWidth: 15, overflow: 'visible' }, // No
          1: { cellWidth: 25 }, // Görsel
          2: { cellWidth: 100, overflow: 'linebreak', halign: 'left', valign: 'top', fontSize: 10 }, // Ürün/Hizmet
          3: { cellWidth: 25, overflow: 'visible' }, // Adet
        },
        headStyles: {
          fillColor: [255, 137, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          minCellHeight: 8,
          cellPadding: 4
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        pageBreak: 'auto',
        didDrawCell: (data) => {
          // Ürün/Hizmet sütunu için manuel metin yazma
          if (data.column.index === 2 && data.row.section === 'body' && data.row.index >= 0) {
            const item = selectedQuoteForSupplier.items[data.row.index];
            const product = products.find(p => p.id === item.productId);
            const productName = product?.name || 'Bilinmeyen Ürün';
            
            // Ürün adını bold olarak yaz
            doc.setFontSize(10);
            doc.setFont('Calibri', 'bold');
            doc.text(productName, data.cell.x + 3, data.cell.y + 6);
          }
          
          // Ürün resmi sütunu için gerçek resim ekle (sadece veri satırları için)
          if (data.column.index === 1 && data.row.section === 'body' && data.row.index >= 0) {
            const item = selectedQuoteForSupplier.items[data.row.index];
            const product = products.find(p => p.id === item.productId);
            
            if (product?.image) {
              try {
                // Resim boyutları - hücre genişliğine uygun
                const cellWidth = data.cell.width;
                const cellHeight = data.cell.height;
                
                // Resim boyutunu hücre boyutuna göre ayarla (padding için boşluk bırak)
                const imageSize = Math.min(cellWidth - 4, cellHeight - 4, 25); // Maksimum 25px
                
                // Resmi hücrenin ortasına yerleştir
                const imageX = data.cell.x + (cellWidth - imageSize) / 2;
                const imageY = data.cell.y + (cellHeight - imageSize) / 2;
                
                doc.addImage(product.image, 'JPEG', imageX, imageY, imageSize, imageSize);
              } catch (error) {
                console.log('Ürün resmi eklenirken hata:', error);
              }
            }
          }
        },
        didDrawPage: function(data) {
          // Her sayfada border çiz
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.rect(marginLeft, marginTop, w, h, 'S');
          
          // Her sayfada logo ve mail bilgileri
          doc.setFontSize(9);
          doc.setTextColor(128, 128, 128);
          doc.text('info@parkpicasso.com | www.parkpicasso.com', 201, 13, { align: 'right' });

          try {
            doc.addImage('/src/assets/logov2.png', 'PNG', 15, 8, 60, 10);
          } catch (error) {
            console.log('Logo eklenirken hata:', error);
          }
        }
      });


      // PDF'i kaydet
      doc.save(`Siparis_${selectedSupplier.name}_${Date.now()}.pdf`);
      
      // Modal'ı kapat
      setShowSupplierModal(false);
      setSelectedQuoteForSupplier(null);
      setSelectedSupplier(null);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
          <p className="text-gray-600 mt-1">Profesyonel teklifler oluşturun ve yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Teklif
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Teklif ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeFiltersCount > 0 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 inline mr-2" />
            Filtreler {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <div className="text-sm text-gray-500">
            {filteredQuotes.length} / {quotes.length} teklif
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Customer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="input-field"
                >
                  <option value="">Tüm müşteriler</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({getQuoteCountByCustomer(customer.id)} teklif)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="">Tüm durumlar</option>
                  <option value="draft">Taslak</option>
                  <option value="sent">Gönderildi</option>
                  <option value="accepted">Kabul Edildi</option>
                  <option value="rejected">Reddedildi</option>
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotes.map((quote) => (
          <div key={quote.id} className="dashboard-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{quote.quoteNumber}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quote.status}
                </span>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  onClick={() => generatePDF(quote)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(quote)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(quote.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{quote.notes}</p>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{getCustomerName(quote.customerId)}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Date: {new Date(quote.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span>{quote.items.length} items</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="font-semibold text-green-600">{formatCurrency(quote.total)}</span>
              </div>
            </div>

            {/* Tedarikçi Siparişi Butonu - Sadece kabul edilen teklifler için */}
            {quote.status === 'accepted' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleCreateSupplierOrder(quote)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Tedarikçi Siparişi Oluştur
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No quotes found' : 'No quotes yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by creating your first quote'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Quote
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingQuote ? 'Teklifi Düzenle' : 'Yeni Teklif'}
          </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Müşteri *
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Müşteri seçin</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.type === 'company' && customer.companyName ? `(${customer.companyName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teklif Numarası *
                    </label>
                    <input
                      type="text"
                      value={formData.quoteNumber}
                      onChange={(e) => setFormData({ ...formData, quoteNumber: e.target.value })}
                      className="input-field bg-gray-50"
                      placeholder="Otomatik oluşturulur"
                      required
                      readOnly
                      title="Teklif numarası otomatik olarak oluşturulur"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Durum
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="draft">Taslak</option>
                      <option value="sent">Gönderildi</option>
                      <option value="accepted">Kabul Edildi</option>
                      <option value="rejected">Reddedildi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      KDV Oranı (%)
                    </label>
                    <input
                      type="number"
                      value={formData.vatRate}
                      onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 20 })}
                      className="input-field"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Proje Adı
                    </label>
                    <div className="space-y-2">
                      <select
                        value={formData.projectId || ''}
                        onChange={(e) => {
                          const selectedProjectId = e.target.value;
                          if (selectedProjectId) {
                            const selectedProject = projects.find(p => p.id === selectedProjectId);
                            const newProjectName = selectedProject?.name || '';
                            setFormData({ 
                              ...formData, 
                              projectId: selectedProjectId,
                              projectName: newProjectName,
                              quoteNumber: quoteStorage.generateQuoteNumber(newProjectName)
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              projectId: '',
                              projectName: '',
                              quoteNumber: quoteStorage.generateQuoteNumber()
                            });
                          }
                        }}
                        className="input-field"
                      >
                        <option value="">Mevcut projelerden seçin veya özel ad girin</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={formData.projectName || ''}
                        onChange={(e) => {
                          const newProjectName = e.target.value;
                          setFormData({ 
                            ...formData, 
                            projectName: newProjectName,
                            projectId: '', // Özel ad girildiğinde projectId'yi temizle
                            quoteNumber: quoteStorage.generateQuoteNumber(newProjectName)
                          });
                        }}
                        className="input-field"
                        placeholder="Özel proje adı girin"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Geçerlilik Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Özel Şartlar ve Koşullar
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.customTermsTitle || ''}
                      onChange={(e) => setFormData({ ...formData, customTermsTitle: e.target.value })}
                      className="input-field"
                      placeholder="Başlık girin (örn: Özel Şartlar, Teslimat Koşulları, vb.)"
                    />
                    <textarea
                      value={formData.customTerms || ''}
                      onChange={(e) => setFormData({ ...formData, customTerms: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Özel şartlar ve koşulları girin"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Ürünler *
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="btn-secondary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ürün Ekle
                    </button>
                  </div>

                  {formData.items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Henüz ürün eklenmedi</p>
                    </div>
                  ) : (
                                        <div className="space-y-2">
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        const isExpanded = expandedItems.has(index);
                        return (
                          <div 
                            key={index} 
                            className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ${
                              draggedItemIndex === index ? 'opacity-50 scale-95' : ''
                            } ${
                              dragOverItemIndex === index ? 'border-blue-300 bg-blue-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            {/* Ürün Başlığı - Her zaman görünür */}
                            <div className="p-3 bg-gray-50 border-b border-gray-100">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-6 h-6 text-gray-400 cursor-move hover:text-gray-600">
                                  <Move className="h-3 w-3" />
                                </div>
                                
                                {/* Ürün Seçimi */}
                                <button
                                  type="button"
                                  onClick={() => openProductSelector(index)}
                                  className="flex-1 text-left px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                  {item.productId ? (
                                    <span className="text-gray-900">
                                      {item.customName && item.customName.trim() ? item.customName : getProductName(item.productId)} - {formatCurrency(getProductPrice(item.productId))}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">Ürün seçmek için tıklayın</span>
                                  )}
                                </button>
                                
                                {/* Ürün Seç Butonu */}
                                <button
                                  type="button"
                                  onClick={() => openProductSelector(index)}
                                  className="px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <Grid className="h-3 w-3" />
                                </button>
                                
                                {/* Expand/Collapse Butonu */}
                                {item.productId && (
                                  <button
                                    type="button"
                                    onClick={() => toggleItemExpansion(index)}
                                    className="px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  >
                                    <svg 
                                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                                
                                {/* Silme Butonu */}
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              
                              {/* Özet Bilgiler - Her zaman görünür */}
                              {item.productId && (
                                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center space-x-4">
                                    <span>Miktar: {item.quantity}</span>
                                    <span>Birim: {formatCurrency(item.price)}</span>
                                  </div>
                                  <span className="font-semibold text-green-600">
                                    Toplam: {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Ürün Detayları - Sadece genişletildiğinde görünür */}
                            {item.productId && isExpanded && (
                              <div className="p-4 bg-white">
                                {/* Ürün Adı ve Açıklama */}
                                <div className="mb-4">
                                  <h4 className="font-bold text-gray-900 mb-2">
                                    {item.customName && item.customName.trim() ? item.customName : item.description}
                                  </h4>
                                  {item.productDescription && (
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600 mb-2">Ürün Açıklaması:</p>
                                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                                        {item.productDescription}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Özel Ürün Adı */}
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Proje Özel Ürün Adı:
                                    </label>
                                    <input
                                      type="text"
                                      value={item.customName || ''}
                                      onChange={(e) => {
                                        const newItems = [...formData.items];
                                        newItems[index] = { ...newItems[index], customName: e.target.value };
                                        setFormData({ ...formData, items: newItems });
                                      }}
                                      className="input-field w-full"
                                      placeholder="Bu ürün için proje özel adı girin (boş bırakırsanız orijinal ad kullanılır)"
                                    />
                                  </div>
                                  
                                  {/* Özel Açıklama */}
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Proje Özel Açıklaması:
                                    </label>
                                    <textarea
                                      value={item.customDescription || ''}
                                      onChange={(e) => {
                                        const newItems = [...formData.items];
                                        newItems[index] = { ...newItems[index], customDescription: e.target.value };
                                        setFormData({ ...formData, items: newItems });
                                      }}
                                      className="input-field w-full"
                                      rows={3}
                                      placeholder="Bu ürün için proje özel açıklaması girin (boyut, malzeme değişiklikleri vb.)"
                                    />
                                  </div>
                                </div>

                                {/* Fiyat ve Miktar Düzenleme */}
                                <div className="flex items-center space-x-4">
                                  <div className="w-24">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                      className="input-field"
                                      min="1"
                                      required
                                    />
                                  </div>
                                  <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birim Fiyat</label>
                                    <input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                      className="input-field"
                                      min="0"
                                      step="0.01"
                                      required
                                    />
                                  </div>
                                  <div className="w-32 text-right">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Toplam</label>
                                    <span className="font-semibold text-green-600 text-lg">
                                      {formatCurrency(item.price * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Totals */}
                  {formData.items.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Ara Toplam:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>VAT ({formData.vatRate}%):</span>
                        <span>{formatCurrency(calculateTax())}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
                        <span>Toplam:</span>
                        <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingQuote ? 'Teklifi Güncelle' : 'Teklif Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary flex-1"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Seçici Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ürün Seç</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowQuickAddProduct(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1 inline" />
                    Hızlı Ürün Ekle
                  </button>
                  <button
                    onClick={() => {
                      setShowProductSelector(false);
                      setSelectedCategory('');
                      setProductSearchTerm('');
                      setCurrentItemIndex(-1);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Arama */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Kategori Seçimi */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Seç</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getCategories().map((category) => {
                    const categoryProducts = getProductsByCategory(category);
                    const firstProduct = categoryProducts[0];
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedCategory === category
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                          {firstProduct?.image ? (
                            <img
                              src={firstProduct.image}
                              alt={category}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900">{category}</h4>
                          <p className="text-sm text-gray-500">{categoryProducts.length} ürün</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ürün Listesi */}
              {selectedCategory && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCategory} Kategorisi ({getFilteredProducts().length} ürün)
                    </h3>
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Tüm kategorileri göster
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredProducts().map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                      >
                        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Stok: {product.stock}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kategori seçilmemişse tüm ürünleri göster */}
              {!selectedCategory && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tüm Ürünler ({getFilteredProducts().length} ürün)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredProducts().map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                      >
                        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                            <div className="text-right">
                              <span className="text-xs text-gray-500 block">
                                {product.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                Stok: {product.stock}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hızlı Ürün Ekleme Modal */}
      {showQuickAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Hızlı Ürün Ekle</h2>
                <button
                  onClick={() => {
                    setShowQuickAddProduct(false);
                    setQuickAddProductData({
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      stock: 0,
                      sku: '',
                      image: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleQuickAddProduct(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={quickAddProductData.name}
                    onChange={(e) => setQuickAddProductData({...quickAddProductData, name: e.target.value})}
                    className="input-field w-full"
                    placeholder="Ürün adını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={quickAddProductData.category}
                    onChange={(e) => setQuickAddProductData({...quickAddProductData, category: e.target.value})}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {getCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resim Yükleme Alanı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Resmi
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragOverImage 
                        ? 'border-blue-400 bg-blue-50' 
                        : quickAddProductData.image 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                  >
                    {quickAddProductData.image ? (
                      <div className="space-y-2">
                        <img 
                          src={quickAddProductData.image} 
                          alt="Ürün resmi" 
                          className="mx-auto max-h-32 max-w-full rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setQuickAddProductData({...quickAddProductData, image: ''})}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Resmi Kaldır
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Package className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Resmi buraya sürükleyin veya tıklayın
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Dosya Seç
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={quickAddProductData.description}
                    onChange={(e) => setQuickAddProductData({...quickAddProductData, description: e.target.value})}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Ürün açıklaması"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={quickAddProductData.price}
                      onChange={(e) => setQuickAddProductData({...quickAddProductData, price: parseFloat(e.target.value) || 0})}
                      className="input-field w-full"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      value={quickAddProductData.stock}
                      onChange={(e) => setQuickAddProductData({...quickAddProductData, stock: parseInt(e.target.value) || 0})}
                      className="input-field w-full"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Ürün Ekle ve Seç
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddProduct(false);
                      setQuickAddProductData({
                        name: '',
                        description: '',
                        price: 0,
                        category: '',
                        stock: 0,
                        sku: '',
                        image: ''
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tedarikçi Seçim Modal */}
      {showSupplierModal && selectedQuoteForSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Tedarikçi Seçimi
                </h2>
                <button
                  onClick={() => {
                    setShowSupplierModal(false);
                    setSelectedQuoteForSupplier(null);
                    setSelectedSupplier(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Teklif:</strong> {selectedQuoteForSupplier.quoteNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Proje:</strong> {projects.find(p => p.id === selectedQuoteForSupplier.projectId)?.name || 'Proje Adı Yok'}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tedarikçi Seçin
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {subcontractors
                    .filter(subcontractor => subcontractor.isSupplier)
                    .map((supplier) => (
                      <div
                        key={supplier.id}
                        onClick={() => handleSupplierSelect(supplier as any)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSupplier?.id === supplier.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {supplier.logo ? (
                              <img 
                                src={supplier.logo} 
                                alt={supplier.name} 
                                className="h-12 w-12 rounded-lg object-contain bg-white border border-gray-200 flex-shrink-0" 
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Truck className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                              {supplier.email && (
                                <p className="text-sm text-gray-600">{supplier.email}</p>
                              )}
                              {supplier.phone && (
                                <p className="text-sm text-gray-600">{supplier.phone}</p>
                              )}
                              {supplier.address && (
                                <p className="text-sm text-gray-500">{supplier.address}</p>
                              )}
                            </div>
                          </div>
                          {selectedSupplier?.id === supplier.id && (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {subcontractors.filter(subcontractor => subcontractor.isSupplier).length === 0 && (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz tedarikçi yok
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Önce alt yükleniciler sayfasından tedarikçi olarak işaretleyin
                  </p>
                  <button
                    onClick={() => navigate('/subcontractors')}
                    className="btn-primary"
                  >
                    Alt Yükleniciler
                  </button>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => generateSupplierOrderPDF()}
                  disabled={!selectedSupplier}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSupplier
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  PDF Oluştur ve İndir
                </button>
                <button
                  onClick={() => {
                    setShowSupplierModal(false);
                    setSelectedQuoteForSupplier(null);
                    setSelectedSupplier(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
