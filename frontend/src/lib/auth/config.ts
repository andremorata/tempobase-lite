/**
 * Auth.js v5 Configuration
 *
 * Provides credentials-based authentication with JWT sessions.
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@prisma/client";

type AppAuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountId: string;
};

type AppAuthToken = {
  id?: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  accountId?: string;
};

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] &
      AppAuthUser & {
        emailVerified: Date | null;
      };
  }

  interface User extends AppAuthUser {
    emailVerified: Date | null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Query user by email (bypass tenant filter)
        const user = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase(),
            isActive: true,
            isDeleted: false,
          },
        });

        if (!user) {
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
          return null;
        }

        // Return user object for JWT
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          accountId: user.accountId,
          emailVerified: null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as typeof token & AppAuthToken;

      if (user) {
        const appUser = user as typeof user & AppAuthUser;

        // Initial sign in
        appToken.id = appUser.id;
        appToken.email = appUser.email;
        appToken.firstName = appUser.firstName;
        appToken.lastName = appUser.lastName;
        appToken.role = appUser.role;
        appToken.accountId = appUser.accountId;
      }

      return token;
    },
    async session({ session, token }) {
      const appToken = token as typeof token & AppAuthToken;

      // Expose user fields in session
      session.user = {
        id: appToken.id ?? "",
        email: appToken.email ?? "",
        name: [appToken.firstName, appToken.lastName].filter(Boolean).join(" ") || null,
        image: null,
        firstName: appToken.firstName ?? "",
        lastName: appToken.lastName ?? "",
        role: appToken.role ?? "Member",
        accountId: appToken.accountId ?? "",
        emailVerified: null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
