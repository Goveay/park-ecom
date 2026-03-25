#!/bin/bash

# 🚀 Management Sistemi VPS Deployment Script
# Bu script'i VPS'inizde çalıştırın

echo "🚀 Management Sistemi VPS'e yükleniyor..."

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Gerekli dizinleri oluştur
echo -e "${YELLOW}📁 Dizinler oluşturuluyor...${NC}"
sudo mkdir -p /var/www/management
sudo chown -R www-data:www-data /var/www/management
sudo chmod -R 755 /var/www/management

# 2. Nginx konfigürasyonunu kopyala
echo -e "${YELLOW}⚙️ Nginx konfigürasyonu hazırlanıyor...${NC}"
sudo cp nginx-management.conf /etc/nginx/sites-available/management
sudo ln -sf /etc/nginx/sites-available/management /etc/nginx/sites-enabled/

# 3. Nginx konfigürasyonunu test et
echo -e "${YELLOW}🔍 Nginx konfigürasyonu test ediliyor...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx konfigürasyonu geçerli${NC}"
else
    echo -e "${RED}❌ Nginx konfigürasyonu hatalı!${NC}"
    exit 1
fi

# 4. Nginx'i yeniden başlat
echo -e "${YELLOW}🔄 Nginx yeniden başlatılıyor...${NC}"
sudo systemctl reload nginx

# 5. SSL sertifikası için hazırlık
echo -e "${YELLOW}🔒 SSL sertifikası için hazırlık...${NC}"
echo "Domain'inizi nginx-management.conf dosyasında güncelleyin!"
echo "Sonra şu komutu çalıştırın:"
echo -e "${GREEN}sudo certbot --nginx -d management.yourdomain.com${NC}"

# 6. Firewall ayarları
echo -e "${YELLOW}🛡️ Firewall ayarları...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

# 7. Dosya izinleri
echo -e "${YELLOW}📝 Dosya izinleri ayarlanıyor...${NC}"
sudo chown -R www-data:www-data /var/www/management
sudo chmod -R 755 /var/www/management

echo -e "${GREEN}🎉 Deployment hazırlığı tamamlandı!${NC}"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. dist/ klasöründeki dosyaları /var/www/management/ klasörüne yükleyin"
echo "2. nginx-management.conf dosyasında domain'inizi güncelleyin"
echo "3. SSL sertifikası oluşturun: sudo certbot --nginx -d management.yourdomain.com"
echo "4. https://management.yourdomain.com adresinden test edin"
echo ""
echo -e "${YELLOW}💡 İpucu: Dosyaları yüklemek için SCP kullanın:${NC}"
echo "scp -r dist/* root@your-vps-ip:/var/www/management/"
