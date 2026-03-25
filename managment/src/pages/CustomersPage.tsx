import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Building, User, Upload, X, ExternalLink, Download } from 'lucide-react';
import { Customer, Contact, Project } from '../types';
import { customerStorage, projectStorage } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { exportCustomersToCSV } from '../utils/csvExport';
import * as XLSX from 'xlsx';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'company' | 'individual';
  companyName?: string;
  logo?: string;
  contacts: Contact[];
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
}

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'individual',
    companyName: '',
    logo: '',
    contacts: [],
  });
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    isPrimary: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const customersData = customerStorage.getAll();
      const projectsData = projectStorage.getAll();
      setCustomers(customersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchMatch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       customer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const typeMatch = typeFilter === 'all' || customer.type === typeFilter;

    return searchMatch && typeMatch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    try {
      if (editingCustomer) {
        customerStorage.update(editingCustomer.id, formData);
      } else {
        customerStorage.create(formData);
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Müşteri kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
      companyName: customer.companyName || '',
      logo: customer.logo || '',
      contacts: customer.contacts || [],
    });
    setShowModal(true);
  };

  const handleDelete = (customerId: string) => {
    // Check if customer has associated projects
    const projects = projectStorage.getAll();
    const hasProjects = projects.some(project => project.customerId === customerId);
    
    if (hasProjects) {
      alert('İlişkili projeleri olan müşteri silinemez. Lütfen önce projeleri silin veya yeniden atayın.');
      return;
    }

    if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      try {
        customerStorage.delete(customerId);
        loadData();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Müşteri silinirken hata oluştu');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'individual',
      companyName: '',
      logo: '',
      contacts: [],
    });
  };

  const handleShowDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleAddContact = () => {
    setShowContactModal(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactFormData.name || !contactFormData.email || !contactFormData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        name: contactFormData.name,
        email: contactFormData.email,
        phone: contactFormData.phone,
        position: contactFormData.position,
        isPrimary: contactFormData.isPrimary,
      };

      const updatedContacts = [...formData.contacts, newContact];
      setFormData({ ...formData, contacts: updatedContacts });
      
      setContactFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        isPrimary: false,
      });
      setShowContactModal(false);
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Kişi eklenirken hata oluştu');
    }
  };

  const handleRemoveContact = (contactId: string) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter(c => c.id !== contactId)
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!file.type.startsWith('image/')) {
              alert('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData({ ...formData, logo: result });
    };
    reader.readAsDataURL(file);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects?highlight=${projectId}`);
  };

  const getCustomerProjectCount = (customerId: string) => {
    const projects = projectStorage.getAll();
    return projects.filter(project => project.customerId === customerId).length;
  };

  // Export functions
  const exportToCSV = () => {
    try {
      const customersToExport = filteredCustomers.length > 0 ? filteredCustomers : customers;
      exportCustomersToCSV(customersToExport, `müşteriler_${new Date().toISOString().split('T')[0]}.csv`);
      alert('CSV dosyası başarıyla indirildi!');
    } catch (error) {
      console.error('CSV export error:', error);
      alert('CSV dosyası oluşturulurken hata oluştu');
    }
  };

  const exportToExcel = () => {
    try {
      const customersToExport = filteredCustomers.length > 0 ? filteredCustomers : customers;
      
      // Prepare data for export
      const exportData = customersToExport.map(customer => ({
        'Müşteri Adı': customer.name,
        'E-posta': customer.email,
        'Telefon': customer.phone,
        'Adres': customer.address,
        'Tip': customer.type === 'company' ? 'Şirket' : 'Bireysel',
        'Şirket Adı': customer.companyName || '',
        'Vergi No': (customer as any).taxNumber || '',
        'Kişi Sayısı': customer.contacts ? customer.contacts.length : 0,
        'Proje Sayısı': getCustomerProjectCount(customer.id),
        'Oluşturulma Tarihi': new Date(customer.createdAt).toLocaleDateString('tr-TR'),
        'Güncelleme Tarihi': new Date(customer.updatedAt).toLocaleDateString('tr-TR')
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Müşteri Adı
        { wch: 25 }, // E-posta
        { wch: 15 }, // Telefon
        { wch: 30 }, // Adres
        { wch: 10 }, // Tip
        { wch: 20 }, // Şirket Adı
        { wch: 15 }, // Vergi No
        { wch: 12 }, // Kişi Sayısı
        { wch: 12 }, // Proje Sayısı
        { wch: 15 }, // Oluşturulma Tarihi
        { wch: 15 }  // Güncelleme Tarihi
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      const sheetName = filteredCustomers.length > 0 ? 'Filtrelenmiş_Müşteriler' : 'Tüm_Müşteriler';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = filteredCustomers.length > 0 
        ? `filtrelenmiş_müşteriler_${timestamp}.xlsx`
        : `tüm_müşteriler_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename, { bookType: 'xlsx', type: 'binary' });
      
      alert(`Excel dosyası başarıyla indirildi: ${filename}`);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel dosyası oluşturulurken hata oluştu');
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
          <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-600 mt-1">Müşteri ilişkilerinizi yönetin</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center"
              title="CSV olarak dışa aktar"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="btn-secondary flex items-center"
              title="Excel olarak dışa aktar"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Müşteri
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
              placeholder="Müşteri ara..."
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
            {filteredCustomers.length} / {customers.length} müşteri
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Tipi</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Tüm Tipler</option>
                  <option value="individual">Bireysel</option>
                  <option value="company">Şirket</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setTypeFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="dashboard-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleShowDetail(customer)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {customer.logo ? (
                    <img src={customer.logo} alt={customer.name} className="h-8 w-8 rounded mr-2 object-contain bg-white border border-gray-200" />
                  ) : customer.type === 'company' ? (
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <User className="h-5 w-5 text-green-600 mr-2" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                </div>
                {customer.type === 'company' && customer.companyName && (
                  <p className="text-sm text-gray-600 mb-2">{customer.companyName}</p>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.type === 'company' 
                    ? 'text-blue-600 bg-blue-100' 
                    : 'text-green-600 bg-green-100'
                }`}>
                  {customer.type === 'company' ? 'Şirket' : 'Bireysel'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(customer);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(customer.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{customer.email}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{customer.phone}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{customer.address}</span>
              </div>

              {/* Contact Count */}
              {customer.contacts && customer.contacts.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{customer.contacts.length} kişi</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {getCustomerProjectCount(customer.id)} proje
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Arama terimlerinizi ayarlamayı deneyin'
              : 'İlk müşterinizi ekleyerek başlayın'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Müşteri Ekle
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
                {editingCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Müşteri Tipi
                  </label>
                                      <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'company' | 'individual' })}
                      className="input-field"
                    >
                      <option value="individual">Bireysel</option>
                      <option value="company">Şirket</option>
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.type === 'company' ? 'Şirket Adı' : 'Ad Soyad'} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder={formData.type === 'company' ? 'Şirket adını girin' : 'Ad soyad girin'}
                    required
                  />
                </div>

                {formData.type === 'company' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      İletişim Kişisi Adı
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="input-field"
                      placeholder="İletişim kişisi adını girin"
                    />
                  </div>
                )}

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo (İsteğe Bağlı)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.logo ? (
                      <div className="space-y-2">
                        <img src={formData.logo} alt="Logo" className="h-16 w-16 mx-auto rounded object-contain bg-white border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logo: '' })}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Logoyu Kaldır
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Şirket logosu yükle</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="btn-secondary cursor-pointer"
                        >
                          Dosya Seç
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="E-posta adresi girin"
                      required
                    />
                </div>

                <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="Telefon numarası girin"
                      required
                    />
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
                    placeholder="Adres girin"
                  />
                </div>

                {/* Contacts Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Kişiler
                    </label>
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Kişi Ekle
                    </button>
                  </div>
                  
                  {formData.contacts.length > 0 && (
                    <div className="space-y-2">
                      {formData.contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contact.name}</div>
                            <div className="text-xs text-gray-600">{contact.email} • {contact.phone}</div>
                            {contact.position && (
                              <div className="text-xs text-gray-500">{contact.position}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(contact.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingCustomer ? 'Müşteriyi Güncelle' : 'Müşteri Oluştur'}
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Kişi Ekle</h2>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    className="input-field"
                    placeholder="Ad soyad girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    value={contactFormData.position || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, position: e.target.value })}
                    className="input-field"
                    placeholder="örn: Proje Yöneticisi, Satış Müdürü"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-posta Adresi *
                  </label>
                  <input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    className="input-field"
                    placeholder="E-posta adresi girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    value={contactFormData.phone}
                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                    className="input-field"
                    placeholder="Telefon numarası girin"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={contactFormData.isPrimary}
                    onChange={(e) => setContactFormData({ ...contactFormData, isPrimary: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                    Birincil iletişim kişisi
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Kişi Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
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

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        {selectedCustomer.logo ? (
                          <img src={selectedCustomer.logo} alt={selectedCustomer.name} className="h-12 w-12 rounded mr-3 object-contain bg-white border border-gray-200" />
                        ) : selectedCustomer.type === 'company' ? (
                          <Building className="h-8 w-8 text-blue-600 mr-3" />
                        ) : (
                          <User className="h-8 w-8 text-green-600 mr-3" />
                        )}
                        <div>
                          <div className="font-semibold">{selectedCustomer.name}</div>
                          <div className="text-sm text-gray-600">
                            {selectedCustomer.type === 'company' ? 'Şirket' : 'Bireysel'}
                          </div>
                          {selectedCustomer.companyName && (
                            <div className="text-sm text-gray-500">{selectedCustomer.companyName}</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedCustomer.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedCustomer.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contacts */}
                  {selectedCustomer.contacts && selectedCustomer.contacts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişiler</h3>
                      <div className="space-y-3">
                        {selectedCustomer.contacts.map((contact) => (
                          <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{contact.name}</div>
                              {contact.isPrimary && (
                                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Birincil</span>
                              )}
                            </div>
                            {contact.position && (
                              <div className="text-sm text-gray-600 mb-1">{contact.position}</div>
                            )}
                            <div className="text-sm text-gray-600">{contact.email}</div>
                            <div className="text-sm text-gray-600">{contact.phone}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Projeler</h3>
                  {(() => {
                    const customerProjects = projects.filter(p => p.customerId === selectedCustomer.id);
                    return customerProjects.length > 0 ? (
                      <div className="space-y-3">
                        {customerProjects.map((project) => (
                          <div 
                            key={project.id} 
                            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleProjectClick(project.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{project.name}</div>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{project.description}</div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{project.status}</span>
                              <span>{new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Bu müşteri için proje bulunamadı</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
