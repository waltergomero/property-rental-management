import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import connectDB from './config/database';
import bcryptjs from "bcryptjs";
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';

declare module "next-auth" {
  interface User {
    isadmin?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      isadmin?: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  //adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
        await connectDB();
        const user = await User.findOne({
          email: credentials.email as string,
        }).lean() as { _id: any; name: string; email: string; password: string; isadmin?: boolean } | null;

        if (user) {
          const isMatch = await bcryptjs.compare(credentials.password as string, user.password);
          // If password is correct, return user
          if (isMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              isadmin: user.isadmin,
            };
          }
        }
        // If user does not exist or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user, trigger, token }) {
      // Set the user ID from the token
      session.user.id = token.sub ?? '';
      session.user.isadmin = typeof token.isadmin === 'boolean' ? token.isadmin : undefined;
      session.user.name = token.name ?? undefined;

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
        token.isadmin = user.isadmin;
        token.name = user.name;
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
  },
});
