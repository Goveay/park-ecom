import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, DollarSign, TrendingDown, Upload, X, Filter, Grid, List, Folder, FolderPlus, FolderEdit, Download, Upload as UploadIcon, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { productStorage, productCategoryStorage } from '../utils/storage';
import { vendureApi, VendureProductItem } from '../utils/vendureApi';
import * as XLSX from 'xlsx';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  productCount: number;
  createdAt: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'products'>('categories');
  
  // Vendure Import States
  const [showVendureModal, setShowVendureModal] = useState(false);
  const [vendureSearchTerm, setVendureSearchTerm] = useState('');
  const [vendureProducts, setVendureProducts] = useState<VendureProductItem[]>([]);
  const [vendureLoading, setVendureLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    sku: '',
    image: '',
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const productsData = productStorage.getAll();
      setProducts(productsData);
      
      // Load categories from storage
      const storedCategories = productCategoryStorage.getAll();
      
      // Generate categories from products and merge with stored categories
      const categoryMap = new Map<string, Category>();
      
      // First, add stored categories
      storedCategories.forEach(storedCategory => {
        categoryMap.set(storedCategory.name, {
          id: storedCategory.id,
          name: storedCategory.name,
          image: storedCategory.image,
          description: storedCategory.description || '',
          productCount: 0,
          createdAt: storedCategory.createdAt
        });
      });
      
      // Then, count products for each category
      productsData.forEach(product => {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, {
            id: product.category,
            name: product.category,
            image: product.image,
            description: '',
            productCount: 1,
            createdAt: product.createdAt
          });
        } else {
          const category = categoryMap.get(product.category)!;
          category.productCount++;
          if (!category.image && product.image) {
            category.image = product.image;
          }
        }
      });
      
      setCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      
      const matchesPrice = 
        (priceRange.min === '' || product.price >= parseFloat(priceRange.min)) &&
        (priceRange.max === '' || product.price <= parseFloat(priceRange.max));
      
      const matchesStock = 
        stockFilter === '' ||
        (stockFilter === 'in_stock' && product.stock > 0) ||
        (stockFilter === 'low_stock' && product.stock > 0 && product.stock < 10) ||
        (stockFilter === 'out_of_stock' && product.stock === 0);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Category management functions
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormData.name) {
      alert('Lütfen kategori adını girin');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category in storage
        productCategoryStorage.update(editingCategory.id, {
          name: categoryFormData.name,
          description: categoryFormData.description,
          image: categoryFormData.image
        });
      } else {
        // Create new category in storage
        productCategoryStorage.create({
          name: categoryFormData.name,
          description: categoryFormData.description,
          image: categoryFormData.image
        });
      }
      
      loadData(); // Reload data to reflect changes
      handleCloseCategoryModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu');
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setShowCategoryModal(true);
  };

  const handleCategoryDelete = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.productCount > 0) {
      alert(`"${category.name}" kategorisi ${category.productCount} ürün içerdiği için silinemez. Lütfen önce ürünleri taşıyın veya silin.`);
      return;
    }

    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        productCategoryStorage.delete(categoryId);
        loadData(); // Reload data to reflect changes
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Kategori silinirken hata oluştu');
      }
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      image: ''
    });
  };

  // Image upload functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isCategory: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Resim boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçin');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isCategory) {
          setCategoryFormData({ ...categoryFormData, image: result });
        } else {
          setFormData({ ...formData, image: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (isCategory: boolean = false) => {
    if (isCategory) {
      setCategoryFormData({ ...categoryFormData, image: '' });
    } else {
      setFormData({ ...formData, image: '' });
    }
  };

  // Product management functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      alert('Lütfen tüm gerekli alanları doldurun ve fiyatın 0\'dan büyük olduğundan emin olun');
      return;
    }

    if (formData.stock < 0) {
      alert('Stok miktarı negatif olamaz');
      return;
    }

    const sku = formData.sku || generateSKU(formData.category);

    try {
      if (editingProduct) {
        productStorage.update(editingProduct.id, { ...formData, sku });
      } else {
        productStorage.create({ ...formData, sku });
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu');
    }
  };

  const generateSKU = (category: string) => {
    const prefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      sku: product.sku,
      image: product.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        productStorage.delete(productId);
        loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ürün silinirken hata oluştu');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      sku: '',
      image: '',
    });
  };

  // Vendure Import Logic
  const handleSearchVendure = async () => {
    setVendureLoading(true);
    try {
      const items = await vendureApi.getProducts(vendureSearchTerm);
      setVendureProducts(items);
    } catch (error: any) {
      console.error('Vendure fetch error:', error);
      alert(`Vendure ürünleri çekilemedi.\nHata: ${error.message || 'Bilinmeyen hata'}\n\nİpucu: Vendure server (3000) açık mı ve CORS izni (5174) verildi mi?`);
    } finally {
      setVendureLoading(false);
    }
  };

  const handleImportVendureProduct = async (vProduct: VendureProductItem) => {
    // Check if already imported
    const isAlreadyImported = products.some(p => p.vendureId === vProduct.productId);
    if (isAlreadyImported) {
      alert('Bu ürün zaten management sistemine eklenmiş.');
      return;
    }

    setImportingId(vProduct.productId);
    try {
      const productData = vendureApi.convertToLocalProduct(vProduct);
      productStorage.create(productData as any);
      loadData();
      alert(`"${vProduct.productName}" başarıyla import edildi.`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Ürün import edilirken hata oluştu.');
    } finally {
      setImportingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-100', text: 'Stokta Yok' };
    if (stock < 10) return { color: 'text-yellow-600 bg-yellow-100', text: 'Az Stok' };
    return { color: 'text-green-600 bg-green-100', text: 'Stokta' };
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-gray-100 text-gray-800',
      'bg-teal-100 text-teal-800'
    ];
    const index = categories.findIndex(cat => cat.name === category);
    return colors[index % colors.length] || colors[9];
  };

  const getInventoryValue = () => {
    return products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock < 10).length;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setStockFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Excel Import/Export functions
  const exportToExcel = () => {
    try {
      // Determine which products to export
      const productsToExport = selectedCategory 
        ? products.filter(product => product.category === selectedCategory)
        : products;

      // Prepare data for export
      const exportData = productsToExport.map(product => ({
        'Ürün Adı': product.name,
        'Açıklama': product.description,
        'Kategori': product.category,
        'Fiyat': product.price,
        'Stok': product.stock,
        'SKU': product.sku,
        'Eklenme Tarihi': new Date(product.createdAt).toLocaleDateString('tr-TR'),
        'Güncelleme Tarihi': new Date(product.updatedAt).toLocaleDateString('tr-TR')
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Ürün Adı
        { wch: 30 }, // Açıklama
        { wch: 15 }, // Kategori
        { wch: 12 }, // Fiyat
        { wch: 10 }, // Stok
        { wch: 15 }, // SKU
        { wch: 15 }, // Eklenme Tarihi
        { wch: 15 }  // Güncelleme Tarihi
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      const sheetName = selectedCategory ? `${selectedCategory}_Ürünleri` : 'Tüm_Ürünler';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = selectedCategory 
        ? `${selectedCategory}_ürünleri_${timestamp}.xlsx`
        : `tüm_ürünler_${timestamp}.xlsx`;

      // Save file with UTF-8 encoding
      XLSX.writeFile(workbook, filename, { bookType: 'xlsx', type: 'binary' });
      
      alert(`Excel dosyası başarıyla indirildi: ${filename}`);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel dosyası oluşturulurken hata oluştu');
    }
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Lütfen geçerli bir Excel dosyası (.xlsx veya .xls) seçin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', codepage: 65001 }); // UTF-8 encoding
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          alert('Excel dosyası boş veya geçersiz format');
          return;
        }

        // Get headers (first row)
        const headers = jsonData[0] as string[];
        
        // Validate required columns
        const requiredColumns = ['Ürün Adı', 'Kategori', 'Fiyat'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          alert(`Eksik sütunlar: ${missingColumns.join(', ')}\n\nGerekli sütunlar: ${requiredColumns.join(', ')}`);
          return;
        }

        // Process data rows
        const productsToImport: Partial<Product>[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          try {
            const productData: Partial<Product> = {
              name: row[headers.indexOf('Ürün Adı')]?.toString().trim(),
              description: row[headers.indexOf('Açıklama')]?.toString().trim() || '',
              category: row[headers.indexOf('Kategori')]?.toString().trim(),
              price: parseFloat(row[headers.indexOf('Fiyat')]) || 0,
              stock: parseInt(row[headers.indexOf('Stok')]) || 0,
              sku: row[headers.indexOf('SKU')]?.toString().trim() || '',
            };

                         // Validate required fields
             if (!productData.name || !productData.category || !productData.price || productData.price <= 0) {
               errorCount++;
               continue;
             }

            // Generate SKU if not provided
            if (!productData.sku) {
              productData.sku = generateSKU(productData.category!);
            }

            productsToImport.push(productData);
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Row ${i + 1} error:`, error);
          }
        }

        if (successCount === 0) {
          alert('Hiçbir ürün başarıyla işlenemedi. Lütfen Excel dosyasını kontrol edin.');
          return;
        }

        // Confirm import
        const confirmMessage = selectedCategory 
          ? `${selectedCategory} kategorisine ${successCount} ürün eklemek istediğinizden emin misiniz?`
          : `${successCount} ürün eklemek istediğinizden emin misiniz?`;
        
        if (errorCount > 0) {
          alert(`${errorCount} satır hatalı veri içeriyor ve atlandı.`);
        }

        if (window.confirm(confirmMessage)) {
          // Import products
          productsToImport.forEach(productData => {
            try {
              productStorage.create(productData as Product);
            } catch (error) {
              console.error('Error importing product:', error);
            }
          });

          // Reload data
          loadData();
          alert(`${successCount} ürün başarıyla eklendi!`);
        }

      } catch (error) {
        console.error('Excel import error:', error);
        alert('Excel dosyası okunurken hata oluştu. Lütfen dosya formatını kontrol edin.');
      }
    };

    reader.readAsArrayBuffer(file);
    
    // Clear input
    e.target.value = '';
  };

  const downloadTemplate = () => {
    try {
      // Create template data
      const templateData = [
        {
          'Ürün Adı': 'Örnek Ürün',
          'Açıklama': 'Ürün açıklaması buraya yazılır',
          'Kategori': 'Örnek Kategori',
          'Fiyat': 100.00,
          'Stok': 50,
          'SKU': 'ORN-123456',
          'Eklenme Tarihi': new Date().toLocaleDateString('tr-TR'),
          'Güncelleme Tarihi': new Date().toLocaleDateString('tr-TR')
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Ürün Adı
        { wch: 30 }, // Açıklama
        { wch: 15 }, // Kategori
        { wch: 12 }, // Fiyat
        { wch: 10 }, // Stok
        { wch: 15 }, // SKU
        { wch: 15 }, // Eklenme Tarihi
        { wch: 15 }  // Güncelleme Tarihi
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Şablon');

      // Save file with UTF-8 encoding
      XLSX.writeFile(workbook, 'ürün_import_şablonu.xlsx', { bookType: 'xlsx', type: 'binary' });
      
      alert('Excel şablonu başarıyla indirildi!');
    } catch (error) {
      console.error('Template download error:', error);
      alert('Şablon oluşturulurken hata oluştu');
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
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-1">Envanter ve ürünlerinizi yönetin</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowVendureModal(true);
              handleSearchVendure(); // Load initial products
            }}
            className="btn-secondary flex items-center bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          >
            <Download className="h-5 w-5 mr-2" />
            Vendure'dan Çek
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn-secondary flex items-center"
          >
            <FolderPlus className="h-5 w-5 mr-2" />
            Kategori Ekle
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kategoriler</p>
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Folder className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Envanter Değeri</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getInventoryValue())}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Az Stok</p>
              <p className="text-2xl font-bold text-yellow-600">{getLowStockProducts()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('categories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'categories'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Folder className="h-4 w-4 inline mr-2" />
            Kategoriler
          </button>
          <button
            onClick={() => setCurrentView('products')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'products'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Ürünler
          </button>
        </div>

        {currentView === 'products' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Categories View */}
      {currentView === 'categories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="dashboard-card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setCurrentView('products');
                }}
              >
                <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Folder className="h-16 w-16" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryEdit(category);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FolderEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryDelete(category.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {category.description || 'Açıklama yok'}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {category.productCount} ürün
                  </span>
                  <span className="text-gray-400">
                    {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kategori yok</h3>
              <p className="text-gray-500 mb-4">İlk kategorinizi oluşturarak başlayın</p>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="btn-primary"
              >
                <FolderPlus className="h-5 w-5 mr-2" />
                Kategori Ekle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products View */}
      {currentView === 'products' && (
        <div className="space-y-6">
          {/* Excel Import/Export Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Excel İşlemleri
              </h3>
              <div className="text-sm text-gray-500">
                {selectedCategory ? `${selectedCategory} kategorisi için` : 'Tüm ürünler için'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Export Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={filteredAndSortedProducts.length === 0}
              >
                <Download className="h-5 w-5 mr-2" />
                Excel'e Aktar
              </button>

              {/* Import Button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={importFromExcel}
                  className="hidden"
                  id="excel-import"
                />
                <label
                  htmlFor="excel-import"
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <UploadIcon className="h-5 w-5 mr-2" />
                  Excel'den İçe Aktar
                </label>
              </div>

              {/* Template Download */}
              <button
                onClick={downloadTemplate}
                className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Şablon İndir
              </button>
            </div>

            
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-3 py-2 rounded-lg border ${
                    showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreler
                </button>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name} ({category.productCount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat Aralığı</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="input-field flex-1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="input-field flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Durumu</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Tümü</option>
                    <option value="in_stock">Stokta</option>
                    <option value="low_stock">Az Stok</option>
                    <option value="out_of_stock">Stokta Yok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field flex-1"
                    >
                      <option value="createdAt">Eklenme Tarihi</option>
                      <option value="name">İsim</option>
                      <option value="price">Fiyat</option>
                      <option value="stock">Stok</option>
                      <option value="category">Kategori</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {filteredAndSortedProducts.length} / {products.length} ürün
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <div key={product.id} className="dashboard-card">
                    {/* Product Image */}
                    {product.image && (
                      <div className="relative mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-mono text-gray-900">{product.sku}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fiyat:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(product.price)}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stok:</span>
                        <span className="font-medium text-gray-900">{product.stock} adet</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.stock} adet
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory || priceRange.min || priceRange.max || stockFilter ? 'Ürün bulunamadı' : 'Henüz ürün yok'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory || priceRange.min || priceRange.max || stockFilter
                  ? 'Arama terimlerinizi veya filtrelerinizi ayarlamayı deneyin'
                  : 'İlk ürününüzü ekleyerek başlayın'
                }
              </p>
              {!searchTerm && !selectedCategory && !priceRange.min && !priceRange.max && !stockFilter && (
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ürün Ekle
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ürün Resmi
                  </label>
                  {formData.image ? (
                    <div className="relative">
                      <img
                        src={formData.image}
                        alt="Product preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage()}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Ürün resmi yükle</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="btn-secondary cursor-pointer"
                      >
                        Dosya Seç
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Ürün adını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Ürün açıklaması"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fiyat *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stok Miktarı
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="input-field"
                      placeholder="Otomatik oluşturulur"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingProduct ? 'Ürünü Güncelle' : 'Ürün Oluştur'}
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

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                {/* Category Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori Resmi
                  </label>
                  {categoryFormData.image ? (
                    <div className="relative">
                      <img
                        src={categoryFormData.image}
                        alt="Category preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(true)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Kategori resmi yükle</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                        id="category-image-upload"
                      />
                      <label
                        htmlFor="category-image-upload"
                        className="btn-secondary cursor-pointer"
                      >
                        Dosya Seç
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="input-field"
                    placeholder="Kategori adını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Kategori açıklaması"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingCategory ? 'Kategoriyi Güncelle' : 'Kategori Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
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
      {/* Vendure Import Modal */}
      {showVendureModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowVendureModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Download className="h-6 w-6 mr-2 text-indigo-600" />
                    Vendure Mağazasından Ürün Çek
                  </h3>
                  <button onClick={() => setShowVendureModal(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Vendure ürünlerinde ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={vendureSearchTerm}
                    onChange={(e) => setVendureSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchVendure()}
                  />
                  <button 
                    onClick={handleSearchVendure}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Ara
                  </button>
                </div>

                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {vendureLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-gray-500">Ürünler listeleniyor...</p>
                    </div>
                  ) : vendureProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {vendureProducts.map((vProduct) => {
                        const isImported = products.some(p => p.vendureId === vProduct.productId);
                        return (
                          <div key={vProduct.productId} className="flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {vProduct.productAsset ? (
                                <img src={vProduct.productAsset.preview} alt={vProduct.productName} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-8 w-8 m-4 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4 flex-grow">
                              <h4 className="font-semibold text-gray-900">{vProduct.productName}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{vProduct.description || 'Açıklama yok'}</p>
                              <div className="flex items-center mt-1">
                                <span className="text-indigo-600 font-bold">
                                  {formatCurrency(
                                    vProduct.priceWithTax?.value ? vProduct.priceWithTax.value / 100 : 
                                    vProduct.priceWithTax?.min ? vProduct.priceWithTax.min / 100 : 0
                                  )}
                                </span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-xs text-gray-500">{vProduct.slug}</span>
                              </div>
                            </div>
                            <button
                              disabled={isImported || importingId === vProduct.productId}
                              onClick={() => handleImportVendureProduct(vProduct)}
                              className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all flex items-center ${
                                isImported 
                                  ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {importingId === vProduct.productId ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              ) : isImported ? (
                                <TrendingUp className="h-4 w-4 mr-2" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              {isImported ? 'Eklendi' : 'İçeri Aktar'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Ürün bulunamadı veya arama yapmadınız.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowVendureModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
