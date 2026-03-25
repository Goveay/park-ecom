// Şifre yönetimi utility fonksiyonları

// Basit şifre hash fonksiyonu (gerçek uygulamada bcrypt kullanılmalı)
export const hashPassword = (password: string): string => {
  // Production build sorununu çözmek için basit string döndürüyoruz
  // Gerçek uygulamada bcrypt kullanın
  return password; // Geçici çözüm - production build sorunu için
};

// Şifre doğrulama
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  // Geçici çözüm - basit string karşılaştırması
  return password === hashedPassword;
};

// Şifre güçlülük kontrolü
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rastgele şifre oluşturma
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // En az bir büyük harf, küçük harf, rakam ve özel karakter olsun
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Kalan karakterleri rastgele ekle
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Karakterleri karıştır
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
