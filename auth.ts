import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
//import { cookies } from 'next/headers';
import bcryptjs from "bcryptjs";
import CredentialsProvider from 'next-auth/providers/credentials';

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
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and if the password matches
        if (
          user &&
          typeof user.password === 'string' &&
          typeof credentials.password === 'string'
        ) {
          const isMatch = await bcryptjs.compare(credentials.password as string, user.password);
          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
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

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name ?? undefined;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
        token.isadmin = user.isadmin;

        // If user has no name then use the email
        if (user.name === 'NO_NAME') {
          token.name = user.email ? user.email.split('@')[0] : '';

          // Update database to reflect the token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        // if (trigger === 'signIn' || trigger === 'signUp') {
        //   const cookiesObject = await cookies();
        // }
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
  },
});

