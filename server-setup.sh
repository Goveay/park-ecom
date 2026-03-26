#!/bin/bash
set -e

# ============================================
# Park Picasso - Sunucu Ilk Kurulum Scripti
# Bu script sadece ILK KURULUMDA calistirilir
# ============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Park Picasso Sunucu Kurulumu Basliyor...${NC}"

# 1. Coolify'i durdur ve kaldir
echo -e "${YELLOW}📦 Coolify durduruluyor...${NC}"
if command -v coolify &> /dev/null || [ -d /data/coolify ]; then
    docker stop $(docker ps -q) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    docker network prune -f 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
    docker system prune -af 2>/dev/null || true
    rm -rf /data/coolify 2>/dev/null || true
    echo -e "${GREEN}✅ Coolify temizlendi${NC}"
else
    echo -e "${GREEN}✅ Coolify bulunamadi, temiz sunucu${NC}"
fi

# 2. Sistem guncelleme
echo -e "${YELLOW}📦 Sistem guncelleniyor...${NC}"
apt-get update && apt-get upgrade -y

# 3. Gerekli paketleri kur
echo -e "${YELLOW}📦 Gerekli paketler kuruluyor...${NC}"
apt-get install -y \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    wget \
    ufw

# 4. Docker'in kurulu oldugundan emin ol
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Docker kuruluyor...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker kuruldu${NC}"
else
    echo -e "${GREEN}✅ Docker zaten kurulu${NC}"
fi

# 5. Firewall ayarlari
echo -e "${YELLOW}🔒 Firewall ayarlari yapiliyor...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo -e "${GREEN}✅ Firewall aktif${NC}"

# 6. Nginx baslangic config (SSL oncesi - sadece HTTP)
echo -e "${YELLOW}⚙️ Nginx HTTP config ayarlaniyor...${NC}"
cat > /etc/nginx/sites-available/parkpicasso << 'NGINX_CONF'
server {
    listen 80;
    server_name www.parkpicasso.com parkpicasso.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.parkpicasso.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONF

# Symlink olustur ve default'u kaldir
ln -sf /etc/nginx/sites-available/parkpicasso /etc/nginx/sites-enabled/parkpicasso
rm -f /etc/nginx/sites-enabled/default

# Nginx'i test et ve yeniden baslat
nginx -t && systemctl restart nginx
echo -e "${GREEN}✅ Nginx HTTP config aktif${NC}"

# 7. SSL sertifikasi al
echo -e "${YELLOW}🔐 SSL sertifikasi aliniyor...${NC}"
mkdir -p /var/www/certbot
certbot --nginx \
    -d parkpicasso.com \
    -d www.parkpicasso.com \
    -d api.parkpicasso.com \
    --non-interactive \
    --agree-tos \
    --email admin@parkpicasso.com \
    --redirect
echo -e "${GREEN}✅ SSL sertifikasi alindi${NC}"

# 8. SSL otomatik yenileme
echo -e "${YELLOW}🔄 SSL otomatik yenileme ayarlaniyor...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
echo -e "${GREEN}✅ SSL otomatik yenileme aktif${NC}"

# 9. Proje klasorunu olustur
echo -e "${YELLOW}📂 Proje klasoru hazirlaniyor...${NC}"
mkdir -p /opt/parkpicasso
cd /opt/parkpicasso

# Git repo klonla (eger henuz klonlanmadiysa)
if [ ! -d .git ]; then
    echo -e "${YELLOW}Lutfen git repo URL'sini girin:${NC}"
    read -p "Git repo URL: " GIT_REPO_URL
    git clone "$GIT_REPO_URL" .
else
    echo -e "${GREEN}✅ Git repo zaten mevcut${NC}"
    git pull origin main
fi

# 10. Nginx'i SSL sonrasi guncelle (certbot zaten yapmis olmali)
echo -e "${YELLOW}⚙️ Nginx production config guncelleniyor...${NC}"
# Certbot otomatik olarak SSL satırlarını ekler, 
# ama security header'ları manuel ekle
cat >> /etc/nginx/sites-available/parkpicasso << 'EXTRA'

# Security headers (mevcut server bloklarina eklenmeli)
# add_header X-Frame-Options "SAMEORIGIN" always;
# add_header X-Content-Type-Options "nosniff" always;
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
EXTRA

nginx -t && systemctl reload nginx

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Sunucu kurulumu tamamlandi!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Siradaki adimlar:"
echo -e "  1. ${YELLOW}cd /opt/parkpicasso${NC}"
echo -e "  2. ${YELLOW}.env.prod dosyasini olustur${NC}"
echo -e "  3. ${YELLOW}bash deploy.sh${NC}"
echo ""
