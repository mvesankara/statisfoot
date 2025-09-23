import NextAuth, { type DefaultSession } from "next-auth";
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

const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
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
        token.userId = (user as any).id;
        token.role = (user as any).role;
        token.firstname = (user as any).firstname ?? null;
        token.lastname = (user as any).lastname ?? null;
        token.emailVerified = (user as any).emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user ??= {} as any;
      (session.user as any).id = token.userId ?? "";
      (session.user as any).role = token.role ?? undefined;
      (session.user as any).firstname = token.firstname ?? null;
      (session.user as any).lastname = token.lastname ?? null;
      (session.user as any).emailVerified = token.emailVerified ?? null;
      return session;
    },
  },
});

export { auth, signIn, signOut, GET, POST };
