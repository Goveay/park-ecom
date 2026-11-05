'use server';

import {mutate} from '@/lib/vendure/api';
import {LoginMutation, RegisterCustomerAccountMutation} from '@/lib/vendure/mutations';
import {setAuthToken} from '@/lib/auth';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

export async function registerAction(prevState: { error?: string } | undefined, formData: FormData) {
    const emailAddress = formData.get('emailAddress') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    if (!emailAddress || !password) {
        return {error: 'E-posta adresi ve şifre zorunludur'};
    }


    const result = await mutate(RegisterCustomerAccountMutation, {
        input: {
            emailAddress,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phoneNumber: phoneNumber || undefined,
            password,
        }
    });

    const registerResult = result.data.registerCustomerAccount;

    if (registerResult.__typename !== 'Success') {
        return {error: registerResult.message};
    }

    const safeRedirect = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/account';

    // E-posta doğrulaması kapalı: kayıt sonrası otomatik giriş yap.
    const loginResult = await mutate(LoginMutation, {username: emailAddress, password});

    if (loginResult.data.login.__typename === 'CurrentUser' && loginResult.token) {
        await setAuthToken(loginResult.token);
        revalidatePath('/', 'layout');
        redirect(safeRedirect);
    }

    // Otomatik giriş başarısız olursa giriş sayfasına yönlendir.
    const signInUrl = redirectTo
        ? `/sign-in?registered=1&redirectTo=${encodeURIComponent(redirectTo)}`
        : '/sign-in?registered=1';

    redirect(signInUrl);

}
