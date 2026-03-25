import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'İletişim',
    description: 'Park Picasso ile iletişime geçin. Alanya merkezli ofisimiz ve uzman ekibimizle projelerinize değer katıyoruz.',
};

export default function ContactPage() {
    return (
        <div className="relative min-h-screen bg-white pt-32 pb-20 overflow-hidden">
            {/* Artistic Texture Overlay for Page */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
                style={{
                    backgroundImage: 'url("/texture1.png")',
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat'
                }}
            />

            <div className="container relative mx-auto px-4 z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff6000]/10 text-[#ff6000] text-sm font-bold tracking-wide uppercase">
                            <MessageCircle className="h-4 w-4" />
                            Bizimle İletişime Geçin
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                            Size Nasıl <span className="text-[#ff6000]">Yardımcı</span> Olabiliriz?
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed italic">
                            Park tasarımından zemin kaplamaya, tüm projeleriniz için uzman ekibimiz yanınızda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white border border-border/50 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] duration-500">
                        {/* Contact Form Section */}
                        <div className="lg:col-span-7 p-8 lg:p-14 bg-white relative">
                            {/* Subtle inner shadow top */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-[#ff6000]/5 to-transparent" />

                            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                                📩 Mesaj Bırakın
                            </h2>
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Adınız
                                    </label>
                                    <input
                                        className="flex h-14 w-full rounded-2xl border-2 border-secondary bg-secondary/20 px-5 py-2 text-sm transition-all focus:border-[#ff6000] focus:bg-white focus:ring-4 focus:ring-[#ff6000]/10 outline-none placeholder:text-muted-foreground/50"
                                        placeholder=""
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Soyadınız
                                    </label>
                                    <input
                                        className="flex h-14 w-full rounded-2xl border-2 border-secondary bg-secondary/20 px-5 py-2 text-sm transition-all focus:border-[#ff6000] focus:bg-white focus:ring-4 focus:ring-[#ff6000]/10 outline-none placeholder:text-muted-foreground/50"
                                        placeholder=""
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        E-posta Adresiniz
                                    </label>
                                    <input
                                        type="email"
                                        className="flex h-14 w-full rounded-2xl border-2 border-secondary bg-secondary/20 px-5 py-2 text-sm transition-all focus:border-[#ff6000] focus:bg-white focus:ring-4 focus:ring-[#ff6000]/10 outline-none placeholder:text-muted-foreground/50"
                                        placeholder="info@parkpicasso.com"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Mesajınız
                                    </label>
                                    <textarea
                                        className="flex min-h-[160px] w-full rounded-2xl border-2 border-secondary bg-secondary/20 px-5 py-4 text-sm transition-all focus:border-[#ff6000] focus:bg-white focus:ring-4 focus:ring-[#ff6000]/10 outline-none placeholder:text-muted-foreground/50"
                                        placeholder="Projenizden bahsedin..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button className="group relative flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-[#ff6000] text-white font-bold text-lg shadow-[0_10px_20px_rgba(255,96,0,0.3)] hover:shadow-[0_15px_30px_rgba(255,96,0,0.4)] hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300">
                                        <span>Mesajı Gönder</span>
                                        <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Contact Info Section */}
                        <div className="lg:col-span-5 bg-zinc-900 p-8 lg:p-14 text-zinc-100 flex flex-col justify-between relative overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6000]/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff6000]/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-10 flex items-center gap-2">
                                    <div className="w-1.5 h-8 bg-[#ff6000] rounded-full" />
                                    Hızlı İletişim
                                </h2>
                                <div className="space-y-10">
                                    <div className="flex items-start gap-5 group">
                                        <div className="p-4 rounded-2xl bg-[#ff6000]/20 text-[#ff6000] ring-1 ring-[#ff6000]/50 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-2 text-xl text-white">Merkez Ofis</h3>
                                            <p className="text-zinc-400 leading-relaxed font-medium">
                                                Demirel Sokak No: 27 C, Güller Pınarı Mahallesi,
                                                Alanya, Antalya , Türkiye
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 group">
                                        <div className="p-4 rounded-2xl bg-[#ff6000]/20 text-[#ff6000] ring-1 ring-[#ff6000]/50 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-2 text-xl text-white">Telefon No</h3>
                                            <p className="text-[#ff6000] text-2xl font-black tracking-tighter">
                                                +90 (553) 886 55 98
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 group">
                                        <div className="p-4 rounded-2xl bg-[#ff6000]/20 text-[#ff6000] ring-1 ring-[#ff6000]/50 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-2 text-xl text-white">E-posta</h3>
                                            <p className="text-zinc-400 font-medium hover:text-[#ff6000] transition-colors cursor-pointer inline-block">
                                                info@parkpicasso.com
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-16 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <h3 className="font-bold mb-4 text-lg text-[#ff6000] flex items-center gap-2">
                                    Çalışma Saatlerimiz
                                </h3>
                                <div className="space-y-3 font-medium text-sm">
                                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                        <span className="text-zinc-400">Pazartesi - Cuma:</span>
                                        <span className="text-white">09:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                        <span className="text-zinc-400">Cumartesi:</span>
                                        <span className="text-white">10:00 - 15:00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-red-400/80 italic">
                                        <span>Pazar:</span>
                                        <span className="font-bold">Kapalı</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="mt-16 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white h-[500px] relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d32.0085!3d36.5440!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sDemirel%20Sokak%20No%3A%2027%20C%2C%20G%C3%BCller%20P%C4%B1nar%C4%B1%20Mahallesi%2C%20Alanya%2C%20Antalya!5e0!3m2!1str!2str!4v1710000000000!5m2!1str!2str&q=Demirel+Sokak+No:+27+C,+Güller+Pınarı+Mahallesi,+Alanya,+Antalya,+Türkiye"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Park Picasso Konum - Demirel Sokak No: 27 C, Güller Pınarı Mahallesi, Alanya, Antalya"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
