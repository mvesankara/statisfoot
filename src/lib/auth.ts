import NextAuth, {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

import type { UserRoleEnum } from "@prisma/client";

// Augmentation des types NextAuth pour inclure des champs personnalisés
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role?: UserRoleEnum | null;
      displayName?: string | null;
      username?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id?: string;
    role?: UserRoleEnum | null;
    displayName?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRoleEnum | null;
    displayName?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Provide a secret via AUTH_SECRET (or NEXTAUTH_SECRET for backwards compatibility).
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email & Mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const email = creds.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            roles: {
              include: { role: true },
              orderBy: { assignedAt: "asc" },
            },
          },
        });

        if (!user?.hashedPass) return null;

        const ok = await compare(creds.password, user.hashedPass);
        if (!ok) return null;

        const primaryRole = user.roles[0]?.role?.name ?? null;

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          image: user.avatarUrl ?? null,
          role: primaryRole,
          displayName: user.displayName,
          username: user.username,
          emailVerified: user.emailVerified ?? null,
        } satisfies {
          id: string;
          name: string;
          email: string;
          image: string | null;
          role: UserRoleEnum | null;
          displayName: string;
          username: string;
          emailVerified: Date | null;
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const {
          id,
          role,
          displayName,
          username,
          emailVerified,
        } = user;

        token.userId = id ?? token.userId;
        token.role = role ?? null;
        token.displayName = displayName ?? null;
        token.username = username ?? null;
        token.emailVerified = emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: token.userId ?? "",
          role: token.role ?? null,
          displayName: token.displayName ?? null,
          username: token.username ?? null,
          emailVerified: token.emailVerified ?? null,
        } as NonNullable<typeof session.user>;
      } else {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? null;
        session.user.displayName = token.displayName ?? null;
        session.user.username = token.username ?? null;
        session.user.emailVerified = token.emailVerified ?? null;
      }

      if (session.user) {
        session.user.name = token.displayName ?? session.user.name;
      }
      return session;
    },
  },
};

const authHandler = NextAuth(authOptions);

export const handlers = { GET: authHandler, POST: authHandler };

export async function auth() {
  return getServerSession(authOptions);
}
