import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Package, Users, 
  FolderOpen, Calendar, MapPin, Eye, ArrowRight, AlertTriangle, 
  CheckCircle, Activity, Target, Zap, BarChart3,
  Plus, RefreshCw, Award, Download, FileText
} from 'lucide-react';
import { Project, Customer, Transaction, Product } from '../types';
import { projectStorage, transactionStorage, customerStorage, productStorage, subcontractorPaymentStorage } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import ProjectStatusChart from '../components/charts/ProjectStatusChart';
import MonthlyPerformanceChart from '../components/charts/MonthlyPerformanceChart';
import { generatePDFReport, generateExcelReport, prepareChartData } from '../utils/reports';

interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthProfit: number;
  averageProjectValue: number;
  // Yeni metrikler
  overdueProjects: number;
  lowStockProducts: number;
  recentCustomers: number;
  profitMargin: number;
  monthlyGrowth: number;
  topCustomer: string;
  urgentTasks: number;
  // Alt yüklenici metrikleri
  pendingSubcontractorPayments: number;
  totalSubcontractorPayments: number;
  overdueSubcontractorPayments: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalCustomers: 0,
    totalProducts: 0,
    inventoryValue: 0,
    thisMonthIncome: 0,
    thisMonthExpenses: 0,
    thisMonthProfit: 0,
    averageProjectValue: 0,
    overdueProjects: 0,
    lowStockProducts: 0,
    recentCustomers: 0,
    profitMargin: 0,
    monthlyGrowth: 0,
    topCustomer: '',
    urgentTasks: 0,
    pendingSubcontractorPayments: 0,
    totalSubcontractorPayments: 0,
    overdueSubcontractorPayments: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = () => {
    try {
      // Get all data
      const projects = projectStorage.getAll();
      const transactionsData = transactionStorage.getAll();
      const customersData = customerStorage.getAll();
      const productsData = productStorage.getAll();
      const subcontractorPayments = subcontractorPaymentStorage.getAll();

      setCustomers(customersData);
      setTransactions(transactionsData);
      setProducts(productsData);

      // Calculate financial metrics
      const totalIncome = transactionsData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactionsData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalIncome - totalExpenses;

      // Calculate project metrics
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;

      // Calculate customer and product metrics
      const totalCustomers = customersData.length;
      const totalProducts = productsData.length;

      // Calculate inventory value
      const inventoryValue = productsData.reduce((sum, p) => sum + (p.price * p.stock), 0);

      // Calculate additional metrics
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const averageProjectValue = totalProjects > 0 ? totalIncome / totalProjects : 0;

      // Calculate this month's metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthTransactions = transactionsData.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });

      const thisMonthIncome = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const thisMonthExpenses = thisMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const thisMonthProfit = thisMonthIncome - thisMonthExpenses;

      // Yeni metrikler hesaplama
      const currentDate = new Date();
      const overdueProjects = projects.filter(p => 
        p.status === 'active' && p.endDate && new Date(p.endDate) < currentDate
      ).length;

      const lowStockProducts = products.filter(p => p.stock < 10).length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCustomers = customersData.filter(c => 
        new Date(c.createdAt) > thirtyDaysAgo
      ).length;

      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      // En çok projesi olan müşteri
      const customerProjectCounts = projects.reduce((acc, project) => {
        acc[project.customerId] = (acc[project.customerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCustomerId = Object.keys(customerProjectCounts).reduce((a, b) => 
        customerProjectCounts[a] > customerProjectCounts[b] ? a : b, ''
      );
      const topCustomer = customersData.find(c => c.id === topCustomerId)?.name || '';

      // Alt yüklenici ödemeleri metrikleri
      const pendingSubcontractorPayments = subcontractorPayments.filter(p => p.status === 'pending').length;
      const totalSubcontractorPayments = subcontractorPayments.length;
      
      // Süresi geçmiş alt yüklenici ödemeleri (basit hesaplama)
      const overdueSubcontractorPayments = subcontractorPayments.filter(p => {
        if (p.status === 'pending') {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate < currentDate;
        }
        return false;
      }).length;

      // Acil görevler (süresi geçmiş projeler + düşük stok + bekleyen ödemeler)
      const urgentTasks = overdueProjects + lowStockProducts + pendingSubcontractorPayments;

      // Aylık büyüme hesaplama (basit)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthTransactions = transactionsData.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonth.getMonth() && 
               transactionDate.getFullYear() === lastMonth.getFullYear();
      });
      const lastMonthIncome = lastMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthlyGrowth = lastMonthIncome > 0 ? 
        ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;

      setMetrics({
        totalIncome,
        totalExpenses,
        netProfit,
        totalProjects,
        activeProjects,
        completedProjects,
        totalCustomers,
        totalProducts,
        inventoryValue,
        thisMonthIncome,
        thisMonthExpenses,
        thisMonthProfit,
        averageProjectValue,
        overdueProjects,
        lowStockProducts,
        recentCustomers,
        profitMargin,
        monthlyGrowth,
        topCustomer,
        urgentTasks,
        pendingSubcontractorPayments,
        totalSubcontractorPayments,
        overdueSubcontractorPayments,
      });

      // Get recent projects (last 5)
      const recent = projects
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentProjects(recent);

      // Prepare chart data
      const chartsData = prepareChartData(transactionsData, projects);
      setChartData(chartsData);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Bilinmeyen Müşteri';
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects?highlight=${projectId}`);
  };

  const handleGeneratePDFReport = (type: 'monthly' | 'quarterly') => {
    try {
      console.log('PDF rapor oluşturuluyor...', { type, metrics });
      generatePDFReport(type, {
        projects: recentProjects,
        transactions,
        customers,
        products,
        metrics,
      });
      console.log('PDF rapor başarıyla oluşturuldu');
    } catch (error) {
      console.error('PDF rapor oluşturma hatası:', error);
      alert('PDF rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleGenerateExcelReport = () => {
    generateExcelReport({
      projects: recentProjects,
      transactions,
      customers,
      products,
      metrics,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">İşletmenizin genel durumu ve önemli metrikler</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-sm">Genel Bakış</span>
          </div>
        </div>
        
        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{showCharts ? 'Grafikleri Gizle' : 'Grafikleri Göster'}</span>
              <span className="sm:hidden">{showCharts ? 'Gizle' : 'Göster'}</span>
            </button>
            <button 
              onClick={calculateMetrics}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Yenile</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleGeneratePDFReport('monthly')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">PDF Rapor</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button 
              onClick={handleGenerateExcelReport}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Acil Durumlar ve Önemli Bilgiler */}
      {metrics.urgentTasks > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Acil Dikkat Gereken Konular</h3>
              <div className="text-sm text-orange-700 space-y-1 mt-2">
                {metrics.overdueProjects > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                    <span>• {metrics.overdueProjects} proje süresi geçmiş</span>
                    <button 
                      onClick={() => navigate('/projects')}
                      className="text-orange-800 hover:text-orange-900 underline text-xs self-start sm:self-auto"
                    >
                      Görüntüle
                    </button>
                  </div>
                )}
                {metrics.lowStockProducts > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                    <span>• {metrics.lowStockProducts} ürün stokta az</span>
                    <button 
                      onClick={() => navigate('/products')}
                      className="text-orange-800 hover:text-orange-900 underline text-xs self-start sm:self-auto"
                    >
                      Görüntüle
                    </button>
                  </div>
                )}
                {metrics.pendingSubcontractorPayments > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                    <span>• {metrics.pendingSubcontractorPayments} alt yüklenici ödemesi bekliyor</span>
                    <button 
                      onClick={() => navigate('/subcontractor-payments')}
                      className="text-orange-800 hover:text-orange-900 underline text-xs self-start sm:self-auto"
                    >
                      Görüntüle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ana Finansal Metrikler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Kar - Ana Metrik */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Net Kar</h3>
              <p className="text-sm text-gray-600">Toplam gelir - Toplam gider</p>
            </div>
            <div className="p-3 bg-white rounded-full shadow-sm">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className={`text-3xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.netProfit)}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">Bu ay: <span className={`font-medium ${metrics.thisMonthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.thisMonthProfit >= 0 ? '+' : ''}{formatCurrency(metrics.thisMonthProfit)}
              </span></span>
              <span className="text-gray-600">Kar marjı: <span className="font-medium text-blue-600">
                {metrics.profitMargin.toFixed(1)}%
              </span></span>
            </div>
          </div>
        </div>

        {/* Aylık Büyüme */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aylık Büyüme</h3>
              <p className="text-sm text-gray-600">Gelir artış oranı</p>
            </div>
            <div className="p-3 bg-white rounded-full shadow-sm">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className={`text-3xl font-bold ${metrics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.monthlyGrowth >= 0 ? '+' : ''}{metrics.monthlyGrowth.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              {metrics.monthlyGrowth >= 0 ? 'Geçen aya göre artış' : 'Geçen aya göre azalış'}
            </p>
          </div>
        </div>
      </div>

      {/* İşletme Metrikleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Projeler */}
        <div 
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
          onClick={() => navigate('/projects')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Projeler</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{metrics.totalProjects}</p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {metrics.activeProjects} aktif
              </span>
              <span className="flex items-center text-blue-600">
                <Award className="h-3 w-3 mr-1" />
                {metrics.completedProjects} tamamlanan
              </span>
            </div>
            {metrics.overdueProjects > 0 && (
              <span className="flex items-center text-red-600 text-sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {metrics.overdueProjects} süresi geçmiş
              </span>
            )}
          </div>
        </div>

        {/* Müşteriler */}
        <div 
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:border-green-300"
          onClick={() => navigate('/customers')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Müşteriler</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</p>
            <div className="text-sm text-gray-600">
              <span className="text-green-600 font-medium">+{metrics.recentCustomers}</span> son 30 gün
            </div>
            {metrics.topCustomer && (
              <div className="text-sm text-gray-500">
                En aktif: <span className="font-medium">{metrics.topCustomer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ürünler */}
        <div 
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:border-orange-300"
          onClick={() => navigate('/products')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Ürünler</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
            <div className="text-sm text-gray-600">
              Stok değeri: <span className="font-medium text-orange-600">{formatCurrency(metrics.inventoryValue)}</span>
            </div>
            {metrics.lowStockProducts > 0 && (
              <span className="flex items-center text-red-600 text-sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {metrics.lowStockProducts} düşük stok
              </span>
            )}
          </div>
        </div>

        {/* Alt Yüklenici Ödemeleri */}
        <div 
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:border-purple-300"
          onClick={() => navigate('/subcontractor-payments')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Alt Yüklenici Ödemeleri</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{metrics.totalSubcontractorPayments}</p>
            <div className="text-sm text-gray-600">
              <span className="text-orange-600 font-medium">{metrics.pendingSubcontractorPayments}</span> bekleyen
            </div>
            {metrics.overdueSubcontractorPayments > 0 && (
              <span className="flex items-center text-red-600 text-sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {metrics.overdueSubcontractorPayments} süresi geçmiş
              </span>
            )}
          </div>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Zap className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-500">Hızlı Aksiyonlar</span>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/projects')}
              className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Yeni Proje
            </button>
            <button 
              onClick={() => navigate('/customers')}
              className="w-full text-left p-2 text-sm bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Yeni Müşteri
            </button>
            <button 
              onClick={() => navigate('/transactions')}
              className="w-full text-left p-2 text-sm bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Yeni İşlem
            </button>
          </div>
        </div>
      </div>

      {/* Finansal Detaylar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gelir ve Gider Detayları */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Finansal Detaylar
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Toplam Gelir</p>
                  <p className="text-xs text-green-600">Bu ay: {formatCurrency(metrics.thisMonthIncome)}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.totalIncome)}</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Toplam Gider</p>
                  <p className="text-xs text-red-600">Bu ay: {formatCurrency(metrics.thisMonthExpenses)}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Performans Göstergeleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Performans
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kar Marjı</span>
              <span className="text-lg font-bold text-blue-600">{metrics.profitMargin.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aylık Büyüme</span>
              <span className={`text-lg font-bold ${metrics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.monthlyGrowth >= 0 ? '+' : ''}{metrics.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ortalama Proje Değeri</span>
              <span className="text-lg font-bold text-purple-600">{formatCurrency(metrics.averageProjectValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Proje Başarı Oranı</span>
              <span className="text-lg font-bold text-green-600">
                {metrics.totalProjects > 0 ? ((metrics.completedProjects / metrics.totalProjects) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Son Projeler */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Son Projeler
          </h3>
          <button 
            onClick={() => navigate('/projects')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Tümünü Gör <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <div 
                key={project.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:border-blue-300"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{project.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                      {project.status === 'active' ? 'Aktif' : 
                       project.status === 'completed' ? 'Tamamlandı' : 
                       project.status === 'cancelled' ? 'İptal Edildi' : project.status}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-3 w-3 mr-2 text-blue-500" />
                    <span className="truncate">{getCustomerName(project.customerId)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3 w-3 mr-2 text-green-500" />
                    <span className="truncate">{project.city}, {project.district}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-3 w-3 mr-2 text-purple-500" />
                    <span>{new Date(project.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Bütçe</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Proje bulunamadı. Başlamak için ilk projenizi oluşturun!</p>
            <button 
              onClick={() => navigate('/projects')}
              className="mt-4 btn-primary"
            >
              Proje Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Grafikler Bölümü */}
      {showCharts && chartData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Grafikler ve Analizler</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span>Veri Görselleştirme</span>
            </div>
          </div>

          {/* Gelir/Gider Trend Grafiği */}
          <IncomeExpenseChart data={chartData.incomeExpense} />

          {/* Proje Durumu ve Aylık Performans */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProjectStatusChart data={chartData.projectStatus} />
            <MonthlyPerformanceChart data={chartData.monthlyPerformance} />
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
