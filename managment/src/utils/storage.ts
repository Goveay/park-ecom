import { v4 as uuidv4 } from 'uuid';
import { User, Customer, Product, Project, Transaction, Quote, Subcontractor, WorkContract, SubcontractorPayment, MediaFile, MediaFolder, MediaTag, MediaCategory, MediaPermission, MediaVersion, ActivityLog, TransactionCategory } from '../types';
import { logger } from './logger';

// Storage keys
const STORAGE_KEYS = {
  USER: 'management_user',
  CUSTOMERS: 'management_customers',
  PRODUCTS: 'management_products',
  PRODUCT_CATEGORIES: 'management_product_categories',
  PROJECTS: 'management_projects',
  TRANSACTIONS: 'management_transactions',
  QUOTES: 'management_quotes',
  SUBCONTRACTORS: 'management_subcontractors', // YENİ
  WORK_CONTRACTS: 'management_work_contracts', // YENİ
  SUBCONTRACTOR_PAYMENTS: 'management_subcontractor_payments', // YENİ
  AUTH_TOKEN: 'management_auth_token',
  // YENİ EKLENEN - Dosya ve medya yönetimi
  MEDIA_FILES: 'management_media_files',
  MEDIA_FOLDERS: 'management_media_folders',
  MEDIA_TAGS: 'management_media_tags',
  MEDIA_CATEGORIES: 'management_media_categories',
  MEDIA_PERMISSIONS: 'management_media_permissions',
  MEDIA_VERSIONS: 'management_media_versions',
  // YENİ EKLENEN - Kullanıcı yönetimi ve log sistemi
  USERS: 'management_users',
  ACTIVITY_LOGS: 'management_activity_logs',
  TRANSACTION_CATEGORIES: 'management_transaction_categories',
} as const;

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// User management
export const userStorage = {
  getCurrentUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  setCurrentUser: (user: User): void => {
    storage.set(STORAGE_KEYS.USER, user);
  },

  clearCurrentUser: (): void => {
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  setAuthToken: (token: string): void => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getAuthToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },
};

// User Management - YENİ EKLENEN
export const usersStorage = {
  getAll: (): User[] => {
    return storage.get<User[]>(STORAGE_KEYS.USERS) || [];
  },

  getById: (id: string): User | null => {
    const users = usersStorage.getAll();
    return users.find(user => user.id === id) || null;
  },

  getByUsername: (username: string): User | null => {
    const users = usersStorage.getAll();
    return users.find(user => user.username === username) || null;
  },

  getByEmail: (email: string): User | null => {
    const users = usersStorage.getAll();
    return users.find(user => user.email === email) || null;
  },

  getByRole: (role: User['role']): User[] => {
    const users = usersStorage.getAll();
    return users.filter(user => user.role === role);
  },

  getActiveUsers: (): User[] => {
    const users = usersStorage.getAll();
    return users.filter(user => user.isActive);
  },

  create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): User => {
    const users = usersStorage.getAll();
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const users = usersStorage.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = usersStorage.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    storage.set(STORAGE_KEYS.USERS, filteredUsers);
    return true;
  },

  updateLastLogin: (id: string): void => {
    const users = usersStorage.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      users[index].lastLogin = new Date().toISOString();
      users[index].updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.USERS, users);
    }
  },

  toggleActive: (id: string): boolean => {
    const users = usersStorage.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      users[index].isActive = !users[index].isActive;
      users[index].updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.USERS, users);
      return true;
    }
    
    return false;
  }
};

// Activity Log Management - YENİ EKLENEN
export const activityLogStorage = {
  getAll: (): ActivityLog[] => {
    return storage.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS) || [];
  },

  getById: (id: string): ActivityLog | null => {
    const logs = activityLogStorage.getAll();
    return logs.find(log => log.id === id) || null;
  },

  getByUserId: (userId: string): ActivityLog[] => {
    const logs = activityLogStorage.getAll();
    return logs.filter(log => log.userId === userId);
  },

  getByEntityType: (entityType: ActivityLog['entityType']): ActivityLog[] => {
    const logs = activityLogStorage.getAll();
    return logs.filter(log => log.entityType === entityType);
  },

  getBySeverity: (severity: ActivityLog['severity']): ActivityLog[] => {
    const logs = activityLogStorage.getAll();
    return logs.filter(log => log.severity === severity);
  },

  getByDateRange: (startDate: string, endDate: string): ActivityLog[] => {
    const logs = activityLogStorage.getAll();
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return logDate >= start && logDate <= end;
    });
  },

  getRecent: (limit: number = 100): ActivityLog[] => {
    const logs = activityLogStorage.getAll();
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  create: (logData: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog => {
    const logs = activityLogStorage.getAll();
    const newLog: ActivityLog = {
      ...logData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    
    logs.push(newLog);
    
    // Maksimum 1000 log tut, eski olanları sil
    if (logs.length > 1000) {
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      logs.splice(1000);
    }
    
    storage.set(STORAGE_KEYS.ACTIVITY_LOGS, logs);
    return newLog;
  },

  delete: (id: string): boolean => {
    const logs = activityLogStorage.getAll();
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    storage.set(STORAGE_KEYS.ACTIVITY_LOGS, filteredLogs);
    return true;
  },

  clearOldLogs: (daysToKeep: number = 30): number => {
    const logs = activityLogStorage.getAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
    const deletedCount = logs.length - filteredLogs.length;
    
    storage.set(STORAGE_KEYS.ACTIVITY_LOGS, filteredLogs);
    return deletedCount;
  },

  getStats: () => {
    const logs = activityLogStorage.getAll();
    const totalLogs = logs.length;
    const severityCounts = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const entityTypeCounts = logs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const userCounts = logs.reduce((acc, log) => {
      acc[log.userName] = (acc[log.userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalLogs,
      severityCounts,
      entityTypeCounts,
      userCounts,
      oldestLog: logs.length > 0 ? Math.min(...logs.map(log => new Date(log.timestamp).getTime())) : null,
      newestLog: logs.length > 0 ? Math.max(...logs.map(log => new Date(log.timestamp).getTime())) : null
    };
  }
};

// Customer management
export const customerStorage = {
  getAll: (): Customer[] => {
    return storage.get<Customer[]>(STORAGE_KEYS.CUSTOMERS) || [];
  },

  getById: (id: string): Customer | null => {
    const customers = customerStorage.getAll();
    return customers.find(customer => customer.id === id) || null;
  },

  create: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const customers = customerStorage.getAll();
    const newCustomer: Customer = {
      ...customerData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    customers.push(newCustomer);
    storage.set(STORAGE_KEYS.CUSTOMERS, customers);
    
    // Log the creation
    logger.logCreate('customer', newCustomer.name, newCustomer.id);
    
    return newCustomer;
  },

  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const customers = customerStorage.getAll();
    const index = customers.findIndex(customer => customer.id === id);
    
    if (index === -1) return null;
    
    const oldCustomer = customers[index];
    customers[index] = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.CUSTOMERS, customers);
    
    // Log the update
    logger.logUpdate('customer', customers[index].name, customers[index].id);
    
    return customers[index];
  },

  delete: (id: string): boolean => {
    const customers = customerStorage.getAll();
    const customerToDelete = customers.find(customer => customer.id === id);
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    
    if (filteredCustomers.length === customers.length) return false;
    
    storage.set(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
    
    // Log the deletion
    if (customerToDelete) {
      logger.logDelete('customer', customerToDelete.name, customerToDelete.id);
    }
    
    return true;
  },
};

// Product management
export const productStorage = {
  getAll: (): Product[] => {
    return storage.get<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  },

  getById: (id: string): Product | null => {
    const products = productStorage.getAll();
    return products.find(product => product.id === id) || null;
  },

  create: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const products = productStorage.getAll();
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    products.push(newProduct);
    storage.set(STORAGE_KEYS.PRODUCTS, products);
    
    // Log the creation
    logger.logCreate('product', newProduct.name, newProduct.id);
    
    return newProduct;
  },

  update: (id: string, updates: Partial<Product>): Product | null => {
    const products = productStorage.getAll();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.PRODUCTS, products);
    
    // Log the update
    logger.logUpdate('product', products[index].name, products[index].id);
    
    return products[index];
  },

  delete: (id: string): boolean => {
    const products = productStorage.getAll();
    const productToDelete = products.find(product => product.id === id);
    const filteredProducts = products.filter(product => product.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    storage.set(STORAGE_KEYS.PRODUCTS, filteredProducts);
    
    // Log the deletion
    if (productToDelete) {
      logger.logDelete('product', productToDelete.name, productToDelete.id);
    }
    
    return true;
  },
};

// Product Category management
export const productCategoryStorage = {
  getAll: (): any[] => {
    return storage.get<any[]>(STORAGE_KEYS.PRODUCT_CATEGORIES) || [];
  },

  getById: (id: string): any | null => {
    const categories = productCategoryStorage.getAll();
    return categories.find(category => category.id === id) || null;
  },

  create: (categoryData: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): any => {
    const categories = productCategoryStorage.getAll();
    const newCategory: any = {
      ...categoryData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    storage.set(STORAGE_KEYS.PRODUCT_CATEGORIES, categories);
    
    // Log the creation
    logger.logCreate('product_category', newCategory.name, newCategory.id);
    
    return newCategory;
  },

  update: (id: string, updates: Partial<any>): any | null => {
    const categories = productCategoryStorage.getAll();
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) return null;
    
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.PRODUCT_CATEGORIES, categories);
    
    // Log the update
    logger.logUpdate('product_category', categories[index].name, categories[index].id);
    
    return categories[index];
  },

  delete: (id: string): boolean => {
    const categories = productCategoryStorage.getAll();
    const categoryToDelete = categories.find(category => category.id === id);
    const filteredCategories = categories.filter(category => category.id !== id);
    
    if (filteredCategories.length === categories.length) return false;
    
    storage.set(STORAGE_KEYS.PRODUCT_CATEGORIES, filteredCategories);
    
    // Log the deletion
    if (categoryToDelete) {
      logger.logDelete('product_category', categoryToDelete.name, categoryToDelete.id);
    }
    
    return true;
  },
};

// Project management
export const projectStorage = {
  getAll: (): Project[] => {
    return storage.get<Project[]>(STORAGE_KEYS.PROJECTS) || [];
  },

  getById: (id: string): Project | null => {
    const projects = projectStorage.getAll();
    return projects.find(project => project.id === id) || null;
  },

  getByCustomerId: (customerId: string): Project[] => {
    const projects = projectStorage.getAll();
    return projects.filter(project => project.customerId === customerId);
  },

  create: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const projects = projectStorage.getAll();
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    projects.push(newProject);
    storage.set(STORAGE_KEYS.PROJECTS, projects);
    
    // Log the creation
    logger.logCreate('project', newProject.name, newProject.id);
    
    return newProject;
  },

  update: (id: string, updates: Partial<Project>): Project | null => {
    const projects = projectStorage.getAll();
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.PROJECTS, projects);
    
    // Log the update
    logger.logUpdate('project', projects[index].name, projects[index].id);
    
    return projects[index];
  },

  delete: (id: string): boolean => {
    const projects = projectStorage.getAll();
    const projectToDelete = projects.find(project => project.id === id);
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) return false;
    
    storage.set(STORAGE_KEYS.PROJECTS, filteredProjects);
    
    // Log the deletion
    if (projectToDelete) {
      logger.logDelete('project', projectToDelete.name, projectToDelete.id);
    }
    
    return true;
  },
};

// Transaction management
export const transactionStorage = {
  getAll: (): Transaction[] => {
    return storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  },

  getById: (id: string): Transaction | null => {
    const transactions = transactionStorage.getAll();
    return transactions.find(transaction => transaction.id === id) || null;
  },

  getByProjectId: (projectId: string): Transaction[] => {
    const transactions = transactionStorage.getAll();
    return transactions.filter(transaction => transaction.projectId === projectId);
  },

  create: (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const transactions = transactionStorage.getAll();
    const newTransaction: Transaction = {
      ...transactionData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    transactions.push(newTransaction);
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    // Log the creation
    logger.logCreate('transaction', `${newTransaction.type === 'income' ? 'Gelir' : 'Gider'} - ${newTransaction.description}`, newTransaction.id);
    
    return newTransaction;
  },

  update: (id: string, updates: Partial<Transaction>): Transaction | null => {
    const transactions = transactionStorage.getAll();
    const index = transactions.findIndex(transaction => transaction.id === id);
    
    if (index === -1) return null;
    
    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    // Log the update
    logger.logUpdate('transaction', `${transactions[index].type === 'income' ? 'Gelir' : 'Gider'} - ${transactions[index].description}`, transactions[index].id);
    
    return transactions[index];
  },

  delete: (id: string): boolean => {
    const transactions = transactionStorage.getAll();
    const transactionToDelete = transactions.find(transaction => transaction.id === id);
    const filteredTransactions = transactions.filter(transaction => transaction.id !== id);
    
    if (filteredTransactions.length === transactions.length) return false;
    
    storage.set(STORAGE_KEYS.TRANSACTIONS, filteredTransactions);
    
    // Log the deletion
    if (transactionToDelete) {
      logger.logDelete('transaction', `${transactionToDelete.type === 'income' ? 'Gelir' : 'Gider'} - ${transactionToDelete.description}`, transactionToDelete.id);
    }
    
    return true;
  },
};

// Quote management
export const quoteStorage = {
  getAll: (): Quote[] => {
    return storage.get<Quote[]>(STORAGE_KEYS.QUOTES) || [];
  },

  getById: (id: string): Quote | null => {
    const quotes = quoteStorage.getAll();
    return quotes.find(quote => quote.id === id) || null;
  },

  getByCustomerId: (customerId: string): Quote[] => {
    const quotes = quoteStorage.getAll();
    return quotes.filter(quote => quote.customerId === customerId);
  },

  create: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Quote => {
    const quotes = quoteStorage.getAll();
    const newQuote: Quote = {
      ...quoteData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    quotes.push(newQuote);
    storage.set(STORAGE_KEYS.QUOTES, quotes);
    
    // Log the creation
    logger.logCreate('quote', newQuote.quoteNumber, newQuote.id);
    
    return newQuote;
  },

  update: (id: string, updates: Partial<Quote>): Quote | null => {
    const quotes = quoteStorage.getAll();
    const index = quotes.findIndex(quote => quote.id === id);
    
    if (index === -1) return null;
    
    quotes[index] = {
      ...quotes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.QUOTES, quotes);
    
    // Log the update
    logger.logUpdate('quote', quotes[index].quoteNumber, quotes[index].id);
    
    return quotes[index];
  },

  delete: (id: string): boolean => {
    const quotes = quoteStorage.getAll();
    const quoteToDelete = quotes.find(quote => quote.id === id);
    const filteredQuotes = quotes.filter(quote => quote.id !== id);
    
    if (filteredQuotes.length === quotes.length) return false;
    
    storage.set(STORAGE_KEYS.QUOTES, filteredQuotes);
    
    // Log the deletion
    if (quoteToDelete) {
      logger.logDelete('quote', quoteToDelete.quoteNumber, quoteToDelete.id);
    }
    
    return true;
  },

  generateQuoteNumber: (projectName?: string): string => {
    const quotes = quoteStorage.getAll();
    const currentYear = new Date().getFullYear();
    const quoteCount = quotes.filter(quote => 
      quote.createdAt.startsWith(currentYear.toString())
    ).length + 1;
    
    // Eğer proje adı varsa, proje adı + sayı formatında oluştur
    if (projectName && projectName.trim()) {
      // Proje adından özel karakterleri temizle ve büyük harfe çevir
      const cleanProjectName = projectName.trim()
        .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '') // Sadece harf ve rakamları tut
        .toUpperCase();
      
      if (cleanProjectName) {
        return `${cleanProjectName}#${quoteCount.toString().padStart(3, '0')}`;
      }
    }
    
    // Proje adı yoksa eski formatı kullan
    return `Q-${currentYear}-${quoteCount.toString().padStart(4, '0')}`;
  },
};

// Subcontractor management - YENİ EKLENEN
export const subcontractorStorage = {
  getAll: (): Subcontractor[] => {
    return storage.get<Subcontractor[]>(STORAGE_KEYS.SUBCONTRACTORS) || [];
  },

  getById: (id: string): Subcontractor | null => {
    const subcontractors = subcontractorStorage.getAll();
    return subcontractors.find(subcontractor => subcontractor.id === id) || null;
  },

  getByStatus: (status: Subcontractor['status']): Subcontractor[] => {
    const subcontractors = subcontractorStorage.getAll();
    return subcontractors.filter(subcontractor => subcontractor.status === status);
  },

  getBySpecialization: (specialization: string): Subcontractor[] => {
    const subcontractors = subcontractorStorage.getAll();
    return subcontractors.filter(subcontractor => 
      subcontractor.specialization.includes(specialization)
    );
  },

  create: (subcontractorData: Omit<Subcontractor, 'id' | 'createdAt' | 'updatedAt' | 'totalEarnings' | 'totalProjects'>): Subcontractor => {
    const subcontractors = subcontractorStorage.getAll();
    const newSubcontractor: Subcontractor = {
      ...subcontractorData,
      id: uuidv4(),
      isSupplier: subcontractorData.isSupplier || false, // Varsayılan olarak false
      totalEarnings: 0,
      totalProjects: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    subcontractors.push(newSubcontractor);
    storage.set(STORAGE_KEYS.SUBCONTRACTORS, subcontractors);
    return newSubcontractor;
  },

  update: (id: string, updates: Partial<Subcontractor>): Subcontractor | null => {
    const subcontractors = subcontractorStorage.getAll();
    const index = subcontractors.findIndex(subcontractor => subcontractor.id === id);
    
    if (index === -1) return null;
    
    subcontractors[index] = {
      ...subcontractors[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.SUBCONTRACTORS, subcontractors);
    return subcontractors[index];
  },

  delete: (id: string): boolean => {
    const subcontractors = subcontractorStorage.getAll();
    const filteredSubcontractors = subcontractors.filter(subcontractor => subcontractor.id !== id);
    
    if (filteredSubcontractors.length === subcontractors.length) return false;
    
    storage.set(STORAGE_KEYS.SUBCONTRACTORS, filteredSubcontractors);
    return true;
  },

  updateStats: (id: string, earnings: number, projects: number): void => {
    const subcontractors = subcontractorStorage.getAll();
    const index = subcontractors.findIndex(subcontractor => subcontractor.id === id);
    
    if (index !== -1) {
      subcontractors[index].totalEarnings = earnings;
      subcontractors[index].totalProjects = projects;
      subcontractors[index].updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.SUBCONTRACTORS, subcontractors);
    }
  },
};

// Work Contract management - YENİ EKLENEN
export const workContractStorage = {
  getAll: (): WorkContract[] => {
    return storage.get<WorkContract[]>(STORAGE_KEYS.WORK_CONTRACTS) || [];
  },

  getById: (id: string): WorkContract | null => {
    const contracts = workContractStorage.getAll();
    return contracts.find(contract => contract.id === id) || null;
  },

  getByProjectId: (projectId: string): WorkContract[] => {
    const contracts = workContractStorage.getAll();
    return contracts.filter(contract => contract.projectId === projectId);
  },

  getBySubcontractorId: (subcontractorId: string): WorkContract[] => {
    const contracts = workContractStorage.getAll();
    return contracts.filter(contract => contract.subcontractorId === subcontractorId);
  },

  getByStatus: (status: WorkContract['status']): WorkContract[] => {
    const contracts = workContractStorage.getAll();
    return contracts.filter(contract => contract.status === status);
  },

  create: (contractData: Omit<WorkContract, 'id' | 'createdAt' | 'updatedAt' | 'profitMargin' | 'paidAmount' | 'remainingAmount'>): WorkContract => {
    const contracts = workContractStorage.getAll();
    const profitMargin = contractData.customerPrice - contractData.subcontractorPrice;
    const newContract: WorkContract = {
      ...contractData,
      id: uuidv4(),
      profitMargin,
      paidAmount: 0,
      remainingAmount: contractData.subcontractorPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    contracts.push(newContract);
    storage.set(STORAGE_KEYS.WORK_CONTRACTS, contracts);
    return newContract;
  },

  update: (id: string, updates: Partial<WorkContract>): WorkContract | null => {
    const contracts = workContractStorage.getAll();
    const index = contracts.findIndex(contract => contract.id === id);
    
    if (index === -1) return null;
    
    // Eğer fiyatlar güncelleniyorsa, kar marjını yeniden hesapla
    if (updates.customerPrice !== undefined || updates.subcontractorPrice !== undefined) {
      const customerPrice = updates.customerPrice ?? contracts[index].customerPrice;
      const subcontractorPrice = updates.subcontractorPrice ?? contracts[index].subcontractorPrice;
      updates.profitMargin = customerPrice - subcontractorPrice;
    }
    
    contracts[index] = {
      ...contracts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.WORK_CONTRACTS, contracts);
    return contracts[index];
  },

  delete: (id: string): boolean => {
    const contracts = workContractStorage.getAll();
    const filteredContracts = contracts.filter(contract => contract.id !== id);
    
    if (filteredContracts.length === contracts.length) return false;
    
    storage.set(STORAGE_KEYS.WORK_CONTRACTS, filteredContracts);
    return true;
  },

  generateContractNumber: (): string => {
    const contracts = workContractStorage.getAll();
    const currentYear = new Date().getFullYear();
    const contractCount = contracts.filter(contract => 
      contract.createdAt.startsWith(currentYear.toString())
    ).length + 1;
    
    return `WC-${currentYear}-${contractCount.toString().padStart(4, '0')}`;
  },
};

// Helper function to get subcontractor name
const getSubcontractorName = (subcontractorId: string): string => {
  const subcontractors = subcontractorStorage.getAll();
  const subcontractor = subcontractors.find(s => s.id === subcontractorId);
  return subcontractor ? subcontractor.name : 'Unknown Subcontractor';
};

// Subcontractor Payment management - YENİ EKLENEN
export const subcontractorPaymentStorage = {
  getAll: (): SubcontractorPayment[] => {
    return storage.get<SubcontractorPayment[]>(STORAGE_KEYS.SUBCONTRACTOR_PAYMENTS) || [];
  },

  getById: (id: string): SubcontractorPayment | null => {
    const payments = subcontractorPaymentStorage.getAll();
    return payments.find(payment => payment.id === id) || null;
  },

  getByContractId: (contractId: string): SubcontractorPayment[] => {
    const payments = subcontractorPaymentStorage.getAll();
    return payments.filter(payment => payment.contractId === contractId);
  },

  getBySubcontractorId: (subcontractorId: string): SubcontractorPayment[] => {
    const contracts = workContractStorage.getAll();
    const contractIds = contracts
      .filter(contract => contract.subcontractorId === subcontractorId)
      .map(contract => contract.id);
    
    const payments = subcontractorPaymentStorage.getAll();
    return payments.filter(payment => contractIds.includes(payment.contractId));
  },

  create: (paymentData: Omit<SubcontractorPayment, 'id' | 'createdAt' | 'updatedAt'>): SubcontractorPayment => {
    const payments = subcontractorPaymentStorage.getAll();
    const newPayment: SubcontractorPayment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    payments.push(newPayment);
    storage.set(STORAGE_KEYS.SUBCONTRACTOR_PAYMENTS, payments);
    
    // İlgili sözleşmenin ödeme durumunu güncelle
    const contract = workContractStorage.getById(paymentData.contractId);
    if (contract) {
      const contractPayments = subcontractorPaymentStorage.getByContractId(contract.id);
      const totalPaid = contractPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      workContractStorage.update(contract.id, {
        paidAmount: totalPaid,
        remainingAmount: contract.subcontractorPrice - totalPaid,
      });

      // Create corresponding transaction
      const transaction: Transaction = {
        id: uuidv4(),
        type: 'expense',
        amount: paymentData.amount,
        description: `Subcontractor Payment: ${paymentData.description}`,
        category: 'Subcontractor Payment',
        date: paymentData.paymentDate,
        projectId: contract.projectId,
        paymentMethod: paymentData.paymentMethod,
        receipt: paymentData.receipt,
        receiptFileName: paymentData.receiptFileName,
        notes: `Subcontractor: ${getSubcontractorName(contract.subcontractorId)} | Contract: ${contract.contractNumber}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const transactions = transactionStorage.getAll();
      transactions.push(transaction);
      storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
    
    return newPayment;
  },

  update: (id: string, updates: Partial<SubcontractorPayment>): SubcontractorPayment | null => {
    const payments = subcontractorPaymentStorage.getAll();
    const index = payments.findIndex(payment => payment.id === id);
    
    if (index === -1) return null;
    
    payments[index] = {
      ...payments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.SUBCONTRACTOR_PAYMENTS, payments);
    return payments[index];
  },

  delete: (id: string): boolean => {
    const payments = subcontractorPaymentStorage.getAll();
    const filteredPayments = payments.filter(payment => payment.id !== id);
    
    if (filteredPayments.length === payments.length) return false;
    
    storage.set(STORAGE_KEYS.SUBCONTRACTOR_PAYMENTS, filteredPayments);
    return true;
  },
};

// Media File Management - YENİ EKLENEN
export const mediaFileStorage = {
  getAll: (): MediaFile[] => {
    return storage.get<MediaFile[]>(STORAGE_KEYS.MEDIA_FILES) || [];
  },

  getById: (id: string): MediaFile | null => {
    const files = mediaFileStorage.getAll();
    return files.find(file => file.id === id) || null;
  },

  create: (fileData: Omit<MediaFile, 'id' | 'createdAt' | 'updatedAt'>): MediaFile => {
    const files = mediaFileStorage.getAll();
    const newFile: MediaFile = {
      ...fileData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    files.push(newFile);
    storage.set(STORAGE_KEYS.MEDIA_FILES, files);
    return newFile;
  },

  update: (id: string, updates: Partial<MediaFile>): MediaFile | null => {
    const files = mediaFileStorage.getAll();
    const index = files.findIndex(file => file.id === id);
    
    if (index === -1) return null;
    
    files[index] = {
      ...files[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.MEDIA_FILES, files);
    return files[index];
  },

  delete: (id: string): boolean => {
    const files = mediaFileStorage.getAll();
    const filteredFiles = files.filter(file => file.id !== id);
    
    if (filteredFiles.length === files.length) return false;
    
    storage.set(STORAGE_KEYS.MEDIA_FILES, filteredFiles);
    return true;
  },

  getByFolder: (folderId: string): MediaFile[] => {
    const files = mediaFileStorage.getAll();
    return files.filter(file => file.folderId === folderId);
  },

  getByProject: (projectId: string): MediaFile[] => {
    const files = mediaFileStorage.getAll();
    return files.filter(file => file.projectId === projectId);
  },

  getByCustomer: (customerId: string): MediaFile[] => {
    const files = mediaFileStorage.getAll();
    return files.filter(file => file.customerId === customerId);
  },

  getByType: (fileType: MediaFile['fileType']): MediaFile[] => {
    const files = mediaFileStorage.getAll();
    return files.filter(file => file.fileType === fileType);
  },

  search: (query: string): MediaFile[] => {
    const files = mediaFileStorage.getAll();
    const searchLower = query.toLowerCase();
    
    return files.filter(file => 
      file.name.toLowerCase().includes(searchLower) ||
      file.description?.toLowerCase().includes(searchLower) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      file.originalName.toLowerCase().includes(searchLower)
    );
  },

  getFileStats: () => {
    const files = mediaFileStorage.getAll();
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
    const fileTypes = files.reduce((acc, file) => {
      acc[file.fileType] = (acc[file.fileType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalFiles, totalSize, fileTypes };
  }
};

// Media Folder Management - YENİ EKLENEN
export const mediaFolderStorage = {
  getAll: (): MediaFolder[] => {
    return storage.get<MediaFolder[]>(STORAGE_KEYS.MEDIA_FOLDERS) || [];
  },

  getById: (id: string): MediaFolder | null => {
    const folders = mediaFolderStorage.getAll();
    return folders.find(folder => folder.id === id) || null;
  },

  create: (folderData: Omit<MediaFolder, 'id' | 'createdAt' | 'updatedAt' | 'fileCount' | 'totalSize'>): MediaFolder => {
    const folders = mediaFolderStorage.getAll();
    const newFolder: MediaFolder = {
      ...folderData,
      id: uuidv4(),
      fileCount: 0,
      totalSize: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    folders.push(newFolder);
    storage.set(STORAGE_KEYS.MEDIA_FOLDERS, folders);
    return newFolder;
  },

  update: (id: string, updates: Partial<MediaFolder>): MediaFolder | null => {
    const folders = mediaFolderStorage.getAll();
    const index = folders.findIndex(folder => folder.id === id);
    
    if (index === -1) return null;
    
    folders[index] = {
      ...folders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.MEDIA_FOLDERS, folders);
    return folders[index];
  },

  delete: (id: string): boolean => {
    const folders = mediaFolderStorage.getAll();
    const filteredFolders = folders.filter(folder => folder.id !== id);
    
    if (filteredFolders.length === folders.length) return false;
    
    storage.set(STORAGE_KEYS.MEDIA_FOLDERS, filteredFolders);
    return true;
  },

  getByParent: (parentFolderId?: string): MediaFolder[] => {
    const folders = mediaFolderStorage.getAll();
    return folders.filter(folder => folder.parentFolderId === parentFolderId);
  },

  getFolderTree: (): MediaFolder[] => {
    const folders = mediaFolderStorage.getAll();
    const buildTree = (parentId?: string): MediaFolder[] => {
      return folders
        .filter(folder => folder.parentFolderId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id)
        }));
    };
    
    return buildTree();
  },

  updateFolderStats: (folderId: string): void => {
    const files = mediaFileStorage.getByFolder(folderId);
    const fileCount = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
    
    mediaFolderStorage.update(folderId, { fileCount, totalSize });
  }
};

// Media Tag Management - YENİ EKLENEN
export const mediaTagStorage = {
  getAll: (): MediaTag[] => {
    return storage.get<MediaTag[]>(STORAGE_KEYS.MEDIA_TAGS) || [];
  },

  create: (tagData: Omit<MediaTag, 'id' | 'createdAt' | 'usageCount'>): MediaTag => {
    const tags = mediaTagStorage.getAll();
    const newTag: MediaTag = {
      ...tagData,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    tags.push(newTag);
    storage.set(STORAGE_KEYS.MEDIA_TAGS, tags);
    return newTag;
  },

  update: (id: string, updates: Partial<MediaTag>): MediaTag | null => {
    const tags = mediaTagStorage.getAll();
    const index = tags.findIndex(tag => tag.id === id);
    
    if (index === -1) return null;
    
    tags[index] = {
      ...tags[index],
      ...updates,
    };
    
    storage.set(STORAGE_KEYS.MEDIA_TAGS, tags);
    return tags[index];
  },

  delete: (id: string): boolean => {
    const tags = mediaTagStorage.getAll();
    const filteredTags = tags.filter(tag => tag.id !== id);
    
    if (filteredTags.length === tags.length) return false;
    
    storage.set(STORAGE_KEYS.MEDIA_TAGS, filteredTags);
    return true;
  },

  updateUsageCount: (tagId: string, increment: boolean = true): void => {
    const tag = mediaTagStorage.getAll().find(t => t.id === tagId);
    if (tag) {
      const newCount = increment ? tag.usageCount + 1 : Math.max(0, tag.usageCount - 1);
      mediaTagStorage.update(tagId, { usageCount: newCount });
    }
  }
};

// Media Category Management - YENİ EKLENEN
export const mediaCategoryStorage = {
  getAll: (): MediaCategory[] => {
    return storage.get<MediaCategory[]>(STORAGE_KEYS.MEDIA_CATEGORIES) || [];
  },

  create: (categoryData: Omit<MediaCategory, 'id' | 'createdAt' | 'fileCount'>): MediaCategory => {
    const categories = mediaCategoryStorage.getAll();
    const newCategory: MediaCategory = {
      ...categoryData,
      id: uuidv4(),
      fileCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    storage.set(STORAGE_KEYS.MEDIA_CATEGORIES, categories);
    return newCategory;
  },

  update: (id: string, updates: Partial<MediaCategory>): MediaCategory | null => {
    const categories = mediaCategoryStorage.getAll();
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) return null;
    
    categories[index] = {
      ...categories[index],
      ...updates,
    };
    
    storage.set(STORAGE_KEYS.MEDIA_CATEGORIES, categories);
    return categories[index];
  },

  delete: (id: string): boolean => {
    const categories = mediaCategoryStorage.getAll();
    const filteredCategories = categories.filter(category => category.id !== id);
    
    if (filteredCategories.length === categories.length) return false;
    
    storage.set(STORAGE_KEYS.MEDIA_CATEGORIES, filteredCategories);
    return true;
  },

  updateFileCount: (categoryId: string, increment: boolean = true): void => {
    const category = mediaCategoryStorage.getAll().find(c => c.id === categoryId);
    if (category) {
      const newCount = increment ? category.fileCount + 1 : Math.max(0, category.fileCount - 1);
      mediaCategoryStorage.update(categoryId, { fileCount: newCount });
    }
  }
};

// Transaction Category Management - YENİ EKLENEN
export const transactionCategoryStorage = {
  getAll: (): TransactionCategory[] => {
    return storage.get<TransactionCategory[]>(STORAGE_KEYS.TRANSACTION_CATEGORIES) || [];
  },

  getById: (id: string): TransactionCategory | null => {
    const categories = transactionCategoryStorage.getAll();
    return categories.find(category => category.id === id) || null;
  },

  getByType: (type: 'income' | 'expense'): TransactionCategory[] => {
    const categories = transactionCategoryStorage.getAll();
    return categories.filter(category => category.type === type && category.isActive);
  },

  getActive: (): TransactionCategory[] => {
    const categories = transactionCategoryStorage.getAll();
    return categories.filter(category => category.isActive);
  },

  create: (categoryData: Omit<TransactionCategory, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): TransactionCategory => {
    const categories = transactionCategoryStorage.getAll();
    const newCategory: TransactionCategory = {
      ...categoryData,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    storage.set(STORAGE_KEYS.TRANSACTION_CATEGORIES, categories);
    return newCategory;
  },

  update: (id: string, updates: Partial<TransactionCategory>): TransactionCategory | null => {
    const categories = transactionCategoryStorage.getAll();
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) return null;
    
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.TRANSACTION_CATEGORIES, categories);
    return categories[index];
  },

  delete: (id: string): boolean => {
    const categories = transactionCategoryStorage.getAll();
    const category = categories.find(c => c.id === id);
    
    // Varsayılan kategorileri silme
    if (category?.isDefault) {
      return false;
    }
    
    const filteredCategories = categories.filter(category => category.id !== id);
    
    if (filteredCategories.length === categories.length) return false;
    
    storage.set(STORAGE_KEYS.TRANSACTION_CATEGORIES, filteredCategories);
    return true;
  },

  incrementUsage: (id: string): void => {
    const categories = transactionCategoryStorage.getAll();
    const index = categories.findIndex(category => category.id === id);
    
    if (index !== -1) {
      categories[index].usageCount += 1;
      categories[index].updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.TRANSACTION_CATEGORIES, categories);
    }
  },

  toggleActive: (id: string): boolean => {
    const categories = transactionCategoryStorage.getAll();
    const index = categories.findIndex(category => category.id === id);
    
    if (index !== -1) {
      categories[index].isActive = !categories[index].isActive;
      categories[index].updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.TRANSACTION_CATEGORIES, categories);
      return true;
    }
    
    return false;
  },

  getMostUsed: (limit: number = 10): TransactionCategory[] => {
    const categories = transactionCategoryStorage.getAll();
    return categories
      .filter(category => category.isActive)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
};

