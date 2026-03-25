import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Plus, Search, Trash2, Filter, Phone, Mail, MapPin, Upload, X } from 'lucide-react';
import { Subcontractor, WorkContract, Project } from '../types';
import { subcontractorStorage, workContractStorage, projectStorage } from '../utils/storage';

interface SubcontractorFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  specialization: string;
  isSupplier: boolean;
  logo: string;
  notes: string;
}

const SubcontractorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [workContracts, setWorkContracts] = useState<WorkContract[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  const [formData, setFormData] = useState<SubcontractorFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    specialization: '',
    isSupplier: false,
    logo: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [dragOverImage, setDragOverImage] = useState(false);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const subcontractorsData = subcontractorStorage.getAll();
      const workContractsData = workContractStorage.getAll();
      const projectsData = projectStorage.getAll();
      
      setSubcontractors(subcontractorsData);
      setWorkContracts(workContractsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubcontractors = subcontractors.filter(subcontractor => {
    const matchesSearch = subcontractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subcontractor.phone.includes(searchTerm) ||
                         (subcontractor.email && subcontractor.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialization = specializationFilter === 'all' || 
                                 subcontractor.specialization.some(spec => 
                                   spec.toLowerCase().includes(specializationFilter.toLowerCase())
                                 );
    
    return matchesSearch && matchesSpecialization;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      const subcontractorData = {
        ...formData,
        specialization: formData.specialization ? formData.specialization.split(',').map(s => s.trim()) : [],
        rating: 5,
        status: 'active' as const,
      };

      if (editingSubcontractor) {
        subcontractorStorage.update(editingSubcontractor.id, subcontractorData);
      } else {
        subcontractorStorage.create(subcontractorData);
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving subcontractor:', error);
      alert('Alt yüklenici kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (subcontractor: Subcontractor) => {
    setEditingSubcontractor(subcontractor);
    setFormData({
      name: subcontractor.name,
      phone: subcontractor.phone,
      email: subcontractor.email || '',
      address: subcontractor.address || '',
      taxNumber: subcontractor.taxNumber || '',
      specialization: subcontractor.specialization.join(', '),
      isSupplier: subcontractor.isSupplier || false,
      logo: subcontractor.logo || '',
      notes: subcontractor.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (subcontractorId: string) => {
    if (window.confirm('Bu alt yükleniciyi silmek istediğinizden emin misiniz?')) {
      try {
        subcontractorStorage.delete(subcontractorId);
        loadData();
      } catch (error) {
        console.error('Error deleting subcontractor:', error);
        alert('Alt yüklenici silinirken hata oluştu');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubcontractor(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      specialization: '',
      isSupplier: false,
      logo: '',
      notes: '',
    });
  };

  // Logo upload fonksiyonları
  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImage(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImage(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: '' });
  };

  const handleContractClick = (contract: WorkContract) => {
    // Eğer ödeme tamamlanmışsa Transactions sayfasına, değilse SubcontractorPayments sayfasına git
    if (contract.remainingAmount === 0) {
      // Ödeme tamamlanmış - Transactions sayfasına git
      navigate('/transactions');
    } else {
      // Ödeme bekliyor - SubcontractorPayments sayfasına git
      navigate('/subcontractor-payments');
    }
  };



  const getSubcontractorStats = (subcontractorId: string) => {
    const contracts = workContracts.filter(contract => contract.subcontractorId === subcontractorId);
    const activeContracts = contracts.filter(contract => contract.status === 'active');
    const totalEarnings = contracts.reduce((sum, contract) => sum + contract.subcontractorPrice, 0);
    const totalPaid = contracts.reduce((sum, contract) => sum + contract.paidAmount, 0);
    const remainingAmount = totalEarnings - totalPaid;
    
    return {
      totalContracts: contracts.length,
      activeContracts: activeContracts.length,
      totalEarnings,
      totalPaid,
      remainingAmount,
    };
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Alt Yükleniciler</h1>
          <p className="text-gray-600 mt-1">Alt yüklenicilerinizi ve performanslarını yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
                      Yeni Alt Yüklenici
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Alt yüklenici ara..."
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
                          {filteredSubcontractors.length} / {subcontractors.length} alt yüklenici
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


              {/* Specialization Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uzmanlık</label>
                <input
                  type="text"
                  value={specializationFilter === 'all' ? '' : specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value || 'all')}
                  className="input-field"
                  placeholder="Uzmanlık alanına göre filtrele"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSpecializationFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Filtreyi Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subcontractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubcontractors.map((subcontractor) => {
          const stats = getSubcontractorStats(subcontractor.id);
          return (
            <div key={subcontractor.id} className="dashboard-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleEdit(subcontractor)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-3 mb-2">
                    {subcontractor.logo ? (
                      <img 
                        src={subcontractor.logo} 
                        alt={subcontractor.name} 
                        className="h-10 w-10 rounded-lg object-contain bg-white border border-gray-200 flex-shrink-0" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{subcontractor.name}</h3>
                      {subcontractor.isSupplier && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          Tedarikçi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(subcontractor.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{subcontractor.phone}</span>
                  </div>
                  {subcontractor.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{subcontractor.email}</span>
                    </div>
                  )}
                  {subcontractor.taxNumber && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Vergi No:</span>
                      <span className="ml-1">{subcontractor.taxNumber}</span>
                    </div>
                  )}
                  {subcontractor.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{subcontractor.address}</span>
                    </div>
                  )}
                </div>

                {/* Specializations */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Uzmanlık Alanları:</p>
                  <div className="text-sm text-gray-600">
                    {subcontractor.specialization.join(', ')}
                  </div>
                </div>



                {/* Statistics */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <span>Toplam Sözleşme:</span>
                    <span className="font-medium">{stats.totalContracts}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Aktif Sözleşme:</span>
                    <span className="font-medium">{stats.activeContracts}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Toplam Kazanç:</span>
                    <span className="font-medium">{formatCurrency(stats.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Ödenen Tutar:</span>
                    <span className="text-blue-600">{formatCurrency(stats.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold border-t pt-1 mt-1">
                    <span>Kalan Borç:</span>
                    <span className={stats.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(stats.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {subcontractor.notes && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {subcontractor.notes}
                  </div>
                )}

                                 {/* Recent Projects */}
                 {stats.totalContracts > 0 && (
                   <div className="mt-3 pt-3 border-t border-gray-200">
                     <p className="text-xs font-medium text-gray-700 mb-2">Son Projeler:</p>
                     <div className="space-y-1">
                       {workContracts
                         .filter(contract => contract.subcontractorId === subcontractor.id)
                         .slice(0, 2)
                         .map(contract => {
                           const project = projects.find(p => p.id === contract.projectId);
                           return (
                             <div key={contract.id} className="text-xs text-gray-600">
                               <div className="flex justify-between">
                                 <span className="truncate">{contract.workDescription}</span>
                                 <span className="text-blue-600">{formatCurrency(contract.subcontractorPrice)}</span>
                               </div>
                                                            <div className="text-gray-500 text-xs">
                               {project && (
                                 <span className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-xs">
                                   📋 {project.name}
                                 </span>
                               )}
                             </div>
                             <div className="text-gray-500 text-xs">
                               {contract.status === 'active' ? 'Aktif' : 
                                contract.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                             </div>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleContractClick(contract);
                               }}
                               className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
                             >
                               {contract.remainingAmount > 0 ? 'Ödeme Detayları →' : 'İşlem Detayları →'}
                             </button>
                             </div>
                           );
                         })}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSubcontractors.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Alt yüklenici bulunamadı' : 'Henüz alt yüklenici yok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Arama terimlerinizi ayarlamayı deneyin'
              : 'İlk alt yüklenicinizi ekleyerek başlayın'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Alt Yüklenici Ekle
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSubcontractor ? 'Alt Yükleniciyi Düzenle' : 'Yeni Alt Yüklenici'}
                </h2>
                                 {editingSubcontractor && (
                   <div className="text-sm text-gray-600">
                     <div>Toplam Sözleşme: {workContracts.filter(c => c.subcontractorId === editingSubcontractor.id).length}</div>
                     <div>Toplam Kazanç: {formatCurrency(workContracts.filter(c => c.subcontractorId === editingSubcontractor.id).reduce((sum, c) => sum + c.subcontractorPrice, 0))}</div>
                     <div>Toplam Proje: {new Set(workContracts.filter(c => c.subcontractorId === editingSubcontractor.id).map(c => c.projectId)).size}</div>
                   </div>
                 )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      İsim - Şirket *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="Alt yüklenici ismi veya şirket adını girin"
                      required
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Logo (İsteğe Bağlı)
                    </label>
                    <div className="space-y-3">
                      {formData.logo ? (
                        <div className="relative">
                          <img
                            src={formData.logo}
                            alt="Logo"
                            className="h-20 w-20 object-contain rounded-lg border border-gray-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            dragOverImage
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Logo'yu buraya sürükleyin veya
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="text-primary-600 hover:text-primary-700 cursor-pointer text-sm font-medium"
                          >
                            Dosya Seç
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="Telefon numarasını girin"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="E-posta adresini girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vergi Numarası
                    </label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      className="input-field"
                      placeholder="Vergi numarasını girin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Adresi girin"
                  />
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Uzmanlık Alanları
                  </label>
                  <textarea
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Uzmanlık alanlarını virgülle ayırarak yazın (örn: tel-çit, peyzaj, elektrik)"
                  />
                </div>



                {/* Tedarikçi Checkbox */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSupplier"
                      checked={formData.isSupplier}
                      onChange={(e) => setFormData({ ...formData, isSupplier: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isSupplier" className="ml-2 block text-sm font-semibold text-gray-700">
                      Tedarikçi olarak işaretle
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    İşaretlenirse, bu kişi/firma quotes sayfasında tedarikçi olarak görünecektir.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Ek notları girin"
                  />
                </div>

                                 {/* Proje Detayları - Sadece düzenleme sırasında göster */}
                 {editingSubcontractor && (
                   <div className="border-t pt-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Proje Detayları</h3>
                     <div className="space-y-4">
                       {workContracts
                         .filter(contract => contract.subcontractorId === editingSubcontractor.id)
                         .map(contract => {
                           const project = projects.find(p => p.id === contract.projectId);
                           return (
                             <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
                               <div className="flex justify-between items-start mb-2">
                                 <div className="flex-1">
                                   <h4 className="font-medium text-gray-900">{contract.workDescription}</h4>
                                   <div className="flex items-center space-x-4 text-sm text-gray-600">
                                     <span>Sözleşme No: {contract.contractNumber}</span>
                                     {project && (
                                       <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                         📋 {project.name}
                                       </span>
                                     )}
                                   </div>
                                 </div>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                   contract.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                   contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                                   'bg-red-100 text-red-800'
                                 }`}>
                                   {contract.status === 'active' ? 'Aktif' : 
                                    contract.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                                 </span>
                               </div>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                 <div>
                                   <span className="text-gray-600">Müşteri Fiyatı:</span>
                                   <div className="font-medium">{formatCurrency(contract.customerPrice)}</div>
                                 </div>
                                 <div>
                                   <span className="text-gray-600">Alt Yüklenici Fiyatı:</span>
                                   <div className="font-medium">{formatCurrency(contract.subcontractorPrice)}</div>
                                 </div>
                                 <div>
                                   <span className="text-gray-600">Ödenen Tutar:</span>
                                   <div className="font-medium text-blue-600">{formatCurrency(contract.paidAmount)}</div>
                                 </div>
                                 <div>
                                   <span className="text-gray-600">Kalan Tutar:</span>
                                   <div className={`font-medium ${contract.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                     {formatCurrency(contract.remainingAmount)}
                                   </div>
                                 </div>
                               </div>
                               {contract.notes && (
                                 <div className="mt-2 text-sm text-gray-600">
                                   <span className="font-medium">Notlar:</span> {contract.notes}
                                 </div>
                               )}
                               <div className="mt-3 pt-3 border-t border-gray-200">
                                 <button
                                   onClick={() => handleContractClick(contract)}
                                   className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                 >
                                   {contract.remainingAmount > 0 ? 'Ödeme Detaylarına Git →' : 'İşlem Detaylarına Git →'}
                                 </button>
                               </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingSubcontractor ? 'Alt Yükleniciyi Güncelle' : 'Alt Yüklenici Oluştur'}
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
    </div>
  );
};

export default SubcontractorsPage;
