import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Edit, Trash2, Filter, Calendar, User, FileText, Eye, Download, Receipt } from 'lucide-react';
import { SubcontractorPayment, WorkContract, Subcontractor, Project } from '../types';
import { subcontractorPaymentStorage, workContractStorage, subcontractorStorage, projectStorage } from '../utils/storage';

interface PaymentFormData {
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  description: string;
  receipt?: string;
  receiptFileName?: string;
  notes: string;
}

const SubcontractorPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<SubcontractorPayment[]>([]);
  const [workContracts, setWorkContracts] = useState<WorkContract[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SubcontractorPayment | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    contractId: '',
    amount: 0,
    paymentDate: '',
    paymentMethod: 'bank_transfer',
    description: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Verileri periyodik olarak güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPayments = subcontractorPaymentStorage.getAll();
      const currentContracts = workContractStorage.getAll();
      const currentSubcontractors = subcontractorStorage.getAll();
      const currentProjects = projectStorage.getAll();
      
      setPayments(currentPayments);
      setWorkContracts(currentContracts);
      setSubcontractors(currentSubcontractors);
      setProjects(currentProjects);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    try {
      const paymentsData = subcontractorPaymentStorage.getAll();
      const contractsData = workContractStorage.getAll();
      const subcontractorsData = subcontractorStorage.getAll();
      const projectsData = projectStorage.getAll();
      
      setPayments(paymentsData);
      setWorkContracts(contractsData);
      setSubcontractors(subcontractorsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const contract = workContracts.find(c => c.id === payment.contractId);
    const subcontractor = subcontractors.find(s => s.id === contract?.subcontractorId);
    const project = projects.find(p => p.id === contract?.projectId);
    
    const contractNumber = contract ? contract.contractNumber : '';
    const subcontractorName = subcontractor ? subcontractor.name : '';
    const projectName = project ? project.name : '';
    
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subcontractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesContract = contractFilter === 'all' || payment.contractId === contractFilter;
    
    return matchesSearch && matchesStatus && matchesContract;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contractId || formData.amount <= 0 || !formData.paymentDate) {
      alert('Lütfen tüm gerekli alanları doldurun ve tutarın 0\'dan büyük olduğundan emin olun');
      return;
    }

    try {
      if (editingPayment) {
        subcontractorPaymentStorage.update(editingPayment.id, formData);
      } else {
        subcontractorPaymentStorage.create(formData);
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Ödeme kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (payment: SubcontractorPayment) => {
    setEditingPayment(payment);
    setFormData({
      contractId: payment.contractId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      receipt: payment.receipt,
      receiptFileName: payment.receiptFileName,
      notes: payment.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (paymentId: string) => {
    if (window.confirm('Bu ödemeyi silmek istediğinizden emin misiniz?')) {
      try {
        subcontractorPaymentStorage.delete(paymentId);
        loadData();
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Ödeme silinirken hata oluştu');
      }
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayment(null);
    setFormData({
      contractId: '',
      amount: 0,
      paymentDate: '',
      paymentMethod: 'bank_transfer',
      description: '',
      notes: '',
    });
  };

  const getContractInfo = (contractId: string) => {
    const contract = workContracts.find(c => c.id === contractId);
    const subcontractor = subcontractors.find(s => s.id === contract?.subcontractorId);
    const project = projects.find(p => p.id === contract?.projectId);
    
    return {
      contract,
      subcontractor,
      project,
    };
  };

  const getStatusColor = (status: SubcontractorPayment['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Nakit';
      case 'bank_transfer':
        return 'Banka Transferi';
      case 'check':
        return 'Çek';
      default:
        return method;
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
          <h1 className="text-3xl font-bold text-gray-900">Alt Yüklenici Ödemeleri</h1>
          <p className="text-gray-600 mt-1">Alt yüklenicilere ödemeleri yönetin ve finansal kayıtları takip edin</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
                      Yeni Ödeme
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ödeme ara..."
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
            Filtreler
          </button>
          <div className="text-sm text-gray-500">
                          {filteredPayments.length} / {payments.length} ödeme
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="pending">Beklemede</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              {/* Contract Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İş Sözleşmesi</label>
                <select
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Tüm Sözleşmeler</option>
                  {workContracts.map((contract) => {
                    const { subcontractor, project } = getContractInfo(contract.id);
                    return (
                      <option key={contract.id} value={contract.id}>
                        {contract.contractNumber} - {subcontractor?.name} ({project?.name})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setContractFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPayments.map((payment) => {
          const { contract, subcontractor, project } = getContractInfo(payment.contractId);
          
          return (
            <div key={payment.id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {formatCurrency(payment.amount)}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(payment)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(payment.id)}
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
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="truncate">{contract?.contractNumber || 'Unknown Contract'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">{subcontractor?.name || 'Unknown Subcontractor'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="truncate">{project?.name || 'Unknown Project'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{getPaymentMethodText(payment.paymentMethod)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{payment.description}</p>

                {/* Receipt */}
                {payment.receipt && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-blue-700">
                      <Receipt className="h-4 w-4 mr-2" />
                      <span>{payment.receiptFileName || 'Receipt attached'}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {payment.notes && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {payment.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Ödeme bulunamadı' : 'Henüz ödeme yok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
                              : 'İlk ödemenizi oluşturarak başlayın'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenModal}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ödeme Oluştur
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingPayment ? 'Ödemeyi Düzenle' : 'Yeni Ödeme'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contract Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Contract *
                  </label>
                  <select
                    value={formData.contractId}
                    onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select a work contract</option>
                    {workContracts.map((contract) => {
                      const { subcontractor, project } = getContractInfo(contract.id);
                      return (
                        <option key={contract.id} value={contract.id}>
                          {contract.contractNumber} - {subcontractor?.name} ({project?.name}) - 
                          {formatCurrency(contract.remainingAmount)} remaining
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (TL) *
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
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="input-field"
                    required
                  >
                    <option value="bank_transfer">Banka Transferi</option>
                    <option value="cash">Nakit</option>
                    <option value="check">Çek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Describe the payment purpose"
                    required
                  />
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
                    {editingPayment ? 'Update Payment' : 'Create Payment'}
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

export default SubcontractorPaymentsPage;
