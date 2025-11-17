'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';   
import { useRouter } from 'next/navigation';
import {signUpUser} from '@/actions/users';
import { ArrowRightIcon, AtSymbolIcon,  KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';



const SignIn = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('password', password);
    const result = await signUpUser(null, formData);
    if (!result.success) {
      setError(result.message || 'Sign up failed');
    } else {
      router.push('/signin');
    }
  };
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>    
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First Name:
            </label>
            <input
              type="text"
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            </div>
            <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name:
            </label>
            <input
              type="text"
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
             <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-8 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password:
              </label>
            <div className="relative">
            <input
                type={visible ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-8 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            <span onClick={() => setVisible(!visible)} className="cursor-pointer absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900">
             {!visible ? <EyeSlashIcon /> : <EyeIcon />} 
            </span>
            </div>
            </div>
                {error && <div className="mb-4 text-red-500 text-xs">Error: {error}</div>}
            <div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Sign Up
            </button>
          </div>
        </form>
        <div className="mt-4 text-sm text-center text-gray-600">
          Do you have an account?{' '}
          <a href="/auth/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign In <ArrowRightIcon className="inline h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;  