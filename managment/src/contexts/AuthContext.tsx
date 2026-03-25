import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userStorage, usersStorage } from '../utils/storage';
import { logger } from '../utils/logger';
import { verifyPassword } from '../utils/password';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = userStorage.getCurrentUser();
      const token = userStorage.getAuthToken();
      
      if (currentUser && token) {
        setUser(currentUser);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log(`🔐 Giriş denemesi: ${username}`);
    
    // Check if user exists in users storage
    const existingUser = usersStorage.getByUsername(username);
    console.log('👤 Kullanıcı bulundu mu?', !!existingUser);
    
    if (existingUser) {
      console.log('👤 Kullanıcı detayları:', {
        username: existingUser.username,
        isActive: existingUser.isActive,
        password: existingUser.password,
        role: existingUser.role
      });
    }
    
    // Validate user exists, is active, and password is correct
    if (existingUser && existingUser.isActive && verifyPassword(password, existingUser.password)) {
      console.log('✅ Giriş başarılı!');
      
      // Update last login
      usersStorage.updateLastLogin(existingUser.id);
      
      // Set user and token
      userStorage.setCurrentUser(existingUser);
      userStorage.setAuthToken('dummy-token-' + Date.now());
      
      setUser(existingUser);
      
      // Log the login
      logger.logLogin();
      
      return true;
    }
    
    console.log('❌ Giriş başarısız!');
    console.log('❌ Kullanıcı var mı?', !!existingUser);
    console.log('❌ Kullanıcı aktif mi?', existingUser?.isActive);
    console.log('❌ Şifre doğru mu?', existingUser ? verifyPassword(password, existingUser.password) : false);
    
    // Log failed login attempt
    logger.logError(`Başarısız giriş denemesi: ${username}`, 'Authentication');
    
    return false;
  };

  const logout = () => {
    // Log the logout before clearing user
    logger.logLogout();
    
    userStorage.clearCurrentUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
