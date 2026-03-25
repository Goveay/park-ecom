import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/metadata";

export const metadata: Metadata = {
    title: `Hakkımızda | ${SITE_NAME}`,
    description: `${SITE_NAME} hikayesi, vizyonu ve misyonu. Müşteri memnuniyeti odaklı üretim anlayışımız.`,
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)] opacity-30" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-widest mb-4">Hakkımızda</h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6" />
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Güvenli ve yenilikçi yaşam alanları inşa ediyoruz.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">Biz Kimiz?</h2>
                            <div className="h-1 w-12 bg-primary rounded-full" />
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">{SITE_NAME}</strong>, yılların verdiği tecrübe ile çocuk oyun grupları, kent mobilyaları, dış mekan spor aletleri ve kauçuk zemin kaplamaları sektöründe öncü bir markadır. 
                                Amacımız, gelecek nesillere daha güvenli, sağlıklı ve estetik oyun ve yaşam alanları bırakmaktır.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Kendi üretim tesisimizde, uluslararası kalite ve güvenlik standartlarına (TSE, EN 1176) uygun olarak ürettiğimiz ürünleri, Türkiye'nin dört bir yanındaki ve yurtdışındaki projelerle buluşturuyoruz.
                            </p>
                        </div>
                        <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden bg-muted border border-border/50 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent flex items-center justify-center">
                                {/* Visual Placeholder for Production Facility */}
                                <div className="text-center space-y-4">
                                    <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="text-muted-foreground font-semibold tracking-widest text-sm uppercase">Tesis Görseli İçin Alan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20 bg-muted/20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Vision Card */}
                        <div className="bg-background p-10 md:p-12 rounded-[2.5rem] border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-8 border border-primary/10">
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Vizyonumuz</h3>
                            <p className="text-muted-foreground leading-relaxed md:text-lg">
                                Sektördeki yenilikleri takip ederek, sadece Türkiye'de değil, küresel ölçekte tanınan, güvenilir ve tercih edilen lider bir marka olmak. Kent estetiğine değer katan tasarım odaklı yaklaşımımızı her projemizde hissettirmek.
                            </p>
                        </div>
                        {/* Mission Card */}
                        <div className="bg-background p-10 md:p-12 rounded-[2.5rem] border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-8 border border-primary/10">
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Misyonumuz</h3>
                            <p className="text-muted-foreground leading-relaxed md:text-lg">
                                Müşteri memnuniyetini en üst düzeyde tutarak, dayanıklı, çevre dostu ve uluslararası standartlara uygun ürünler üretmek. Çocukların fiziksel ve zihinsel gelişimlerini destekleyen, güvenli ve eğlenceli oyun alanları inşa etmek.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
