import React from 'react'
import SignUp from "@/components/auth/signup";
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

interface SignInPageProps {
    searchParams: Promise<{ callbackUrl?: string }>;
}

const SignUpPage = async (props: SignInPageProps) => {
    const { callbackUrl } = await props.searchParams;

    const session = await auth();

    if (session) {
        return redirect(callbackUrl || '/');
    }
    return (
        <div className="auth-box overflow-hidden align-items-center d-flex" style={{ minHeight: '100vh' }}>
            <SignUp />
        </div>
    )
}

export default SignUpPage