import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Edit, Trash2, Filter, Calendar, DollarSign, User, FolderOpen, TrendingUp, Eye, Download } from 'lucide-react';
import { WorkContract, Subcontractor, Project, Milestone } from '../types';
import { workContractStorage, subcontractorStorage, projectStorage } from '../utils/storage';

interface WorkContractFormData {
  projectId: string;
  subcontractorId: string;
  contractNumber: string;
  workDescription: string;
  customerPrice: number;
  subcontractorPrice: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  paymentTerms: string;
  milestones: Milestone[];
  notes: string;
}

const WorkContractsPage: React.FC = () => {
  const [workContracts, setWorkContracts] = useState<WorkContract[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [subcontractorFilter, setSubcontractorFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState<WorkContract | null>(null);
  const [formData, setFormData] = useState<WorkContractFormData>({
    projectId: '',
    subcontractorId: '',
    contractNumber: '',
    workDescription: '',
    customerPrice: 0,
    subcontractorPrice: 0,
    startDate: '',
    endDate: '',
    status: 'active',
    paymentTerms: '',
    milestones: [],
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Proje listesini sürekli güncelle (her 2 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProjects = projectStorage.getAll();
      setProjects(currentProjects);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Sayfa odaklandığında projeleri yenile
  useEffect(() => {
    const handleFocus = () => {
      const currentProjects = projectStorage.getAll();
      setProjects(currentProjects);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Sayfa odaklandığında da projeleri yenile
  useEffect(() => {
    const handleFocus = () => {
      const currentProjects = projectStorage.getAll();
      setProjects(currentProjects);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleFocus); // localStorage değişikliklerini dinle
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleFocus);
    };
  }, []);

  const loadData = () => {
    try {
      const workContractsData = workContractStorage.getAll();
      const subcontractorsData = subcontractorStorage.getAll();
      const projectsData = projectStorage.getAll();
      
      setWorkContracts(workContractsData);
      setSubcontractors(subcontractorsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Proje listesini her render'da yeniden yükle
  const getCurrentProjects = () => {
    // Her çağrıldığında localStorage'dan direkt oku
    const currentProjects = projectStorage.getAll();
    console.log('getCurrentProjects called, found projects:', currentProjects.length);
    console.log('Current projects:', currentProjects.map(p => p.name));
    
    return currentProjects;
  };

  const filteredWorkContracts = workContracts.filter(contract => {
    const project = projects.find(p => p.id === contract.projectId);
    const subcontractor = subcontractors.find(s => s.id === contract.subcontractorId);
    const projectName = project ? project.name : '';
    const subcontractorName = subcontractor ? subcontractor.name : '';
    
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subcontractorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesProject = projectFilter === 'all' || contract.projectId === projectFilter;
    const matchesSubcontractor = subcontractorFilter === 'all' || contract.subcontractorId === subcontractorFilter;
    
    return matchesSearch && matchesStatus && matchesProject && matchesSubcontractor;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.subcontractorId || !formData.workDescription || 
        formData.customerPrice <= 0 || formData.subcontractorPrice <= 0) {
      alert('Lütfen tüm gerekli alanları doldurun ve fiyatların 0\'dan büyük olduğundan emin olun');
      return;
    }

    try {
      if (editingContract) {
        workContractStorage.update(editingContract.id, formData);
      } else {
        workContractStorage.create(formData);
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving work contract:', error);
      alert('İş sözleşmesi kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (contract: WorkContract) => {
    // Edit modal açıldığında projeleri yenile
    const currentProjects = projectStorage.getAll();
    setProjects(currentProjects);
    
    setEditingContract(contract);
    setFormData({
      projectId: contract.projectId,
      subcontractorId: contract.subcontractorId,
      contractNumber: contract.contractNumber,
      workDescription: contract.workDescription,
      customerPrice: contract.customerPrice,
      subcontractorPrice: contract.subcontractorPrice,
      startDate: contract.startDate,
      endDate: contract.endDate || '',
      status: contract.status,
      paymentTerms: contract.paymentTerms,
      milestones: contract.milestones,
      notes: contract.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (contractId: string) => {
    if (window.confirm('Bu iş sözleşmesini silmek istediğinizden emin misiniz?')) {
      try {
        workContractStorage.delete(contractId);
        loadData();
      } catch (error) {
        console.error('Error deleting work contract:', error);
        alert('İş sözleşmesi silinirken hata oluştu');
      }
    }
  };

  const handleOpenModal = () => {
    // Modal açıldığında projeleri yenile
    const currentProjects = projectStorage.getAll();
    setProjects(currentProjects);
    setShowModal(true);
  };

  const refreshProjects = () => {
    // Projeleri yenile
    const currentProjects = projectStorage.getAll();
    setProjects(currentProjects);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContract(null);
    setFormData({
      projectId: '',
      subcontractorId: '',
      contractNumber: workContractStorage.generateContractNumber(),
      workDescription: '',
      customerPrice: 0,
      subcontractorPrice: 0,
      startDate: '',
      endDate: '',
      status: 'active',
      paymentTerms: '',
      milestones: [],
      notes: '',
    });
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, {
        id: Date.now().toString(),
        description: '',
        amount: 0,
        dueDate: '',
        status: 'pending',
        notes: '',
      }]
    }));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Bilinmeyen Proje';
  };

  const getSubcontractorName = (subcontractorId: string) => {
    const subcontractor = subcontractors.find(s => s.id === subcontractorId);
    return subcontractor ? subcontractor.name : 'Bilinmeyen Alt Yüklenici';
  };

  const getStatusColor = (status: WorkContract['status']) => {
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

  const calculateProfitMargin = (customerPrice: number, subcontractorPrice: number) => {
    return customerPrice - subcontractorPrice;
  };

  const calculateProfitPercentage = (customerPrice: number, subcontractorPrice: number) => {
    return ((customerPrice - subcontractorPrice) / customerPrice) * 100;
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
                     <h1 className="text-3xl font-bold text-gray-900">İş Sözleşmeleri</h1>
          <p className="text-gray-600 mt-1">Alt yüklenici iş sözleşmelerini ve kar marjlarını yönetin</p>
         </div>
         <div className="flex space-x-3">
           <button
             onClick={refreshProjects}
             className="btn-secondary flex items-center"
             title="Refresh project list"
           >
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
             Refresh Projects
           </button>
           <button
             onClick={handleOpenModal}
             className="btn-primary flex items-center"
           >
             <Plus className="h-5 w-5 mr-2" />
             Yeni İş Sözleşmesi
           </button>
         </div>
       </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <div className="text-sm text-gray-500">
            {filteredWorkContracts.length} of {workContracts.length} contracts
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

                             {/* Project Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                   <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Projects</option>
                    {projectStorage.getAll().map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
               </div>

              {/* Subcontractor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcontractor</label>
                <select
                  value={subcontractorFilter}
                  onChange={(e) => setSubcontractorFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Subcontractors</option>
                  {subcontractors.map((subcontractor) => (
                    <option key={subcontractor.id} value={subcontractor.id}>{subcontractor.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setProjectFilter('all');
                  setSubcontractorFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Work Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkContracts.map((contract) => {
          const profitMargin = calculateProfitMargin(contract.customerPrice, contract.subcontractorPrice);
          const profitPercentage = calculateProfitPercentage(contract.customerPrice, contract.subcontractorPrice);
          
          return (
            <div key={contract.id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{contract.contractNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
                                 <div className="flex space-x-2 flex-shrink-0">
                   <button
                     onClick={() => window.location.href = '/subcontractor-payments'}
                     className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                     title="Add Payment"
                   >
                     <DollarSign className="h-4 w-4" />
                   </button>
                   <button
                     onClick={() => handleEdit(contract)}
                     className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                     title="Edit"
                   >
                     <Edit className="h-4 w-4" />
                   </button>
                   <button
                     onClick={() => handleDelete(contract.id)}
                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                     title="Delete"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                 </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    <span className="truncate">{getProjectName(contract.projectId)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">{getSubcontractorName(contract.subcontractorId)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{contract.workDescription}</p>

                {/* Financial Summary */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Price:</span>
                    <span className="font-medium text-green-600">{formatCurrency(contract.customerPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subcontractor Price:</span>
                    <span className="font-medium text-red-600">{formatCurrency(contract.subcontractorPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-1">
                    <span>Profit Margin:</span>
                    <span className="text-green-600">{formatCurrency(profitMargin)} ({profitPercentage.toFixed(1)}%)</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <span>Paid Amount:</span>
                    <span className="font-medium">{formatCurrency(contract.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Remaining:</span>
                    <span className="font-medium">{formatCurrency(contract.remainingAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(contract.paidAmount / contract.subcontractorPrice) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Milestones */}
                {contract.milestones.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Milestones:</p>
                    <div className="space-y-1">
                      {contract.milestones.slice(0, 2).map((milestone, index) => (
                        <div key={milestone.id} className="flex justify-between text-xs">
                          <span className="truncate">{milestone.description}</span>
                          <span className={`px-1 rounded text-xs ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      ))}
                      {contract.milestones.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{contract.milestones.length - 2} more milestones
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {contract.notes && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {contract.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredWorkContracts.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'İş sözleşmesi bulunamadı' : 'Henüz iş sözleşmesi yok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by creating your first work contract'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Work Contract
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
                {editingContract ? 'İş Sözleşmesini Düzenle' : 'Yeni İş Sözleşmesi'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contract Number
                    </label>
                    <input
                      type="text"
                      value={formData.contractNumber}
                      onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                      className="input-field bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Project *
                      </label>
                                             <button
                         type="button"
                         onClick={refreshProjects}
                         className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                         title="Refresh project list"
                       >
                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                         Refresh
                       </button>
                    </div>
                                                                                      <select
                         value={formData.projectId}
                         onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                         onFocus={refreshProjects}
                         className="input-field"
                         required
                       >
                         <option value="">Select a project</option>
                         {projectStorage.getAll().map((project) => (
                           <option key={project.id} value={project.id}>
                             {project.name}
                           </option>
                         ))}
                       </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcontractor *
                    </label>
                    <select
                      value={formData.subcontractorId}
                      onChange={(e) => setFormData({ ...formData, subcontractorId: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select a subcontractor</option>
                      {subcontractors.map((subcontractor) => (
                        <option key={subcontractor.id} value={subcontractor.id}>
                          {subcontractor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Description *
                  </label>
                  <textarea
                    value={formData.workDescription}
                    onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Describe the work to be done"
                    required
                  />
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Price (TL) *
                    </label>
                    <input
                      type="number"
                      value={formData.customerPrice}
                      onChange={(e) => setFormData({ ...formData, customerPrice: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcontractor Price (TL) *
                    </label>
                    <input
                      type="number"
                      value={formData.subcontractorPrice}
                      onChange={(e) => setFormData({ ...formData, subcontractorPrice: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Profit Margin Display */}
                {formData.customerPrice > 0 && formData.subcontractorPrice > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Profit Margin:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(calculateProfitMargin(formData.customerPrice, formData.subcontractorPrice))} 
                        ({calculateProfitPercentage(formData.customerPrice, formData.subcontractorPrice).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
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
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Peşin %30, iş bitiminde %70"
                  />
                </div>

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Milestones
                    </label>
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="btn-secondary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Milestone
                    </button>
                  </div>

                  {formData.milestones.length === 0 ? (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No milestones added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={milestone.description}
                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                className="input-field"
                                placeholder="Milestone description"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (TL)</label>
                              <input
                                type="number"
                                value={milestone.amount}
                                onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                                className="input-field"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                              <input
                                type="date"
                                value={milestone.dueDate}
                                onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <button
                              type="button"
                              onClick={() => removeMilestone(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter any additional notes"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingContract ? 'Update Work Contract' : 'Create Work Contract'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkContractsPage;
