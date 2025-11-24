'use client';

import React, { Fragment, useState } from 'react';
import {  EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import {createNewUser} from '@/actions/users';
import { ZodErrors } from "@/components/common/zod-errors";
import { toast } from 'react-toastify';
import { redirect, useRouter } from 'next/navigation';


type UserCreateFormState = {
  loading: boolean;
  zodErrors: Record<string, string[]> | null;
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: UserCreateFormState = {
  loading: false,
  zodErrors: null,
  error: undefined,
  success: undefined,
  message: undefined,
};


const UserAddForm = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<UserCreateFormState>(initialState);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setState({ ...initialState, loading: true });

    try {
      const formData = new FormData(form);
      const result = await createNewUser(formData);
      console.log('Create User Result:', result);
      if ('success' in result && result.success) {
        toast.success(result.message);
        // Reset form
        form.reset();
        setPassword('');
      } else {
        const errorMessage = 'message' in result ? result.message : 'Failed to create user';
        setState({ ...initialState, zodErrors: 'zodErrors' in result ? result.zodErrors ?? null : null });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
          setIsSubmitting(false);
          //redirecyt to user list page
          setState({ ...initialState });
          //redirect to user list page
          redirect('/admin/users');
    
        }
  };
  
  return (
    <section className='container mx-auto pt-12'>
      <div className="max-w-4xl mx-auto p-6 border border-gray-200 rounded-md shadow-sm">
        <h2 className="text-2xl font-bold mb-6">User Add Form</h2>     
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ZodErrors error={state.zodErrors?.first_name} />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ZodErrors error={state.zodErrors?.last_name} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ZodErrors error={state.zodErrors?.email} />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type={visible ? "text" : "password"}
                id="password"
                value={password}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span onClick={() => setVisible(!visible)} className="cursor-pointer absolute right-3 mt-5 h-[25px] w-[25px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900">
             {!visible ? <EyeSlashIcon /> : <EyeIcon />} 
            </span>
            <ZodErrors error={state.zodErrors?.password} />
          </div>

          <div className="flex items-center pt-4">
            <input
              type="checkbox"
              id="isadmin"
              name="isadmin"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isadmin" className="ml-2 text-sm font-medium">
              Is Admin?
            </label>
          </div>
          </div>
          <div className="pt-4 flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="bg-gray-500 text-white py-1.5 px-6 text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-1.5 px-6 text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default UserAddForm