import Link from "next/link";
import Image from "next/image";

const BANNERS = [
    {
        title: "Dış Mekan",
        subtitle: "Oyun Parkı ve Bahçe Mobilyaları",
        image: "http://localhost:3000/assets/source/56/dismekancover2.webp",
        link: "/search?facets=42&facets=48",
        color: "bg-emerald-500/10",
        position: "object-center" // Adjust this to object-left, object-right, etc.
    },
    {
        title: "Sosyal Alan",
        subtitle: "Fitness, Peyzaj ve Sosyal Çözümler",
        image: "http://localhost:3000/assets/source/5e/sosyalalancover.webp",
        link: "/search?facets=52&facets=51&facets=50&facets=48",
        color: "bg-amber-500/10",
        position: "object-center"
    },
    {
        title: "İç Mekan",
        subtitle: "Softplay ve Oyuncak Grupları",
        image: "http://localhost:3000/assets/source/f1/icmekancover.webp",
        link: "/search?facets=46&facets=49",
        color: "bg-blue-500/10",
        position: "object-center"
    }
];

export function CategoryBanners() {
    return (
        <section className="py-12 md:py-20 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {BANNERS.map((banner, index) => (
                        <Link
                            key={index}
                            href={banner.link}
                            className="group relative block aspect-square overflow-hidden rounded-3xl bg-muted"
                        >
                            {/* Image with hover zoom */}
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                fill
                                priority={true}
                                className={`object-cover ${banner.position} transition-transform duration-700 ease-out group-hover:scale-110`}
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="space-y-2 transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium uppercase tracking-wider mb-2">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                            {banner.title}
                                        </h3>
                                    </span>

                                    <p className="text-white/70 text-sm font-medium line-clamp-2">
                                        {banner.subtitle}
                                    </p>
                                </div>

                                {/* Arrow / CTA */}
                                <div className="mt-6 flex items-center gap-2 text-white font-bold opacity-0 -translate-x-4 transition-all duration-500 delay-100 group-hover:opacity-100 group-hover:translate-x-0">
                                    <span className="text-xs uppercase tracking-widest">Kategoriye Git</span>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Accent line on hover */}
                            <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-primary transition-all duration-700 ease-out group-hover:w-full" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
