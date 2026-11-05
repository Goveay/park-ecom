export const COMPANY = {
    brand: 'Park Picasso',
    legalName: 'Park Picasso',
    address: 'Demirel Sokak No: 27 C, Güller Pınarı Mahallesi, Alanya / Antalya, Türkiye',
    phone: '+90 553 886 55 98',
    email: 'info@parkpicasso.com',
    website: 'https://www.parkpicasso.com',
    taxOffice: '',
    taxNumber: '',
    mersis: '',
    returnAddress: 'Demirel Sokak No: 27 C, Güller Pınarı Mahallesi, Alanya / Antalya, Türkiye',
};

export interface LegalSection {
    heading?: string;
    paragraphs?: string[];
    list?: string[];
}

export interface LegalDocument {
    slug: string;
    title: string;
    description: string;
    updatedAt: string;
    sections: LegalSection[];
}

const sellerInfo = `${COMPANY.legalName}, ${COMPANY.address}, telefon: ${COMPANY.phone}, e-posta: ${COMPANY.email}.`;

export const LEGAL_DOCUMENTS: LegalDocument[] = [
    {
        slug: 'mesafeli-satis',
        title: 'Mesafeli Satış Sözleşmesi',
        description: 'Park Picasso üzerinden verilen siparişlere ilişkin mesafeli satış sözleşmesi.',
        updatedAt: '05.11.2026',
        sections: [
            {
                heading: '1. Taraflar',
                paragraphs: [
                    `Satıcı: ${sellerInfo}`,
                    'Alıcı: Park Picasso internet sitesi üzerinden sipariş veren, sipariş formunda bilgileri yer alan tüketici.',
                    'İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenlenmiştir.',
                ],
            },
            {
                heading: '2. Sözleşmenin Konusu',
                paragraphs: [
                    'Sözleşmenin konusu, Alıcı tarafından elektronik ortamda sipariş edilen ürünlerin satışı ve teslimi ile tarafların hak ve yükümlülüklerinin belirlenmesidir.',
                    'Ürünlerin temel nitelikleri, adetleri, satış bedeli ve teslimat bilgileri sipariş özetinde ve ön bilgilendirme formunda yer alır.',
                ],
            },
            {
                heading: '3. Ürün ve Bedel',
                paragraphs: [
                    'Ürünlerin KDV dahil satış bedeli, kargo ve varsa montaj bedeli sipariş özetinde gösterilir. Alıcı, siparişi onaylamadan önce toplam bedeli görüntüler.',
                    'Fiyatlar Türk Lirası (TRY) cinsindendir. Kampanya ve indirimler, siparişin verildiği tarihte geçerli olan koşullara göre uygulanır.',
                ],
            },
            {
                heading: '4. Teslimat',
                paragraphs: [
                    'Satıcı, sipariş konusu ürünü Alıcı’nın sipariş formunda belirttiği teslimat adresine, yasal süre olan en geç 30 gün içinde teslim etmeyi taahhüt eder. Ürün bazında farklı bir teslimat süresi belirtilmişse bu süre esas alınır.',
                    'Teslimat, ürünün niteliğine göre kargo veya Satıcı’nın yetkili ekibi tarafından yapılabilir. Montaj gerektiren ürünlerde montaj koşulları teslimat sayfasında açıklanır.',
                    'Alıcı, teslimat sırasında ürünü kontrol etmek ve hasar tespit ederse kargo görevlisine tutanak düzenletmekle yükümlüdür.',
                ],
            },
            {
                heading: '5. Cayma Hakkı',
                paragraphs: [
                    'Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkına sahiptir.',
                    'Cayma hakkının kullanılması ve iade süreci, İptal ve İade Koşulları sayfasında ayrıntılı olarak açıklanmıştır.',
                    'Mevzuatta cayma hakkının kullanılamayacağı belirtilen ürünler bu hakkın kapsamı dışındadır.',
                ],
            },
            {
                heading: '6. Ödeme',
                paragraphs: [
                    'Ödeme, internet sitesinde sunulan ödeme yöntemleriyle yapılır. Alıcı, seçtiği ödeme yöntemine ilişkin banka veya ödeme kuruluşu koşullarını kabul etmiş sayılır.',
                    'Sipariş bedelinin eksik veya hatalı ödenmesi hâlinde Satıcı, siparişi askıya alma veya iptal etme hakkını saklı tutar.',
                ],
            },
            {
                heading: '7. Uyuşmazlıkların Çözümü',
                paragraphs: [
                    'İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dâhilinde Alıcı’nın yerleşim yerindeki Tüketici Hakem Heyetleri, aşan hâllerde Tüketici Mahkemeleri yetkilidir.',
                ],
            },
            {
                heading: '8. Yürürlük',
                paragraphs: [
                    'Alıcı, siparişi onayladığı anda işbu sözleşmenin tüm hükümlerini okuduğunu ve kabul ettiğini beyan eder. Sözleşme, sipariş onayı ile yürürlüğe girer.',
                ],
            },
        ],
    },
    {
        slug: 'on-bilgilendirme',
        title: 'Ön Bilgilendirme Formu',
        description: 'Sipariş öncesinde satıcı, ürün, ödeme ve teslimat bilgileri.',
        updatedAt: '05.11.2026',
        sections: [
            {
                heading: 'Satıcı Bilgileri',
                paragraphs: [sellerInfo],
            },
            {
                heading: 'Ürün ve Bedel',
                paragraphs: [
                    'Sipariş konusu ürünlerin adı, adedi, temel özellikleri, KDV dahil satış bedeli, kargo ve varsa montaj bedeli sipariş özetinde yer alır.',
                    'Toplam ödenecek tutar, sipariş onayı öncesinde Alıcı’ya gösterilir.',
                ],
            },
            {
                heading: 'Ödeme ve Teslimat',
                paragraphs: [
                    'Ödeme, internet sitesinde sunulan yöntemlerle yapılır. Teslimat, sipariş formunda belirtilen adrese en geç 30 gün içinde yapılır.',
                    'Teslimat süresi ve montaj koşulları hakkında ayrıntılı bilgi Teslimat ve Montaj sayfasında yer alır.',
                ],
            },
            {
                heading: 'Cayma Hakkı',
                paragraphs: [
                    'Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde cayma hakkına sahiptir. Cayma hakkının kullanımı ve iade süreci İptal ve İade Koşulları sayfasında açıklanmıştır.',
                ],
            },
            {
                heading: 'Şikâyet ve İletişim',
                paragraphs: [
                    `Sipariş ve ürünlere ilişkin taleplerinizi ${COMPANY.email} adresine veya ${COMPANY.phone} numarasına iletebilirsiniz.`,
                ],
            },
        ],
    },
    {
        slug: 'iptal-iade',
        title: 'İptal, İade ve Cayma Koşulları',
        description: 'Sipariş iptali, cayma hakkı ve ürün iadesi süreçleri.',
        updatedAt: '05.11.2026',
        sections: [
            {
                heading: 'Cayma Hakkı',
                paragraphs: [
                    'Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.',
                    `Cayma bildirimini yazılı olarak ${COMPANY.email} adresine veya ${COMPANY.phone} numarasına iletebilirsiniz.`,
                ],
            },
            {
                heading: 'İade Süreci',
                list: [
                    'Cayma bildirimi Satıcı’ya ulaştıktan sonra Alıcı’ya iade gönderim bilgileri iletilir.',
                    'Ürün, orijinal ambalajı ve aksesuarlarıyla birlikte, kullanılmamış ve yeniden satılabilir durumda iade edilmelidir.',
                    `İade adresi: ${COMPANY.returnAddress}`,
                    'İade kargo bedeli, mevzuatta aksi öngörülmedikçe Alıcı tarafından karşılanır.',
                ],
            },
            {
                heading: 'Ücret İadesi',
                paragraphs: [
                    'Satıcı, cayma bildiriminin ulaşmasından itibaren en geç 14 gün içinde ürün bedelini, Alıcı’nın ödeme yaptığı yönteme uygun şekilde iade eder.',
                    'Ürünün Satıcı’ya ulaşması beklenmeden iade yapılabilir; ancak Satıcı, ürünü teslim alana kadar iadeyi askıya alma hakkını saklı tutar.',
                ],
            },
            {
                heading: 'İstisnalar',
                paragraphs: [
                    'Alıcı’nın istekleri doğrultusunda kişiye özel üretilen veya montajı yapılmış ürünler ile mevzuatta cayma hakkı dışında bırakılan ürünlerde cayma hakkı kullanılamaz.',
                    'Hasarlı veya ayıplı ürünlerde 6502 sayılı Kanun kapsamındaki seçimlik haklar saklıdır.',
                ],
            },
            {
                heading: 'Sipariş İptali',
                paragraphs: [
                    'Sipariş, henüz üretim veya kargoya verilme aşamasına geçmediyse iptal edilebilir. İptal talebi için sipariş numaranızla birlikte bizimle iletişime geçin.',
                ],
            },
        ],
    },
    {
        slug: 'kvkk',
        title: 'KVKK Aydınlatma Metni ve Gizlilik Politikası',
        description: 'Kişisel verilerin işlenmesi, saklanması ve haklarınız.',
        updatedAt: '05.11.2026',
        sections: [
            {
                heading: 'Veri Sorumlusu',
                paragraphs: [
                    `6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu ${COMPANY.legalName}’dır. Adres: ${COMPANY.address}. E-posta: ${COMPANY.email}.`,
                ],
            },
            {
                heading: 'İşlenen Kişisel Veriler',
                list: [
                    'Kimlik ve iletişim bilgileri (ad, soyad, e-posta, telefon).',
                    'Teslimat ve fatura bilgileri (adres, şirket bilgisi).',
                    'Sipariş ve ödeme işlem bilgileri.',
                    'İnternet sitesi kullanım bilgileri (çerezler, log kayıtları).',
                ],
            },
            {
                heading: 'İşleme Amaçları ve Hukuki Sebepler',
                paragraphs: [
                    'Kişisel veriler; siparişlerin oluşturulması, ödeme ve teslimat süreçlerinin yürütülmesi, müşteri desteği sağlanması, yasal yükümlülüklerin yerine getirilmesi ve site güvenliğinin sağlanması amaçlarıyla işlenir.',
                    'İşleme faaliyetleri; sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin yerine getirilmesi ve meşru menfaat hukuki sebeplerine dayanır. Pazarlama iletişimi için ayrıca açık rızanız alınır.',
                ],
            },
            {
                heading: 'Aktarım',
                paragraphs: [
                    'Kişisel veriler; ödeme kuruluşları, kargo ve lojistik firmaları, bilişim hizmet sağlayıcıları ve yetkili kamu kurumlarıyla, hizmetin gerektirdiği ölçüde ve mevzuata uygun olarak paylaşılabilir.',
                ],
            },
            {
                heading: 'Saklama Süresi',
                paragraphs: [
                    'Kişisel veriler, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır; süre sonunda silinir, yok edilir veya anonim hâle getirilir.',
                ],
            },
            {
                heading: 'Haklarınız',
                list: [
                    'Kişisel verilerinizin işlenip işlenmediğini öğrenme.',
                    'İşlenmişse buna ilişkin bilgi talep etme.',
                    'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.',
                    'Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme.',
                    'Silinmesini veya yok edilmesini isteme.',
                    'Aktarıldığı üçüncü kişileri öğrenme.',
                    'Otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme.',
                    'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.',
                ],
            },
            {
                heading: 'Çerezler',
                paragraphs: [
                    'İnternet sitesi, alışveriş deneyimini iyileştirmek ve site trafiğini analiz etmek için çerezler kullanır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.',
                ],
            },
            {
                heading: 'İletişim',
                paragraphs: [
                    `KVKK kapsamındaki taleplerinizi ${COMPANY.email} adresine iletebilirsiniz.`,
                ],
            },
        ],
    },
    {
        slug: 'uyelik',
        title: 'Üyelik ve Kullanım Koşulları',
        description: 'Park Picasso internet sitesinin kullanımına ilişkin koşullar.',
        updatedAt: '05.11.2026',
        sections: [
            {
                heading: 'Üyelik',
                paragraphs: [
                    'İnternet sitesine üye olan kullanıcılar, üyelik formunda verdikleri bilgilerin doğru ve güncel olduğunu kabul eder.',
                    'Kullanıcı, hesap bilgilerinin ve şifresinin gizliliğinden kendisi sorumludur. Hesabın yetkisiz kullanımından doğan zararlardan kullanıcı sorumludur.',
                ],
            },
            {
                heading: 'Kullanım Kuralları',
                list: [
                    'Site, yalnızca hukuka uygun amaçlarla kullanılabilir.',
                    'Site içeriğinin izinsiz kopyalanması, çoğaltılması veya dağıtılması yasaktır.',
                    'Sitenin güvenliğini tehdit eden, otomatik veri toplayan veya hizmeti aksatan faaliyetlerde bulunulamaz.',
                ],
            },
            {
                heading: 'Fikri Mülkiyet',
                paragraphs: [
                    'Site üzerindeki marka, logo, görsel, metin ve yazılım unsurları Park Picasso’ya veya ilgili hak sahiplerine aittir. İzinsiz kullanım hukuki sorumluluk doğurabilir.',
                ],
            },
            {
                heading: 'Sorumluluk',
                paragraphs: [
                    'Park Picasso, sitenin kesintisiz veya hatasız çalışacağını garanti etmez. Teknik arızalar, üçüncü taraf hizmet kesintileri veya mücbir sebeplerden doğan gecikmelerden sorumlu tutulamaz.',
                ],
            },
            {
                heading: 'Fesih ve Değişiklikler',
                paragraphs: [
                    'Kullanıcı, dilediği zaman üyeliğini sonlandırabilir. Park Picasso, bu koşulları önceden bildirimde bulunarak güncelleyebilir. Güncel koşullar sitede yayımlandığı tarihte yürürlüğe girer.',
                ],
            },
        ],
    },
    {
        slug: 'teslimat',
        title: 'Teslimat ve Montaj',
        description: 'Siparişlerin teslimatı, kargo ve montaj süreçleri.',
        updatedAt: '05.11.2026',
        sections: [
            {
                heading: 'Teslimat Süresi',
                paragraphs: [
                    'Siparişler, ödeme onayını takiben en geç 30 gün içinde teslim edilir. Ürün bazında farklı bir süre belirtilmişse sipariş özetindeki süre esas alınır.',
                    'Üretim veya tedarik süreci gerektiren ürünlerde tahmini teslimat süresi sipariş sonrasında ayrıca bildirilebilir.',
                ],
            },
            {
                heading: 'Kargo ve Teslimat',
                paragraphs: [
                    'Teslimat, sipariş formunda belirtilen adrese yapılır. Adres bilgilerinin hatalı olması nedeniyle oluşan gecikmelerden Alıcı sorumludur.',
                    'Büyük ölçekli oyun parkı ve mobilya ürünlerinde teslimat, Satıcı’nın yetkili ekibi veya anlaşmalı lojistik firması tarafından gerçekleştirilir.',
                ],
            },
            {
                heading: 'Montaj',
                paragraphs: [
                    'Montaj gerektiren ürünlerde montaj hizmeti, ürün ve bölge koşullarına göre planlanır. Montaj kapsamı ve varsa bedeli sipariş öncesinde bildirilir.',
                    'Montajın Alıcı tarafından yapılması hâlinde, ürünle birlikte verilen kurulum talimatlarına uyulması gerekir.',
                ],
            },
            {
                heading: 'Teslimatta Kontrol',
                paragraphs: [
                    'Alıcı, teslimat sırasında ürünü ve ambalajını kontrol etmelidir. Hasar, eksiklik veya ayıp tespit edilirse kargo görevlisine tutanak düzenletilmeli ve durum en kısa sürede Satıcı’ya bildirilmelidir.',
                    `Bildirim için: ${COMPANY.email} / ${COMPANY.phone}.`,
                ],
            },
        ],
    },
];

export function getLegalDocument(slug: string): LegalDocument | undefined {
    return LEGAL_DOCUMENTS.find((document) => document.slug === slug);
}
