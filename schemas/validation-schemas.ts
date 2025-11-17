import { z } from 'zod';

// Schema for signing users in
export const signInFormSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for signing up a user
export const signUpFormSchema = z.object({
    first_name: z.string().min(3, 'First name must be at least 3 characters'),
    last_name: z.string().min(3, 'Last name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

export const createNewUserFormSchema = z.object({
    first_name: z.string().min(3, 'First name must be at least 3 characters'),
    last_name: z.string().min(3, 'Last name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    isadmin: z.boolean(),
  });

// Schema for signing up a user
export const updateUserFormSchema = z.object({
    first_name: z.string().min(3, 'First name must be at least 3 characters'),
    last_name: z.string().min(3, 'Last name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    isactive: z.boolean().optional(),
    isadmin: z.boolean().optional(),
  });

export const categorySchema = z.object({
  category_name: z.string().min(2, { message: 'Category name must be at least 2 characters long' }),
});

export const createCategorySchema = z.object({
  category_name: z.string().min(2, { message: 'Category name must be at least 2 characters long' }),
  description: z.string().max(500, { message: 'Description must not exceed 500 characters' }).optional(),
});


export const updateCategorySchema = z.object({
  category_name: z.string().min(2, { message: 'Category name must be at least 2 characters long' }),
  description: z.string().max(500, { message: 'Description must not exceed 500 characters' }).optional(),
  isactive: z.boolean().optional().default(true),
});


export const statusSchema = z.object({
  status_name: z.string().min(2, { message: 'Status name must be at least 2 characters long' }).max(100, { message: 'Status name must not exceed 100 characters' }),
});

export const createStatusSchema = z.object({
  status_name: z.string().min(2, { message: 'Status name must be at least 2 characters long' }).max(100, { message: 'Status name must not exceed 100 characters' }),
  description: z.string().max(500, { message: 'Description must not exceed 500 characters' }).optional(),
  typeid: z.number().min(0, { message: 'Type ID must be a positive number' }),
  isactive: z.boolean().optional().default(true),
});

export const updateStatusSchema = z.object({
  status_name: z.string().min(2, { message: 'Status name must be at least 2 characters long' }).max(100, { message: 'Status name must not exceed 100 characters' }),
  description: z.string().max(500, { message: 'Description must not exceed 500 characters' }).optional(),
  typeid: z.number().min(0, { message: 'Type ID must be a positive number' }),
  isactive: z.boolean().optional(),
});
