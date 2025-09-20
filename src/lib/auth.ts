 import type { DefaultSession, NextAuthOptions } from "next-auth";
 import CredentialsProvider from "next-auth/providers/credentials";
 import GoogleProvider from "next-auth/providers/google";
 import { compare } from "bcryptjs";
 
 import { prisma } from "@/lib/prisma";

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
   secret: process.env.NEXTAUTH_SECRET,
   pages: { signIn: "/login" },
   providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
     CredentialsProvider({
       name: "Email & Mot de passe",
       credentials: {
         email: { label: "Email", type: "email" },
         password: { label: "Mot de passe", type: "password" },
       },
       async authorize(credentials) {
         if (!credentials?.email || !credentials?.password) return null;
 
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
         if (!user || !user.password) return null;
 
         const ok = await compare(credentials.password, user.password);
         if (!ok) return null;
 
         return {
           id: user.id,
           name: user.name ?? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),
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
         token.userId = user.id as string;
         token.role = user.role;
         token.firstname = user.firstname ?? null;
         token.lastname = user.lastname ?? null;
         token.emailVerified = user.emailVerified ?? null;
       }
       return token;
     },
     async session({ session, token }) {
       if (session.user) {
         if (typeof token.userId === "string") {
           session.user.id = token.userId;
         }
         if (typeof token.role === "string") {
           session.user.role = token.role;
         }
         session.user.firstname = token.firstname ?? null;
         session.user.lastname = token.lastname ?? null;
         session.user.emailVerified = token.emailVerified ?? null;
       }
       return session;
     },
   },
 };
