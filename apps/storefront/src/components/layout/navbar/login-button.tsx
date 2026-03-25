'use client';

import { ComponentProps, useTransition } from "react";
import { logoutAction } from "@/app/sign-in/actions";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";

interface LoginButtonProps extends ComponentProps<'button'> {
    isLoggedIn: boolean;
}

export function LoginButton({ isLoggedIn, ...props }: LoginButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <button {...props} aria-disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all hover:bg-black/5 hover:scale-105 active:scale-95 font-semibold text-foreground whitespace-nowrap"
            onClick={() => {
                if (isLoggedIn) {
                    startTransition(async () => {
                        await logoutAction()
                    })
                } else {
                    router.push('/sign-in')
                }
            }}>
            {isLoggedIn ? (
                 <>
                    <LogOut className="h-5 w-5 stroke-[2px]" />
                    <span>Çıkış</span>
                </>
            ) : (
                <>
                    <LogIn className="h-5 w-5 stroke-[2px]" />
                    <span>Giriş</span>
                </>
            )}
        </button>
    )
}