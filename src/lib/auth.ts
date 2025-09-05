import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email & Mot de passe",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Mot de passe", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;
        // retourne aussi le rôle
       return { id: user.id, name: user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(), email: user.email, role: user.role }; 
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).userId = token.userId;
      (session.user as any).firstName = user?.firstName;
      (session.user as any).lastName  = user?.lastName;
      (session as any).role = token.role;
      return session;
    },
  },
};
