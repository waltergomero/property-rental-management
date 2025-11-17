import React from 'react'
import SignIn from "@/components/auth/signin";
import { redirect } from 'next/navigation';
export const metadata= { title: "Sign In" }
import { auth } from '@/auth';

interface SignInPageProps {
    searchParams: Promise<{ callbackUrl?: string }>;
}

const SignInPage = async (props: SignInPageProps) => {
    const { callbackUrl } = await props.searchParams;

    const session = await auth();

        if (session) {
            return redirect(callbackUrl || '/admin');
        }

  
    return (
        <div className="auth-box overflow-hidden align-items-center d-flex" style={{ minHeight: '100vh' }}>
            <SignIn />
        </div>
    )
}

export default SignInPage
