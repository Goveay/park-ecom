import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Search, Edit, Trash2, Calendar, DollarSign, User, MapPin, Upload, X, Eye, Download } from 'lucide-react';
import { Project, Customer, Transaction, WorkContract, SubcontractorPayment } from '../types';
import { projectStorage, customerStorage, transactionStorage, workContractStorage, subcontractorPaymentStorage } from '../utils/storage';

interface ProjectFormData {
  name: string;
  description: string;
  customerId: string;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: number;
  city: string;
  district: string;
  neighborhood: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workContracts, setWorkContracts] = useState<WorkContract[]>([]);
  const [subcontractorPayments, setSubcontractorPayments] = useState<SubcontractorPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subcontractors' | 'files'>('overview');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    customerId: '',
    status: 'active',
    startDate: '',
    endDate: '',
    budget: 0,
    city: '',
    district: '',
    neighborhood: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const projectsData = projectStorage.getAll();
      const customersData = customerStorage.getAll();
      const transactionsData = transactionStorage.getAll();
      const workContractsData = workContractStorage.getAll();
      const subcontractorPaymentsData = subcontractorPaymentStorage.getAll();
      
      setProjects(projectsData);
      setCustomers(customersData);
      setTransactions(transactionsData);
      setWorkContracts(workContractsData);
      setSubcontractorPayments(subcontractorPaymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Veri yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const customer = customers.find(c => c.id === project.customerId);
    const customerName = customer ? customer.name : '';
    
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCustomer = customerFilter === 'all' || project.customerId === customerFilter;
    
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.customerId || !formData.startDate) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      if (editingProject) {
        projectStorage.update(editingProject.id, formData);
      } else {
        projectStorage.create(formData);
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Proje kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      customerId: project.customerId,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || '',
      budget: project.budget,
      city: project.city,
      district: project.district,
      neighborhood: project.neighborhood,
    });
    setShowModal(true);
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        projectStorage.delete(projectId);
        loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Proje silinirken hata oluştu');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      customerId: '',
      status: 'active',
      startDate: '',
      endDate: '',
      budget: 0,
      city: '',
      district: '',
      neighborhood: '',
    });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Bilinmeyen Müşteri';
  };

  const getProjectStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getProjectFinancials = (projectId: string) => {
    // Proje transaction'larını al
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    
    // Gelir hesapla (income transaction'ları)
    const income = projectTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Gider hesapla (expense transaction'ları + alt yüklenici ödemeleri)
    const transactionExpenses = projectTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Alt yüklenici ödemelerini hesapla
    const projectWorkContracts = workContracts.filter(contract => contract.projectId === projectId);
    const subcontractorExpenses = projectWorkContracts.reduce((total, contract) => {
      const contractPayments = subcontractorPayments.filter(payment => payment.contractId === contract.id);
      const totalPaid = contractPayments.reduce((sum, payment) => sum + payment.amount, 0);
      return total + totalPaid;
    }, 0);
    
    const totalExpenses = transactionExpenses + subcontractorExpenses;
    
    return {
      income,
      expenses: totalExpenses,
      netProfit: income - totalExpenses,
      transactionExpenses,
      subcontractorExpenses,
    };
  };

  const getProjectWorkContracts = (projectId: string) => {
    return workContracts.filter(contract => contract.projectId === projectId);
  };

  const getSubcontractorName = (subcontractorId: string) => {
    return `Subcontractor ${subcontractorId.slice(0, 8)}`;
  };

  const getContractPayments = (contractId: string) => {
    return subcontractorPayments.filter(payment => payment.contractId === contractId);
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
          <h1 className="text-3xl font-bold text-gray-900">Projeler</h1>
          <p className="text-gray-600 mt-1">İnşaat projelerinizi yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Proje
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Filtreler
          </button>
          <div className="text-sm text-gray-500">
            {filteredProjects.length} / {projects.length} proje
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Tüm Müşteriler</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const financials = getProjectFinancials(project.id);
          return (
            <div key={project.id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDetailModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Detayları Görüntüle"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">{getCustomerName(project.customerId)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{project.city}, {project.district}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Bütçe: {formatCurrency(project.budget)}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <span>Gelir:</span>
                    <span className="text-green-600 font-medium">{formatCurrency(financials.income)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Diğer Giderler:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(financials.transactionExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Alt Yüklenici Ödemeleri:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(financials.subcontractorExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold border-t pt-1 mt-1">
                    <span>Net Kar:</span>
                    <span className={financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(financials.netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Proje bulunamadı' : 'Henüz proje yok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Arama terimlerinizi ayarlamayı deneyin'
              : 'İlk projenizi oluşturarak başlayın'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Proje Oluştur
            </button>
          )}
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingProject ? 'Projeyi Düzenle' : 'Yeni Proje'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Proje Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="Proje adını girin"
                      required
                    />
                  </div>

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
                      <option value="">Bir müşteri seçin</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    placeholder="Proje açıklamasını girin"
                  />
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
                      <option value="active">Aktif</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="cancelled">İptal Edildi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bütçe (TL)
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Şehir
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input-field"
                      placeholder="Şehir girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      İlçe
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="input-field"
                      placeholder="İlçe girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mahalle
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="input-field"
                      placeholder="Mahalle girin"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingProject ? 'Projeyi Güncelle' : 'Proje Oluştur'}
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

      {/* Project Detail Modal */}
      {showProjectDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setShowProjectDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Genel Bakış
                  </button>
                  <button
                    onClick={() => setActiveTab('subcontractors')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'subcontractors'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Alt Yükleniciler
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'files'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dosyalar
                  </button>
                </nav>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Proje Bilgileri</h3>
                      <div className="space-y-4">
                        <div>
                                                      <span className="text-sm font-medium text-gray-700">Açıklama:</span>
                          <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Durum:</span>
                            <div className="mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(selectedProject.status)}`}>
                                {selectedProject.status}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Bütçe:</span>
                            <p className="text-sm text-gray-600 mt-1">{formatCurrency(selectedProject.budget)}</p>
                          </div>
                        </div>
                        <div>
                                                      <span className="text-sm font-medium text-gray-700">Müşteri:</span>
                          <p className="text-sm text-gray-600 mt-1">{getCustomerName(selectedProject.customerId)}</p>
                        </div>
                        <div>
                                                      <span className="text-sm font-medium text-gray-700">Konum:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedProject.city}, {selectedProject.district} - {selectedProject.neighborhood}
                          </p>
                        </div>
                        <div>
                                                      <span className="text-sm font-medium text-gray-700">Süre:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(selectedProject.startDate).toLocaleDateString()} - {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Ongoing'}
                          </p>
                        </div>
                        <div>
                                                      <span className="text-sm font-medium text-gray-700">Finansal Özet:</span>
                          <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                            {(() => {
                              const financials = getProjectFinancials(selectedProject.id);
                              return (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span>Gelir:</span>
                                    <span className="text-green-600 font-medium">{formatCurrency(financials.income)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Diğer Giderler:</span>
                                    <span className="text-red-600 font-medium">{formatCurrency(financials.transactionExpenses)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Alt Yüklenici Ödemeleri:</span>
                                    <span className="text-red-600 font-medium">{formatCurrency(financials.subcontractorExpenses)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                                    <span>Net Kar:</span>
                                    <span className={financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {formatCurrency(financials.netProfit)}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subcontractors Tab */}
              {activeTab === 'subcontractors' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">İş Sözleşmeleri & Alt Yükleniciler</h3>
                    <button
                      onClick={() => window.location.href = '/work-contracts'}
                      className="btn-primary text-sm"
                    >
                      Yeni İş Sözleşmesi Ekle
                    </button>
                  </div>

                  {(() => {
                    const projectContracts = getProjectWorkContracts(selectedProject.id);
                    return projectContracts.length > 0 ? (
                      <div className="space-y-4">
                        {projectContracts.map((contract) => {
                          const contractPayments = getContractPayments(contract.id);
                          return (
                            <div key={contract.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{contract.contractNumber}</h4>
                                  <p className="text-sm text-gray-600">{contract.workDescription}</p>
                                  <p className="text-sm text-gray-500">Alt Yüklenici: {getSubcontractorName(contract.subcontractorId)}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  contract.status === 'active' ? 'text-green-600 bg-green-100' :
                                  contract.status === 'completed' ? 'text-blue-600 bg-blue-100' :
                                  'text-red-600 bg-red-100'
                                }`}>
                                  {contract.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <span className="text-xs text-gray-500">Müşteri Fiyatı</span>
                                  <p className="text-sm font-medium">{formatCurrency(contract.customerPrice)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Alt Yüklenici Fiyatı</span>
                                  <p className="text-sm font-medium">{formatCurrency(contract.subcontractorPrice)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Kar Marjı</span>
                                  <p className="text-sm font-medium text-green-600">{formatCurrency(contract.profitMargin)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Ödeme Durumu</span>
                                  <p className="text-sm font-medium">
                                    {formatCurrency(contract.paidAmount)} / {formatCurrency(contract.subcontractorPrice)}
                                  </p>
                                </div>
                              </div>

                              {/* Payments List */}
                              {contractPayments.length > 0 && (
                                <div className="border-t pt-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Ödeme Geçmişi</h5>
                                  <div className="space-y-2">
                                    {contractPayments.map((payment) => (
                                      <div key={payment.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                        <div>
                                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                          <span className="text-gray-500 ml-2">- {payment.description}</span>
                                        </div>
                                        <div className="text-gray-500">
                                          {new Date(payment.paymentDate).toLocaleDateString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🔧</div>
                        <p>Bu proje için iş sözleşmesi bulunmuyor</p>
                        <button
                          onClick={() => window.location.href = '/work-contracts'}
                          className="btn-primary mt-2"
                        >
                          İş Sözleşmesi Ekle
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Proje Dosyaları & Belgeler</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Bu proje için dosya yüklenmemiş</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
