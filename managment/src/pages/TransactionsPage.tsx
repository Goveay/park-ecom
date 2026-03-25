import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, Filter, User, Upload, X, Download, Eye, ChevronUp, ChevronDown, FileSpreadsheet, Settings } from 'lucide-react';
import { Transaction, Project, Customer, TransactionCategory } from '../types';
import { transactionStorage, projectStorage, customerStorage, transactionCategoryStorage } from '../utils/storage';
import * as XLSX from 'xlsx';

interface TransactionFormData {
  projectId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card';
  receipt?: string;
  receiptFile?: string;
  receiptFileName?: string;
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState<TransactionFormData>({
    projectId: '',
    type: 'income',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    receipt: '',
    receiptFile: '',
    receiptFileName: '',
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    type: 'income' as 'income' | 'expense',
    description: '',
    color: '#3B82F6',
    icon: '📋',
  });
  const [loading, setLoading] = useState(true);

  // Get categories by type
  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type && cat.isActive);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const transactionsData = transactionStorage.getAll();
      const projectsData = projectStorage.getAll();
      const customersData = customerStorage.getAll();
      const categoriesData = transactionCategoryStorage.getAll();
      setTransactions(transactionsData);
      setProjects(projectsData);
      setCustomers(customersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sıralama fonksiyonları
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const sortTransactions = (transactions: Transaction[]) => {
    if (!sortField) return transactions;

    return [...transactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'paymentMethod':
          aValue = a.paymentMethod;
          bValue = b.paymentMethod;
          break;
        case 'project':
          const projectA = projects.find(p => p.id === a.projectId);
          const projectB = projects.find(p => p.id === b.projectId);
          aValue = projectA ? projectA.name : '';
          bValue = projectB ? projectB.name : '';
          break;
        case 'customer':
          const customerA = projects.find(p => p.id === a.projectId)?.customerId;
          const customerB = projects.find(p => p.id === b.projectId)?.customerId;
          const customerNameA = customers.find(c => c.id === customerA)?.name || '';
          const customerNameB = customers.find(c => c.id === customerB)?.name || '';
          aValue = customerNameA;
          bValue = customerNameB;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredTransactions = sortTransactions(transactions.filter(transaction => {
    const project = projects.find(p => p.id === transaction.projectId);
    const projectName = project ? project.name : '';
    const customer = project ? customers.find(c => c.id === project.customerId) : null;
    const customerName = customer ? customer.name : '';

    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === '' || transaction.type === typeFilter;
    const matchesProject = projectFilter === '' || transaction.projectId === projectFilter;
    const matchesPaymentMethod = paymentMethodFilter === '' || transaction.paymentMethod === paymentMethodFilter;

    const transactionDate = new Date(transaction.date);
    const matchesDateRange = 
      (dateRange.start === '' || transactionDate >= new Date(dateRange.start)) &&
      (dateRange.end === '' || transactionDate <= new Date(dateRange.end));

    return matchesSearch && matchesType && matchesProject && matchesPaymentMethod && matchesDateRange;
  }));

  // Excel Export fonksiyonları
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Nakit';
      case 'check': return 'Çek';
      case 'bank_transfer': return 'Banka Transferi';
      case 'credit_card': return 'Kredi Kartı';
      default: return method;
    }
  };

  const getTypeText = (type: string) => {
    return type === 'income' ? 'Gelir' : 'Gider';
  };

  const prepareTransactionData = (transactionsToExport: Transaction[]) => {
    return transactionsToExport.map(transaction => {
      const project = projects.find(p => p.id === transaction.projectId);
      const customer = project ? customers.find(c => c.id === project.customerId) : null;
      
      return {
        'Tarih': new Date(transaction.date).toLocaleDateString('tr-TR'),
        'Proje': project ? project.name : 'Bilinmeyen Proje',
        'Müşteri': customer ? customer.name : 'Bilinmeyen Müşteri',
        'Tür': getTypeText(transaction.type),
        'Kategori': transaction.category,
        'Açıklama': transaction.description,
        'Tutar': transaction.amount,
        'Tutar (TL)': formatCurrency(transaction.amount),
        'Ödeme Yöntemi': getPaymentMethodText(transaction.paymentMethod),
        'Oluşturulma Tarihi': new Date(transaction.createdAt).toLocaleDateString('tr-TR'),
      };
    });
  };

  const exportToExcel = (data: any[], fileName: string) => {
    try {
      // Verileri çalışma sayfasına dönüştür
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Sütun genişliklerini ayarla
      const columnWidths = [
        { wch: 12 }, // Tarih
        { wch: 20 }, // Proje
        { wch: 20 }, // Müşteri
        { wch: 8 },  // Tür
        { wch: 15 }, // Kategori
        { wch: 30 }, // Açıklama
        { wch: 12 }, // Tutar
        { wch: 15 }, // Tutar (TL)
        { wch: 15 }, // Ödeme Yöntemi
        { wch: 15 }, // Oluşturulma Tarihi
      ];
      worksheet['!cols'] = columnWidths;
      
      // Yeni bir çalışma kitabı oluştur
      const workbook = XLSX.utils.book_new();
      
      // Çalışma sayfasını çalışma kitabına ekle
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      
      // Excel dosyasını oluştur ve indir (UTF-8 encoding ile)
      XLSX.writeFile(workbook, `${fileName}.xlsx`, { bookType: 'xlsx', type: 'binary' });
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu.');
    }
  };

  const exportAllTransactions = () => {
    const data = prepareTransactionData(transactions);
    const fileName = `Tum_Islemler_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(data, fileName);
  };

  const exportFilteredTransactions = () => {
    const data = prepareTransactionData(filteredTransactions);
    const fileName = `Filtrelenmis_Islemler_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(data, fileName);
  };

  const exportProjectTransactions = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const data = prepareTransactionData(projectTransactions);
    const projectName = project ? project.name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '') : 'Bilinmeyen_Proje';
    const fileName = `${projectName}_Islemleri_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(data, fileName);
  };

  const exportCustomerTransactions = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    const customerProjects = projects.filter(p => p.customerId === customerId);
    const customerTransactions = transactions.filter(t => 
      customerProjects.some(p => p.id === t.projectId)
    );
    const data = prepareTransactionData(customerTransactions);
    const customerName = customer ? customer.name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '') : 'Bilinmeyen_Musteri';
    const fileName = `${customerName}_Islemleri_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(data, fileName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.description || formData.amount <= 0) {
      alert('Lütfen tüm gerekli alanları doldurun ve tutarın 0\'dan büyük olduğundan emin olun');
      return;
    }

    try {
      // If there's a receipt file, add it to the project's receipts
      if (formData.receiptFile && formData.receiptFileName) {
        const project = projects.find(p => p.id === formData.projectId);
        if (project) {
          const updatedProject = {
            ...project,
            receipts: [...project.receipts, formData.receiptFile],
            receiptFileNames: [...(project.receiptFileNames || []), formData.receiptFileName]
          };
          projectStorage.update(project.id, updatedProject);
        }
      }

      if (editingTransaction) {
        transactionStorage.update(editingTransaction.id, formData);
      } else {
        transactionStorage.create(formData);
        // Increment category usage count
        const category = categories.find(cat => cat.name === formData.category);
        if (category) {
          transactionCategoryStorage.incrementUsage(category.id);
        }
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('İşlem kaydedilirken hata oluştu');
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryFormData.name.trim()) {
      alert('Kategori adı gereklidir');
      return;
    }

    try {
      if (editingCategory) {
        transactionCategoryStorage.update(editingCategory.id, categoryFormData);
      } else {
        transactionCategoryStorage.create({
          ...categoryFormData,
          isDefault: false,
          isActive: true,
        });
      }
      
      loadData();
      handleCloseCategoryModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      projectId: transaction.projectId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      receipt: transaction.receipt || '',
      receiptFile: (transaction as any).receiptFile || '',
      receiptFileName: (transaction as any).receiptFileName || '',
    });
    setShowModal(true);
  };

  const handleDelete = (transactionId: string) => {
    if (window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      try {
        transactionStorage.delete(transactionId);
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('İşlem silinirken hata oluştu');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      projectId: '',
      type: 'income',
      amount: 0,
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      receipt: '',
      receiptFile: '',
      receiptFileName: '',
    });
  };

  const handleEditCategory = (category: TransactionCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
      color: category.color,
      icon: category.icon || '📋',
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        transactionCategoryStorage.delete(categoryId);
        loadData();
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
      type: 'income',
      description: '',
      color: '#3B82F6',
      icon: '📋',
    });
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Bilinmeyen Proje';
  };

  const getCustomerName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Bilinmeyen Müşteri';
    const customer = customers.find(c => c.id === project.customerId);
    return customer ? customer.name : 'Bilinmeyen Müşteri';
  };



  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size should be less than 10MB');
      return;
    }

    if (file.type !== 'application/pdf') {
              alert('Lütfen bir PDF dosyası seçin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        receiptFile: result,
        receiptFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setFormData(prev => ({
      ...prev,
      receiptFile: '',
      receiptFileName: ''
    }));
  };

  const handleDownloadReceipt = (fileData: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    link.click();
  };

  // Kredi kartı raporu fonksiyonları
  const getPersonalFinanceProject = () => {
    return projects.find(p => p.name === 'Kişisel Finans');
  };

  const getPersonalFinanceTransactions = () => {
    const personalProject = getPersonalFinanceProject();
    if (!personalProject) return [];
    return transactions.filter(t => t.projectId === personalProject.id);
  };

  const getCurrentMonthPersonalFinance = () => {
    const personalTransactions = getPersonalFinanceTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = personalTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditCardExpenses = monthlyTransactions
      .filter(t => t.type === 'expense' && t.category === 'Kredi Kartı Harcaması')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditCardPayments = monthlyTransactions
      .filter(t => t.type === 'income' && t.category === 'Kredi Kartı Ödemesi')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      creditCardExpenses,
      creditCardPayments,
      netBalance: totalIncome - totalExpenses,
      remainingCreditCardDebt: creditCardExpenses - creditCardPayments
    };
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'check':
        return 'bg-blue-100 text-blue-800';
      case 'bank_transfer':
        return 'bg-purple-100 text-purple-800';
      case 'credit_card':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Nakit';
      case 'check':
        return 'Çek';
      case 'bank_transfer':
        return 'Banka Transferi';
      case 'credit_card':
        return 'Kredi Kartı';
      default:
        return method;
    }
  };

  // Financial calculations
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  // Payment method breakdown
  const paymentMethodBreakdown = filteredTransactions.reduce((acc, transaction) => {
    const method = transaction.paymentMethod;
    if (!acc[method]) {
      acc[method] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[method].income += transaction.amount;
    } else {
      acc[method].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setProjectFilter('');
    setPaymentMethodFilter('');
    setDateRange({ start: '', end: '' });
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
          <h1 className="text-3xl font-bold text-gray-900">İşlemler</h1>
                      <p className="text-gray-600 mt-1">Gelir ve giderlerinizi takip edin</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Export Buttons */}
          <div className="relative group">
            <button className="btn-secondary flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Export Excel
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2 space-y-1">
                <button
                  onClick={exportAllTransactions}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  📊 Tüm İşlemleri Export Et
                </button>
                <button
                  onClick={exportFilteredTransactions}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  🔍 Filtrelenmiş İşlemleri Export Et
                </button>
                {projectFilter && (
                  <button
                    onClick={() => exportProjectTransactions(projectFilter)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    📁 Seçili Proje İşlemlerini Export Et
                  </button>
                )}
                {projectFilter && (() => {
                  const project = projects.find(p => p.id === projectFilter);
                  const customerId = project?.customerId;
                  return customerId ? (
                    <button
                      onClick={() => exportCustomerTransactions(customerId)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      👤 Müşteri İşlemlerini Export Et
                    </button>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni İşlem
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Kar</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemi Dağılımı</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(paymentMethodBreakdown).map(([method, amounts]) => (
            <div key={method} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(method)}`}>
                  {getPaymentMethodLabel(method)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gelir:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(amounts.income)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gider:</span>
                  <span className="text-red-600 font-medium">{formatCurrency(amounts.expense)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-1">
                  <span>Net:</span>
                  <span className={amounts.income - amounts.expense >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(amounts.income - amounts.expense)}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
                placeholder="İşlem ara..."
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
              Tümünü Temizle
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Tüm Türler</option>
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proje</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Tüm Projeler</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Tüm Yöntemler</option>
                <option value="cash">Nakit</option>
                <option value="check">Çek</option>
                <option value="bank_transfer">Banka Transferi</option>
                <option value="credit_card">Kredi Kartı</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Aralığı</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="input-field flex-1"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="input-field flex-1"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
                          {filteredTransactions.length} / {transactions.length} işlem
          </div>
          <div className="flex items-center space-x-2">
            {projectFilter && (
              <button
                onClick={() => exportProjectTransactions(projectFilter)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors flex items-center"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Projeyi Dışa Aktar
              </button>
            )}
            {projectFilter && (() => {
              const project = projects.find(p => p.id === projectFilter);
              const customerId = project?.customerId;
              return customerId ? (
                <button
                  onClick={() => exportCustomerTransactions(customerId)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors flex items-center"
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  Müşteriyi Dışa Aktar
                </button>
              ) : null;
            })()}
            <button
              onClick={exportFilteredTransactions}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md transition-colors flex items-center"
            >
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              Filtrelenmiş Verileri Dışa Aktar
            </button>
          </div>
        </div>
      </div>

      {/* Subcontractor Payments Summary */}
      {(() => {
        const subcontractorPayments = transactions.filter(t => t.category === 'Subcontractor Payment');
        const totalSubcontractorPayments = subcontractorPayments.reduce((sum, t) => sum + t.amount, 0);
        
        return subcontractorPayments.length > 0 ? (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Alt Yüklenici Ödemeleri Özeti
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Toplam Alt Yüklenici Ödemeleri</div>
                  <div className="text-2xl font-bold text-red-700">{formatCurrency(totalSubcontractorPayments)}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Ödeme Sayısı</div>
                  <div className="text-2xl font-bold text-blue-700">{subcontractorPayments.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Ortalama Ödeme</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(totalSubcontractorPayments / subcontractorPayments.length)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Son Alt Yüklenici Ödemeleri</h4>
                {subcontractorPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{payment.description}</div>
                      <div className="text-sm text-gray-500">
                        {getProjectName(payment.projectId)} • {new Date(payment.date).toLocaleDateString()}
                      </div>
                      {payment.description && payment.description.length > 50 && (
                        <div className="text-xs text-gray-400 mt-1">{payment.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tarih</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tür</span>
                    {getSortIcon('type')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('project')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Proje</span>
                    {getSortIcon('project')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Kategori</span>
                    {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('paymentMethod')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Ödeme Yöntemi</span>
                    {getSortIcon('paymentMethod')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tutar</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Makbuz</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getProjectName(transaction.projectId)}</div>
                    <div className="text-sm text-gray-500">{getCustomerName(transaction.projectId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(transaction as any).receiptFile ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">📄 {(transaction as any).receiptFileName}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = (transaction as any).receiptFile;
                              link.target = '_blank';
                              link.click();
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title="View PDF"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt((transaction as any).receiptFile, (transaction as any).receiptFileName)}
                            className="text-green-600 hover:text-green-800 text-xs"
                            title="Download PDF"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Makbuz yok</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => exportProjectTransactions(transaction.projectId)}
                        className="text-green-600 hover:text-green-900"
                        title="Export Project Transactions"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kişisel Finans Raporu */}
      {getPersonalFinanceProject() && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Kişisel Finans Raporu - Bu Ay</h3>
          {(() => {
            const finance = getCurrentMonthPersonalFinance();
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Toplam Gelir</p>
                      <p className="text-lg font-semibold text-green-900">{formatCurrency(finance.totalIncome)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-600">Toplam Gider</p>
                      <p className="text-lg font-semibold text-red-900">{formatCurrency(finance.totalExpenses)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Kredi Kartı Harcaması</p>
                      <p className="text-lg font-semibold text-blue-900">{formatCurrency(finance.creditCardExpenses)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">Kredi Kartı Ödemesi</p>
                      <p className="text-lg font-semibold text-purple-900">{formatCurrency(finance.creditCardPayments)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {(() => {
            const finance = getCurrentMonthPersonalFinance();
            return (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Net Bakiye</p>
                  <p className={`text-lg font-semibold ${finance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(finance.netBalance)}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-orange-600">Kalan Kredi Kartı Borcu</p>
                  <p className="text-lg font-semibold text-orange-900">
                    {formatCurrency(finance.remainingCreditCardDebt)}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || typeFilter || projectFilter || paymentMethodFilter || dateRange.start || dateRange.end ? 'İşlem bulunamadı' : 'Henüz işlem yok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || typeFilter || projectFilter || paymentMethodFilter || dateRange.start || dateRange.end
              ? 'Arama terimlerinizi veya filtrelerinizi ayarlamayı deneyin'
              : 'İlk işleminizi ekleyerek başlayın'
            }
          </p>
          {!searchTerm && !typeFilter && !projectFilter && !paymentMethodFilter && !dateRange.start && !dateRange.end && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              İşlem Ekle
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tür *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                      className="input-field"
                      required
                    >
                      <option value="income">Gelir</option>
                      <option value="expense">Gider</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ödeme Yöntemi *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      <option value="cash">Nakit</option>
                      <option value="check">Çek</option>
                      <option value="bank_transfer">Banka Transferi</option>
                      <option value="credit_card">Kredi Kartı</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Proje *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Proje seçin</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {getCustomerName(project.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="İşlem açıklaması girin"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tutar *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tarih *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field flex-1"
                      required
                    >
                      <option value="">Kategori seçin</option>
                      {getCategoriesByType(formData.type).map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Kategori Ekle/Düzenle"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Receipt PDF Upload */}
                <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                Makbuz PDF (İsteğe Bağlı)
              </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.receiptFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-sm text-gray-600">📄 {formData.receiptFileName}</span>
                          <button
                            type="button"
                            onClick={removeReceipt}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex space-x-2 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = formData.receiptFile!;
                              link.target = '_blank';
                              link.click();
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Görüntüle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(formData.receiptFile!, formData.receiptFileName!)}
                            className="text-sm text-green-600 hover:text-green-800 flex items-center"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            İndir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Makbuz PDF yükleyin (maksimum 10MB)</p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleReceiptUpload}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label
                          htmlFor="receipt-upload"
                          className="btn-secondary cursor-pointer"
                        >
                          PDF Seç
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingTransaction ? 'İşlemi Güncelle' : 'İşlem Oluştur'}
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

      {/* Kategori Yönetimi Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className="input-field"
                      placeholder="Kategori adı girin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tür *
                    </label>
                    <select
                      value={categoryFormData.type}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, type: e.target.value as 'income' | 'expense' })}
                      className="input-field"
                      required
                    >
                      <option value="income">Gelir</option>
                      <option value="expense">Gider</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="input-field"
                    placeholder="Kategori açıklaması (isteğe bağlı)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Renk
                    </label>
                    <input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      İkon
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.icon}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                      className="input-field"
                      placeholder="📋"
                      maxLength={2}
                    />
                  </div>
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

              {/* Mevcut Kategoriler Listesi */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Kategoriler</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">
                            {category.type === 'income' ? 'Gelir' : 'Gider'} • {category.usageCount} kullanım
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
