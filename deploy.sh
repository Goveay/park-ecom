#!/bin/bash

# Park Picasso Hızlı Güncelleme Scripti

echo "🚀 Güncellemeler kontrol ediliyor..."

# 1. En güncel kodu çek
git pull origin main

# 2. Docker imajlarını yeniden oluştur ve konteynerları başlat
echo "📦 Konteynırlar yeniden oluşturuluyor..."
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Eski/kullanılmayan imajları temizle (opsiyonel, disk alanı için)
echo "🧹 Temizlik yapılıyor..."
docker image prune -f

echo "✅ Güncelleme tamamlandı! Siteniz en güncel haliyle yayında."
