/**
 * @file Configuration de NextAuth.js pour l'authentification.
 * @description Ce fichier définit les options de NextAuth, y compris les fournisseurs d'authentification (Credentials et Google),
 * la stratégie de session, et les callbacks pour enrichir le token JWT et la session utilisateur avec des données personnalisées.
 */
import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

/**
 * @module next-auth
 * @description Extension des types de NextAuth pour inclure des propriétés personnalisées.
 */
declare module "next-auth" {
  /**
   * @interface Session
   * @description Étend l'interface Session pour inclure l'ID de l'utilisateur, son rôle, prénom, nom et la date de vérification de l'email.
   */
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role?: string;
      firstname?: string | null;
      lastname?: string | null;
      emailVerified?: Date | null;
    };
  }

  /**
   * @interface User
   * @description Étend l'interface User pour inclure le rôle, prénom, nom et la date de vérification de l'email.
   */
  interface User {
    role?: string;
    firstname?: string | null;
    lastname?: string | null;
    emailVerified?: Date | null;
  }
}

/**
 * @module next-auth/jwt
 * @description Extension des types JWT de NextAuth.
 */
declare module "next-auth/jwt" {
  /**
   * @interface JWT
   * @description Étend l'interface JWT pour inclure l'ID de l'utilisateur, son rôle, prénom, nom et la date de vérification de l'email.
   */
  interface JWT {
    userId?: string;
    role?: string;
    firstname?: string | null;
    lastname?: string | null;
    emailVerified?: Date | null;
  }
}

/**
 * @const {NextAuthOptions} authOptions
 * @description Options de configuration pour NextAuth.
 * @property {object} session - Configuration de la session.
 * @property {string} session.strategy - Stratégie de session ("jwt").
 * @property {string} secret - Clé secrète pour signer les JWT.
 * @property {object} pages - Pages personnalisées pour l'authentification.
 * @property {string} pages.signIn - Page de connexion.
 * @property {Array<Provider>} providers - Fournisseurs d'authentification.
 * @property {object} callbacks - Callbacks pour gérer les événements d'authentification.
 */
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
       /**
        * @async
        * @function authorize
        * @description Vérifie les informations d'identification de l'utilisateur.
        * @param {object} credentials - Informations d'identification (email, mot de passe).
        * @returns {Promise<User|null>} L'objet utilisateur si l'authentification réussit, sinon null.
        */
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
     /**
      * @async
      * @function jwt
      * @description Callback pour créer et mettre à jour le JWT.
      * @param {object} params - Paramètres du callback.
      * @param {JWT} params.token - Le token JWT.
      * @param {User} params.user - L'objet utilisateur (uniquement lors de la connexion).
      * @returns {Promise<JWT>} Le token JWT mis à jour.
      */
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
     /**
      * @async
      * @function session
      * @description Callback pour créer et mettre à jour l'objet de session.
      * @param {object} params - Paramètres du callback.
      * @param {Session} params.session - L'objet de session.
      * @param {JWT} params.token - Le token JWT.
      * @returns {Promise<Session>} L'objet de session mis à jour.
      */
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

 export const {
   handlers: { GET, POST },
   auth,
   signIn,
   signOut,
 } = NextAuth(authOptions);
