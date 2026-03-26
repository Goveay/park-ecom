#!/bin/bash
set -e

# Park Picasso Production Deploy Script
echo "🚀 Park Picasso Deploy Basliyor..."

# Renklendirme
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# .env.prod dosyasi kontrolu
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ .env.prod dosyasi bulunamadi!${NC}"
    echo "    .env.prod.example dosyasini kopyalayip duzenleyin:"
    echo "    cp .env.prod.example .env.prod"
    exit 1
fi

# 1. En guncel kodu cek
echo -e "${YELLOW}📥 Git pull yapiliyor...${NC}"
git pull origin main

# 2. Docker imajlarini yeniden olustur ve konteynarlari baslat
echo -e "${YELLOW}📦 Docker konteynirlari olusturuluyor...${NC}"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

# 3. Eski/kullanilmayan imajlari temizle
echo -e "${YELLOW}🧹 Temizlik yapiliyor...${NC}"
docker image prune -f

# 4. Durum kontrolu
echo -e "${YELLOW}⏳ Servisler baslatiliyor, 30 saniye bekleniyor...${NC}"
sleep 30

echo -e "${YELLOW}📊 Konteyner durumlari:${NC}"
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

# 5. Health check
echo -e "${YELLOW}🏥 Health check yapiliyor...${NC}"
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Vendure Server: CALISIYOR${NC}"
else
    echo -e "${RED}❌ Vendure Server: YANIT YOK${NC}"
fi

if curl -sf http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Storefront: CALISIYOR${NC}"
else
    echo -e "${RED}❌ Storefront: YANIT YOK${NC}"
fi

echo -e "${GREEN}✅ Deploy tamamlandi!${NC}"
