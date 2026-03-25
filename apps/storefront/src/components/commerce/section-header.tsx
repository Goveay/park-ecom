import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    eyebrow?: string;
    viewAllLink?: string;
    viewAllText?: string;
    className?: string;
    align?: 'left' | 'center';
}

export function SectionHeader({
    title,
    subtitle,
    eyebrow,
    viewAllLink,
    viewAllText = "Tümünü Gör",
    className,
    align = 'left'
}: SectionHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8",
            align === 'center' && "md:items-center text-center",
            className
        )}>
            <div className={cn("flex flex-col gap-2", align === 'center' && "items-center")}>
                {eyebrow && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-500 border border-sky-100 shadow-sm w-fit">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase">
                            {eyebrow}
                        </span>
                    </div>
                )}
                
                <div className="relative inline-block pb-3 group/header">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-orange-500 leading-tight">
                        {title}
                    </h2>
                    {/* Wavy Slider Underline SVG - Refined Path and Stroke */}
                    <svg className="absolute -bottom-1 left-0 w-full h-3 text-orange-300 opacity-40 transition-opacity group-hover/header:opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path 
                            d="M0 10 C 20 0, 30 20, 50 10 C 70 0, 80 20, 100 10" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                        />
                    </svg>
                </div>

                {subtitle && (
                    <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed font-medium italic">
                        {subtitle}
                    </p>
                )}
            </div>

            {viewAllLink && (
                <div className="shrink-0 pb-1">
                    <Link 
                        href={viewAllLink}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-orange-500 text-white font-black text-[11px] uppercase tracking-widest transition-all hover:bg-orange-400 hover:scale-105 active:scale-95 shadow-[0_5px_0_0_rgb(194,65,12)] hover:shadow-[0_3px_0_0_rgb(194,65,12)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                    >
                        {viewAllText}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                    </Link>
                </div>
            )}
        </div>
    );
}
