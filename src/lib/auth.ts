import NextAuth, { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Augmentations de types
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role?: string;
      firstname?: string | null;
      lastname?: string | null;
      emailVerified?: Date | null;
    };
  }
  interface User {
    role?: string;
    firstname?: string | null;
    lastname?: string | null;
    emailVerified?: Date | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    firstname?: string | null;
    lastname?: string | null;
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
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const ok = await compare(creds.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          name:
            user.name ??
            `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),
          email: user.email,
          role: user.role,
          firstname: user.firstname ?? null,
          lastname: user.lastname ?? null,
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
          firstname,
          lastname,
          emailVerified,
        } = user as {
          id?: string;
          role?: string;
          firstname?: string | null;
          lastname?: string | null;
          emailVerified?: Date | null;
        };

        token.userId = id;
        token.role = role;
        token.firstname = firstname ?? null;
        token.lastname = lastname ?? null;
        token.emailVerified = emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: token.userId ?? "",
          role: token.role ?? undefined,
          firstname: token.firstname ?? null,
          lastname: token.lastname ?? null,
          emailVerified: token.emailVerified ?? null,
        } as NonNullable<typeof session.user>;
      } else {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? undefined;
        session.user.firstname = token.firstname ?? null;
        session.user.lastname = token.lastname ?? null;
        session.user.emailVerified = token.emailVerified ?? null;
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
