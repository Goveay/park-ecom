'use client';

import {useState, useEffect, useTransition} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Search} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

    useEffect(() => {
        setSearchValue(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    };

    return (
        <form onSubmit={handleSubmit} className="relative group perspective-1000">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-all duration-300 group-focus-within:text-[#ff6000] group-focus-within:scale-110"/>
            <Input
                type="search"
                placeholder="Ne aramıştınız?"
                className={cn(
                    "pl-12 w-[350px] lg:w-[450px] h-12 transition-all duration-300 rounded-xl",
                    "bg-secondary/30 border-border hover:bg-secondary/50",
                    "focus-visible:ring-2 focus-visible:ring-[#ff6000]/20 focus-visible:border-[#ff6000]",
                    "focus-visible:w-[380px] lg:focus-visible:w-[500px]",
                    "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] focus-visible:shadow-[0_10px_25px_-5px_rgba(255,96,0,0.15)]"
                )}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={isPending}
            />
        </form>
    );
}
