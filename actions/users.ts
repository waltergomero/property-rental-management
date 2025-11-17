/**
 * User Actions - Server-side functions for user management
 * Handles CRUD operations, authentication, and user-related business logic
 */
'use server';

import { 
  signUpFormSchema, 
  createNewUserFormSchema, 
  updateUserFormSchema, 
  signInFormSchema 
} from '@/schemas/validation-schemas';
import { unstable_noStore as noStore } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcryptjs from "bcryptjs";
import { formatError } from '@/lib/utils';
import { z } from 'zod';
import { signIn, signOut } from '@/auth';
import connectDB from '@/config/database';
import User from '@/models/User';
import { AuthError } from 'next-auth';

// Types for better type safety
interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

interface ValidationResult {
  error: string;
  zodErrors?: Record<string, string[]>;
  strapiErrors?: null;
  message: string;
}

interface UsersResult {
  data: any[];
  totalPages: number;
}

interface GetUsersParams {
  limit?: number;
  page: number;
  query?: string;
}

interface DbUser {
  _id: any;
  email: string;
  password: string;
  isactive: boolean;
  first_name: string;
  last_name: string;
}

// Constants
const BCRYPT_SALT_ROUNDS = 12;
const DEFAULT_PAGE_LIMIT = 10;

// Utility function for consistent password hashing
async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(BCRYPT_SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
}

// Utility function for consistent error handling
function handleActionError(error: unknown, defaultMessage: string): ActionResult {
  if (isRedirectError(error)) {
    throw error;
  }
  
  const message = error instanceof Error ? formatError(error) : defaultMessage;
  console.error('Action error:', error);
  
  return { 
    success: false, 
    message 
  };
}

// Utility function for validation error formatting
function formatValidationError(error: z.ZodError): ValidationResult {
  return {
    error: "validation",
    zodErrors: error.flatten().fieldErrors,
    strapiErrors: null,
    message: "Missing or invalid information in required fields.",
  };
}

/**
 * Get all users with pagination and filtering
 */
export async function getAllUsers({ 
  limit = DEFAULT_PAGE_LIMIT, 
  page, 
  query 
}: GetUsersParams): Promise<UsersResult> {
  try {
    await connectDB();
    const queryFilter = query && query !== 'all'
      ? {
          $or: [
            { last_name: { $regex: query, $options: 'i' } },
            { first_name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
        }
      : {};

    const [data, dataCount] = await Promise.all([
      User.find(queryFilter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('id first_name last_name name email isadmin isactive createdAt updatedAt')
        .lean(),
      User.countDocuments(queryFilter),
    ]);

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Sign in user with email and password
 */
export async function signInWithCredentials(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    await connectDB();
    // Validate form data
    const validatedData = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Find user by email
    const dbUser = await User.findOne({
      email: validatedData.email
    }).select('_id email password isactive first_name last_name').lean() as DbUser | null;

    if (!dbUser) {
      return { 
        success: false, 
        message: `User with email ${validatedData.email} not found` 
      };
    }

    if (!dbUser.isactive) {
      return { 
        success: false, 
        message: 'Your account has been deactivated. Please contact support.' 
      };
    }

    if (!dbUser.password) {
      return { 
        success: false, 
        message: 'Account authentication not configured. Please contact support.' 
      };
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(
      validatedData.password, 
      dbUser.password
    );

    if (!isPasswordValid) {
      return { 
        success: false, 
        message: 'Invalid password. Please try again.' 
      };
    }

    // TODO: Implement actual authentication (JWT, sessions, etc.)
    await signIn('credentials', validatedData);

    return { 
      success: true, 
      message: 'Signed in successfully',
      data: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: `${dbUser.first_name} ${dbUser.last_name}`,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Please check your email and password format' 
      };
    }
    return handleActionError(error, 'Sign in failed');
  }
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<ActionResult> {
  try {
    // TODO: Implement actual sign out logic
    await signOut();
    
    return { 
      success: true, 
      message: 'Signed out successfully' 
    };
  } catch (error) {
    return handleActionError(error, 'Sign out failed');
  }
}

/**
 * Register new user account
 */
export async function signUpUser(
  prevState: any, 
  formData: FormData
): Promise<ActionResult> {
  try {
    await connectDB();
    // Validate form data
    const validatedData = signUpFormSchema.parse({
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Find user by email
    const existingUser = await User.findOne({
      email: validatedData.email
    }).select('_id email password isactive first_name last_name').lean() as DbUser | null;

    if (existingUser) {
      return { 
        success: false, 
        message: `An account with email ${validatedData.email} already exists` 
      };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = new User({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        name: `${validatedData.first_name} ${validatedData.last_name}`,
        email: validatedData.email,
        password: hashedPassword,
        isactive: true,
        isadmin: false,
    });

    // Redirect to login page after successful registration
    //revalidatePath('/signin');
    //redirect('/signin');
    await newUser.save();
    console.log("New User Created:", newUser);
    return { 
      success: true, 
      message: 'Account created successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Please check all required fields and try again' 
      };
    }
    return handleActionError(error, 'Account creation failed');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    await connectDB();
    const user = await User.findOne({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        name: true,
        email: true,
        isadmin: true,
        isactive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<void> {
  noStore();

  try {
    await connectDB();
    await User.findByIdAndDelete(id);
    
    revalidatePath('/admin/users');
    redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Create new user (admin function)
 */
export async function createNewUser(
  formData: FormData
): Promise<ActionResult | ValidationResult> {
  try {
      await connectDB();
    const formFields = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      isadmin: Boolean(formData.get('isadmin')),
    };

    // Validate form data
    const validatedFields = createNewUserFormSchema.safeParse(formFields);
    if (!validatedFields.success) {
      return formatValidationError(validatedFields.error);
    }

    const { first_name, last_name, email, password, isadmin } = validatedFields.data;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: `User with email "${email}" already exists`,
      };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      data: {
        first_name,
        last_name,
        name: `${first_name} ${last_name}`,
        email,
        password: hashedPassword,
        isadmin,
        isactive: true,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        isadmin: true,
      },
    });

    return { 
      success: true, 
      message: 'User created successfully',
      data: newUser,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to create user');
  }
}

/**
 * Update existing user
 */
export async function updateUser(
  formData: FormData
): Promise<ActionResult | ValidationResult> {
  try {
    await connectDB();  
    const formFields = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      isadmin: Boolean(formData.get("isadmin")),
      isactive: Boolean(formData.get("isactive")),
    };

    const userId = formData.get("userid") as string;
    const password = formData.get("password") as string;

    // Validate form data
    const validatedFields = updateUserFormSchema.safeParse(formFields);
    if (!validatedFields.success) {
      return formatValidationError(validatedFields.error);
    }

    const { first_name, last_name, email, isactive, isadmin } = validatedFields.data;

    // Check if user exists
    const existingUser = await User.findOne({ 
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!existingUser) {
      return { 
        success: false, 
        message: 'User not found' 
      };
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailTaken = await User.findOne({
        where: { 
          email,
          NOT: { id: userId },
        },
        select: { id: true },
      });

      if (emailTaken) {
        return { 
          success: false, 
          message: `Email ${email} is already taken by another user` 
        };
      }
    }

    // Prepare update data
    const updateData: {
      first_name: string;
      last_name: string;
      name: string;
      email: string;
      isadmin: boolean;
      isactive: boolean;
      password?: string;
    } = {
      first_name,
      last_name,
      name: `${first_name} ${last_name}`,
      email,
      isadmin: isadmin ?? false,
      isactive: isactive ?? true,
    };

    // Hash new password if provided
    if (password && password.trim()) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          isadmin: true,
          isactive: true,
        }
      }
    );

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to update user');
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(
  userId: string, 
  isactive: boolean
): Promise<ActionResult> {
  try {
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isactive },
      { 
        new: true,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          isactive: true,
        }
      }
    );

    return {
      success: true,
      message: `User ${isactive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to update user status');
  }
}

/**
 * Check if email is available
 */
export async function checkEmailAvailability(
  email: string, 
  excludeUserId?: string
): Promise<ActionResult> {
  try {
    await connectDB();
    const existingUser = await User.findOne({
      where: {
        email,
        ...(excludeUserId && { NOT: { id: excludeUserId } }),
      },
      select: { id: true },
    });

    return {
      success: !existingUser,
      message: existingUser ? 'Email is already taken' : 'Email is available',
    };
  } catch (error) {
    return handleActionError(error, 'Failed to check email availability');
  }
}

export async function doSocialLogin(provider: string) {
    try {
  await signIn(provider, { redirect: false })
} 
catch (error) {
  if (error instanceof AuthError) {
    return { error: error.cause?.err?.message };
  }
  return { error: "error 500" };
}
  }
