import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/metadata";

export const metadata: Metadata = {
    title: `Referanslarımız | ${SITE_NAME}`,
    description: `${SITE_NAME} olarak tamamladığımız seçkin projeler ve referanslarımız.`,
};

// Placeholder references data
const REFERENCES = [
    { title: "Millet Bahçesi Projesi", location: "İstanbul", category: "Oyun Grubu" },
    { title: "Vadi Evleri Sosyal Tesis", location: "Ankara", category: "Kent Mobilyaları" },
    { title: "Kıyı Park Rekreasyon Alanı", location: "İzmir", category: "Dış Mekan Spor" },
    { title: "Olimpiyat Temalı Park", location: "Bursa", category: "Temalı Park" },
    { title: "Doğa Koleji Bahçe Düzenlemesi", location: "Antalya", category: "Oyun Grubu & Zemin" },
    { title: "Belediye Meydan Projesi", location: "Eskişehir", category: "Kent Mobilyaları" },
];

export default function ReferencesPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative h-[30vh] min-h-[350px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-widest mb-4">Referanslarımız</h1>
                    <div className="h-1.5 w-16 bg-primary mx-auto rounded-full mb-6" />
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Kalitemizin en büyük güvencesi, başarıyla tamamladığımız projelerimizdir.
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {REFERENCES.map((ref, i) => (
                            <div key={i} className="group relative rounded-3xl overflow-hidden border border-border/60 bg-muted hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                {/* Image Placeholder */}
                                <div className="aspect-[4/3] bg-muted relative overflow-hidden flex flex-col items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                                    <div className="z-10 flex flex-col items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-700">
                                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-semibold tracking-widest uppercase text-xs">Proje Görseli</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                                </div>
                                
                                {/* Content Info */}
                                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold uppercase tracking-widest border border-primary/40">
                                            {ref.category}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors">{ref.title}</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {ref.location}
                                    </div>
                                </div>
                                
                                {/* Accent Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
