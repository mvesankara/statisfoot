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

import { UserRoleEnum } from "@prisma/client";


// Augmentations de types
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role?: UserRoleEnum | null;

      displayName?: string;
      username?: string;

      displayName?: string | null;
      username?: string;
      emailVerified?: Date | null;

    };
  }
  interface User {
    role?: UserRoleEnum | null;

    displayName?: string;
    username?: string;

    displayName?: string | null;
    username?: string;
    emailVerified?: Date | null;

  }
}
declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRoleEnum | null;

    displayName?: string;
    username?: string;

    displayName?: string | null;
    username?: string;
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

          include: { roles: { include: { role: true } } },

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

        const primaryRole = user.roles[0]?.role.name ?? null;

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,

          image: user.avatarUrl ?? null,
          role: primaryRole,
          displayName: user.displayName,
          username: user.username,

          role: primaryRole,
          displayName: user.displayName,
          username: user.username,
          emailVerified: user.emailVerified ?? null,

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

        } = user as {
          id?: string;
          role?: UserRoleEnum | null;
          displayName?: string;
          username?: string;
        };

        token.userId = id;
        token.role = role ?? null;
        token.displayName = displayName;
        token.username = username;

          emailVerified,
        } = user as {
          id?: string;
          role?: UserRoleEnum | null;
          displayName?: string | null;
          username?: string;
          emailVerified?: Date | null;
        };

        token.userId = id;
        token.role = role;
        token.displayName = displayName ?? null;
        token.username = username ?? undefined;
        token.emailVerified = emailVerified ?? null;

      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: token.userId ?? "",

          role: token.role ?? null,
          displayName: token.displayName,
          username: token.username,
        } as NonNullable<typeof session.user>;
      } else {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? null;
        session.user.displayName = token.displayName;
        session.user.username = token.username;
      }
      if (session.user) {
        session.user.name = token.displayName ?? session.user.name;

          role: token.role ?? undefined,
          displayName: token.displayName ?? null,
          username: token.username ?? undefined,
          emailVerified: token.emailVerified ?? null,
        } as NonNullable<typeof session.user>;
      } else {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? undefined;
        session.user.displayName = token.displayName ?? null;
        session.user.username = token.username ?? undefined;

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
