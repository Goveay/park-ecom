# 🚀 VPS Deployment Rehberi - Management Sistemi

## 📋 Gereksinimler
- VPS sunucunuz (Ubuntu/CentOS)
- Nginx kurulu
- SSL sertifikası (Let's Encrypt)
- Domain'iniz ve subdomain hazırlığı

## 🎯 Subdomain Önerisi
- `management.yourdomain.com` 
- `admin.yourdomain.com`
- `panel.yourdomain.com`

## 📁 1. Dosyaları VPS'e Yükleme

### Yöntem 1: SCP ile (Önerilen)
```bash
# Local bilgisayarınızdan çalıştırın
scp -r dist/* root@your-vps-ip:/var/www/management/
```

### Yöntem 2: Git ile
```bash
# VPS'te
cd /var/www/
git clone your-repo-url management
cd management
npm install
npm run build
```

### Yöntem 3: FTP/SFTP
- `dist/` klasöründeki tüm dosyaları VPS'inize yükleyin
- Hedef: `/var/www/management/`

## 🔧 2. Nginx Konfigürasyonu

### Nginx Site Konfigürasyonu
```nginx
server {
    listen 80;
    server_name management.yourdomain.com;
    root /var/www/management;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security - deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

## 🔒 3. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası oluştur
sudo certbot --nginx -d management.yourdomain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

## 🛡️ 4. Güvenlik Ayarları

### Firewall (UFW)
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### Nginx Güvenlik
```bash
# Nginx konfigürasyonunu test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl reload nginx
```

## 📊 5. Monitoring ve Loglar

### Nginx Logları
```bash
# Access logları
tail -f /var/log/nginx/access.log

# Error logları
tail -f /var/log/nginx/error.log
```

### Sistem Monitoring
```bash
# Disk kullanımı
df -h

# Memory kullanımı
free -h

# CPU kullanımı
htop
```

## 🔄 6. Güncelleme Süreci

### Yeni versiyon yükleme
```bash
# 1. Yeni build oluştur (local)
npm run build

# 2. VPS'e yükle
scp -r dist/* root@your-vps-ip:/var/www/management/

# 3. Nginx'i yeniden başlat
sudo systemctl reload nginx
```

## 🚨 7. Sorun Giderme

### Yaygın Sorunlar
1. **404 Hatası**: `try_files` direktifi kontrol edin
2. **CSS/JS Yüklenmiyor**: Dosya yollarını kontrol edin
3. **SSL Hatası**: Certbot yenileme yapın
4. **Permission Hatası**: Dosya izinlerini kontrol edin

### Log Kontrolü
```bash
# Nginx error log
sudo tail -f /var/log/nginx/error.log

# System log
sudo journalctl -u nginx -f
```

## 📱 8. Mobil Erişim

Uygulama responsive olduğu için mobil cihazlardan da erişilebilir:
- `https://management.yourdomain.com`
- PWA özellikleri mevcut

## 🔐 9. Ek Güvenlik (Opsiyonel)

### IP Kısıtlaması
```nginx
# Sadece belirli IP'lerden erişim
location / {
    allow 192.168.1.0/24;  # Kendi IP aralığınız
    allow YOUR_IP_ADDRESS;  # Kendi IP'niz
    deny all;
    try_files $uri $uri/ /index.html;
}
```

### Basic Auth (Opsiyonel)
```bash
# Kullanıcı oluştur
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Nginx'e ekle
auth_basic "Restricted Access";
auth_basic_user_file /etc/nginx/.htpasswd;
```

## ✅ 10. Test Checklist

- [ ] Subdomain erişilebilir
- [ ] SSL sertifikası çalışıyor
- [ ] Uygulama yükleniyor
- [ ] Login sayfası açılıyor
- [ ] Veriler localStorage'da saklanıyor
- [ ] Mobil uyumlu
- [ ] Hızlı yükleniyor

## 🎉 Tamamlandı!

Artık `https://management.yourdomain.com` adresinden uygulamanıza erişebilirsiniz!
