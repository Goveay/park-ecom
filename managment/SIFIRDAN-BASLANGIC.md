# 🚀 Sıfırdan Başlangıç Kılavuzu

## 📋 Sistem Durumu
Bu sistem artık **tamamen temizlenmiş** ve sıfırdan başlamaya hazır durumda. Tüm demo veriler kaldırılmıştır.

## 🔐 Giriş Bilgileri
- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

## 🎯 Başlangıç Adımları

### 1. İlk Giriş
1. Sisteme admin kullanıcısı ile giriş yapın
2. Dashboard'da boş bir sistem göreceksiniz
3. Kendi verilerinizi eklemeye başlayabilirsiniz

### 2. Temel Kategoriler
Sistem şu temel kategorilerle gelir:

**Gelir Kategorileri:**
- 💰 Proje Geliri
- 💼 Hizmet Geliri  
- 📈 Diğer Gelir

**Gider Kategorileri:**
- 🧱 Malzeme
- 👷 İşçilik
- 🔨 Ekipman
- 🚗 Ulaşım
- 🏢 Ofis Giderleri
- 📉 Diğer Giderler

### 3. Veri Ekleme Sırası
Önerilen veri ekleme sırası:

1. **Müşteriler** → Müşteri bilgilerini ekleyin
2. **Ürünler** → Ürün/hizmet kataloğunuzu oluşturun
3. **Projeler** → Müşteri ve ürünleri kullanarak projeler oluşturun
4. **İşlemler** → Gelir/gider işlemlerini kaydedin
5. **Teklifler** → Müşterilere teklifler hazırlayın

### 4. Kategori Yönetimi
- **Transactions** sayfasında "Kategori Yönetimi" butonuna tıklayın
- Yeni kategoriler ekleyebilir, mevcut kategorileri düzenleyebilirsiniz
- Kategoriler renk ve ikon ile özelleştirilebilir

### 5. Kullanıcı Yönetimi
- **Users** sayfasından yeni kullanıcılar ekleyebilirsiniz
- Şifre belirleme ve değiştirme özellikleri mevcuttur
- Rol bazlı yetkilendirme sistemi

## 🛠️ Özellikler

### ✅ Mevcut Özellikler
- 📊 Dashboard ve raporlama
- 👥 Müşteri yönetimi
- 📦 Ürün/hizmet kataloğu
- 🏗️ Proje yönetimi
- 💰 İşlem takibi (gelir/gider)
- 📋 Teklif yönetimi
- 👷 Alt yüklenici yönetimi
- 📄 İş sözleşmeleri
- 💳 Ödeme takibi
- 📁 Medya yönetimi
- 📝 Aktivite logları
- 🔐 Kullanıcı yönetimi ve yetkilendirme

### 🎨 Kategori Sistemi
- Özelleştirilebilir kategoriler
- Renk ve ikon desteği
- Kullanım istatistikleri
- Gelir/gider ayrımı

### 📱 Responsive Tasarım
- Mobil uyumlu arayüz
- Tüm cihazlarda çalışır

## 🔄 Veri Sıfırlama
Eğer sistemi tekrar sıfırlamak isterseniz:

```javascript
// Browser console'da çalıştırın
import { clearAllData } from './src/utils/resetData';
clearAllData();
```

## 📞 Destek
Sistem kullanıma hazır! Kendi verilerinizi ekleyerek işletmenizi yönetmeye başlayabilirsiniz.

---
**Not:** Bu sistem tamamen yerel olarak çalışır ve verileriniz tarayıcınızda saklanır.
