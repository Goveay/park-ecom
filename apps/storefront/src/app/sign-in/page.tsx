import type {Metadata} from 'next';
import {Suspense} from 'react';
import {LoginForm} from "./login-form";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export const metadata: Metadata = {
    title: 'Giriş Yap',
    description: 'Siparişlerinize ve hesabınıza erişmek için giriş yapın.',
};

function LoginFormSkeleton() {
    return (
        <Card>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
                <Skeleton className="h-10 w-full"/>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">

                <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-4 w-40"/>
                </div>
            </CardFooter>
        </Card>
    );
}

async function SignInContent({searchParams}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const resolvedParams = await searchParams;
    const redirectTo = resolvedParams?.redirectTo as string | undefined;
    const registered = resolvedParams?.registered === '1';

    return (
        <div className="space-y-4">
            {registered && (
                <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
                    Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.
                </div>
            )}
            <LoginForm redirectTo={redirectTo}/>
        </div>
    );
}

export default async function SignInPage({searchParams}: PageProps<'/sign-in'>) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Giriş Yap</h1>
                    <p className="text-muted-foreground">
                        Hesabınıza erişmek için bilgilerinizi girin
                    </p>
                </div>
                <Suspense fallback={<LoginFormSkeleton/>}>
                    <SignInContent searchParams={searchParams}/>
                </Suspense>
            </div>
        </div>
    );
}