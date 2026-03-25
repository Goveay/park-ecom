# 🚀 Plesk Panel Deployment Rehberi - Management Sistemi

## 📋 Bilgileriniz
- **Domain**: panel.parkpicasso.com
- **IP**: 45.59.70.146
- **Plesk Panel**: https://45.59.70.146:8443
- **FTP/SSH**: parkpicasso_admin / njiSAN542

## 🎯 Adım 1: Plesk Panelde Subdomain Oluşturma

### 1.1 Plesk Panel'e Giriş
1. https://45.59.70.146:8443 adresine gidin
2. **Kullanıcı**: root
3. **Şifre**: njiSAN542

### 1.2 Subdomain Oluşturma
1. **"Websites & Domains"** sekmesine tıklayın
2. **"Add Subdomain"** butonuna tıklayın
3. Ayarlar:
   - **Subdomain name**: `panel`
   - **Domain**: `parkpicasso.com`
   - **Document root**: `/var/www/vhosts/parkpicasso.com/panel.parkpicasso.com`
   - **PHP version**: 8.1 veya üzeri
   - **Hosting type**: Website hosting

### 1.3 PHP Ayarları
1. Subdomain oluşturulduktan sonra **"PHP Settings"** tıklayın
2. Ayarlar:
   - **PHP version**: 8.1+
   - **Memory limit**: 256M
   - **Max execution time**: 300
   - **Upload max filesize**: 64M

## 📁 Adım 2: Dosyaları Yükleme

### 2.1 FTP ile Yükleme (Önerilen)

**FileZilla ile:**
1. FileZilla'yı açın
2. Bağlantı bilgileri:
   - **Host**: 45.59.70.146
   - **Username**: parkpicasso_admin
   - **Password**: njiSAN542
   - **Port**: 21

3. Bağlandıktan sonra:
   - `/var/www/vhosts/parkpicasso.com/panel.parkpicasso.com/` klasörüne gidin
   - `dist/` klasöründeki **TÜM** dosyaları buraya yükleyin

### 2.2 Plesk File Manager ile
1. Plesk panelde subdomain'e tıklayın
2. **"File Manager"** tıklayın
3. `httpdocs/` klasörüne gidin
4. `dist/` klasöründeki dosyaları yükleyin

## 🔒 Adım 3: SSL Sertifikası

### 3.1 Let's Encrypt SSL
1. Subdomain sayfasında **"SSL/TLS Certificates"** tıklayın
2. **"Let's Encrypt"** sekmesine gidin
3. **"Get it free"** butonuna tıklayın
4. Email adresinizi girin
5. **"Get it free"** ile onaylayın

### 3.2 SSL Ayarları
1. **"Hosting Settings"** tıklayın
2. **"SSL/TLS support"** işaretleyin
3. **"Permanent SEO-safe 301 redirect from HTTP to HTTPS"** işaretleyin
4. **"OK"** ile kaydedin

## ⚙️ Adım 4: Nginx Ayarları (Opsiyonel)

### 4.1 Plesk Nginx Ayarları
1. **"Apache & nginx Settings"** tıklayın
2. **"nginx settings"** sekmesine gidin
3. Aşağıdaki kodu ekleyin:

```nginx
# React Router için
location / {
    try_files $uri $uri/ /index.html;
}

# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🧪 Adım 5: Test ve Doğrulama

### 5.1 Site Testi
1. https://panel.parkpicasso.com adresine gidin
2. Login sayfasının yüklendiğini kontrol edin
3. Demo giriş bilgileri:
   - **Username**: admin
   - **Password**: admin123

### 5.2 Fonksiyon Testi
1. Yeni müşteri ekleyin
2. F5 ile sayfayı yenileyin
3. Verilerin korunduğunu kontrol edin

## 🔄 Adım 6: Güncelleme Süreci

### 6.1 Yeni Versiyon Yükleme
1. Local'de yeni build oluşturun:
   ```bash
   npm run build
   ```

2. FTP ile dosyaları yükleyin:
   - Eski dosyaları silin
   - Yeni `dist/` dosyalarını yükleyin

3. Plesk'te cache temizleyin:
   - **"Apache & nginx Settings"** → **"Clear Cache"**

## 🛡️ Adım 7: Güvenlik Ayarları

### 7.1 Plesk Güvenlik
1. **"Security Advisor"** çalıştırın
2. **"Fail2Ban"** aktif edin
3. **"ModSecurity"** aktif edin

### 7.2 IP Kısıtlaması (Opsiyonel)
1. **"Access Restriction"** tıklayın
2. Sadece kendi IP'nizden erişim izni verin

## 📊 Adım 8: Monitoring

### 8.1 Plesk Monitoring
1. **"Statistics"** sekmesinden trafiği izleyin
2. **"Logs"** sekmesinden hata loglarını kontrol edin

### 8.2 Performance
1. **"Performance"** sekmesinden hızı kontrol edin
2. Gerekirse **"Caching"** aktif edin

## 🚨 Sorun Giderme

### Yaygın Sorunlar

**1. 404 Hatası**
- Dosyaların doğru yere yüklendiğini kontrol edin
- Nginx ayarlarını kontrol edin

**2. CSS/JS Yüklenmiyor**
- Dosya yollarını kontrol edin
- Cache'i temizleyin

**3. SSL Hatası**
- Let's Encrypt sertifikasını yenileyin
- DNS ayarlarını kontrol edin

**4. PHP Hatası**
- PHP versiyonunu kontrol edin
- Memory limit'i artırın

## ✅ Tamamlandı Checklist

- [ ] Subdomain oluşturuldu
- [ ] Dosyalar yüklendi
- [ ] SSL sertifikası kuruldu
- [ ] Site erişilebilir
- [ ] Login çalışıyor
- [ ] Veriler korunuyor
- [ ] Mobil uyumlu
- [ ] Hızlı yükleniyor

## 🎉 Sonuç

Artık https://panel.parkpicasso.com adresinden uygulamanıza erişebilirsiniz!

**Demo Giriş:**
- Username: admin
- Password: admin123

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Plesk loglarını kontrol edin
2. Browser console'da hata var mı bakın
3. Network sekmesinde dosya yüklenme durumunu kontrol edin
