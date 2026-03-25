import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function DesignParkBanner() {
    // Static image from public folder
    const bannerImage = "/tasarla-1.webp";

    return (
        <section className=" md:-mt-16 py-4 md:py-8 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Main Card with Custom Texture Background */}
                <div className="relative rounded-[2rem] border border-orange-100 shadow-[0_20px_40px_-15px_rgba(249,115,22,0.1)] overflow-visible mt-6 md:mt-8 group bg-orange-50/30">

                    {/* Background Texture Layer */}
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                        {/* User provided texture - visible at bottom, width 100% height auto to prevent zoom */}
                        <div
                            className="absolute inset-x-0 bottom-0 h-full z-0 opacity-60"
                            style={{
                                backgroundImage: "url('/texture1.png')",
                                //backgroundImage: `url('${(process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL || "http://localhost:3000/shop-api").replace("/shop-api", "")}/assets/source/98/texture.png')`,

                                backgroundRepeat: "repeat-x",
                                backgroundPosition: "bottom center",
                                backgroundSize: "50% auto"
                            }}
                        />
                        {/* Soft gradient to ensure text readability on top */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-white/50 to-white/90 z-0 mix-blend-overlay"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 items-center min-h-[300px] relative z-10">

                        {/* Text Content - Left Side */}
                        <div className="p-8 md:p-12 flex flex-col justify-center items-start space-y-6 order-2 md:order-1">
                            <div className="space-y-3">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-orange-200/50 shadow-sm text-orange-700 font-bold text-[10px] md:text-xs tracking-wider uppercase transition-transform hover:scale-105 cursor-default backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                    Özel Tasarım
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-800 leading-[1.1]">
                                    Kendi Oyun Parkınızı <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Tasarlayın!</span>
                                </h2>
                                <p className="text-base md:text-lg text-slate-600 font-medium max-w-md leading-relaxed text-shadow-sm">
                                    Picasso'nun renkleri gibi özgür, kübizm gibi yaratıcı. Hayalinizdeki parkı gerçeğe dönüştürün.
                                </p>
                            </div>

                            <div className="flex flex-row gap-3 w-full">
                                {/* Primary CTA - User Provided 'Liquid Glass' Style (CodePen) */}
                                {/* Primary CTA - Amoda Orange Button Style - Smaller Version */}
                                <div className="p-1 rounded-[16px] border border-white bg-white/40"> {/* Outer Glass Ring */}
                                    <Link href="https://3d.parkpicasso.com" className="
                                        flex items-center justify-center 
                                        px-12 py-4 
                                        rounded-[12px] 
                                        bg-gradient-to-b from-[#FF5700] to-[#EF5200] 
                                        text-white font-[500] text-[16px] leading-[20px] font-['Poppins']
                                        transition-all duration-500 ease-in-out
                                        hover:scale-[1.03]
                                        shadow-[0_4px_5px_rgba(255,88,0,0.15),0_10px_13px_rgba(255,88,0,0.22),0_25px_32px_rgba(255,88,0,0.19),inset_0_1px_4px_2px_rgb(255,237,219),inset_0_1px_18px_2px_rgb(255,237,219)]
                                        hover:shadow-[0_2px_10px_rgba(255,88,0,0.3),inset_0_1px_4px_2px_rgb(255,237,219),inset_0_1px_18px_2px_rgb(255,237,219)]
                                    ">
                                        Hemen Başla
                                    </Link>
                                </div>

                                {/* Secondary CTA */}

                            </div>
                        </div>

                        {/* Image - Right Side */}
                        <div className="relative h-[280px] md:h-[350px] w-full flex items-end justify-center md:justify-end order-1 md:order-2 pointer-events-none">
                            {/* The image container with negative margin to pop out */}
                            <div className="relative w-full h-[140%] -mt-[15%] md:-mt-[15%] md:-mb-[5%] md:-mr-12 md:h-[150%] md:w-auto aspect-square perspective-1000">
                                <Image
                                    src={bannerImage}
                                    alt="Özel Tasarım Oyun Parkı"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
