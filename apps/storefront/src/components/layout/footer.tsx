import { cacheLife } from 'next/cache';
import { getTopCollections } from '@/lib/vendure/cached';
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, CreditCard } from "lucide-react";

async function Copyright() {
    'use cache'
    cacheLife('days');

    return (
        <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">ParkPicasso</span>.
        </div>
    )
}

export async function Footer() {
    'use cache'
    cacheLife('days');

    const collections = await getTopCollections();

    // Using target slugs for categories for consistency
    const targetSlugs = [
        'bahce-mobilyalar',
        'fitness-ekipmanlar',
        'oyun-parklar',
        'peyzaj',
        'softplay-oyun-grubu',
        'sosyal-tesisler',
        'oyuncak'
    ];
    const categoryList = collections.filter((c: any) => targetSlugs.includes(c.slug));

    return (
        <footer className="relative bg-white border-t border-border mt-auto pt-16 pb-8 overflow-hidden">
            {/* Artistic Texture Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
                style={{
                    backgroundImage: 'url("/texture1.png")',
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat'
                }}
            />

            <div className="container relative mx-auto px-4 z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {/* Column 1: Logo & Contact */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                            <Image
                                src="/logo.svg"
                                alt="ParkPicasso Logo"
                                width={180}
                                height={45}
                                className="h-12 w-auto object-contain"
                            />
                        </Link>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-0.5 text-[#ff6000] shrink-0" />
                                <p>Demirel Sokak No: 27 C, Güller Pınarı Mahallesi,<br />Alanya, Antalya , Türkiye</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-[#ff6000] shrink-0" />
                                <a href="tel:+905538865598" className="hover:text-foreground transition-colors font-medium">+90 (553) 886 55 98</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-[#ff6000] shrink-0" />
                                <a href="mailto:info@parkpicasso.com" className="hover:text-foreground transition-colors font-medium">info@parkpicasso.com</a>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {[
                                { Icon: Instagram, href: "https://instagram.com/" },
                                { Icon: Facebook, href: "https://facebook.com/" },
                                { Icon: Twitter, href: "https://twitter.com/" },
                                { Icon: Youtube, href: "https://youtube.com/" }
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-secondary/50 rounded-full hover:bg-[#ff6000] hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-base font-bold mb-6 text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-[#ff6000] rounded-full" />
                            Hızlı Bağlantılar
                        </h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-[#ff6000] hover:pl-2 transition-all">Hakkımızda</Link></li>
                            <li><Link href="/references" className="hover:text-[#ff6000] hover:pl-2 transition-all">Referanslarımız</Link></li>
                            <li><Link href="/contact" className="hover:text-[#ff6000] hover:pl-2 transition-all">İletişim</Link></li>
                            <li><Link href="/account" className="hover:text-[#ff6000] hover:pl-2 transition-all">Hesabım</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Categories */}
                    <div>
                        <h4 className="text-base font-bold mb-6 text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-[#ff6000] rounded-full" />
                            Kategoriler
                        </h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-[#ff6000] transition-colors font-bold text-foreground">Anasayfa</Link></li>
                            {categoryList.map((collection: any) => (
                                <li key={collection.id}>
                                    <Link
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-[#ff6000] hover:pl-2 transition-all"
                                    >
                                        {collection.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent w-full mb-10" />

                {/* Bottom Section: Payment & Copyright */}
                <div className="flex flex-col items-center gap-10">
                    {/* Payment Icons */}
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 px-4 py-1.5 border border-green-500/30 bg-green-50/50 rounded-full text-[10px] font-bold text-green-700 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            GÜVENLİ ÖDEME
                        </div>

                        <Image src="/master.webp" alt="Mastercard" width={120} height={75} className="h-5 w-auto grayscale hover:grayscale-0 transition-all duration-500 object-contain" />
                        <Image src="/visa.webp" alt="Visa" width={120} height={60} className="h-4 w-auto grayscale hover:grayscale-0 transition-all duration-500 object-contain" />
                        <Image src="/TROY.png" alt="Troy" width={120} height={60} className="h-4 w-auto grayscale hover:grayscale-0 transition-all duration-500 object-contain" />
                    </div>

                    <Copyright />
                </div>
            </div>
        </footer>
    );
}
