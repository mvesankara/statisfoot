import NextAuth, {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";

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

const AUTH_BASE_URL = computeAuthBaseUrl();
const GOOGLE_REDIRECT_URI = `${AUTH_BASE_URL}/api/auth/callback/google`;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Provide a secret via AUTH_SECRET (or NEXTAUTH_SECRET for backwards compatibility).
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      authorization: {
        params: {
          redirect_uri: GOOGLE_REDIRECT_URI,
          prompt: "consent",
          access_type: "offline",
        },
      },
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const dbUser = await upsertGoogleUser({
          email,
          name: user.name ?? profile?.name ?? null,
          image: user.image ?? null,
        });

        if (!dbUser) return false;

        user.id = dbUser.id;
        user.name = dbUser.displayName ?? dbUser.email;
        user.email = dbUser.email;
        user.image = dbUser.avatarUrl ?? user.image;
        user.role = dbUser.roles[0]?.role?.name ?? null;
        user.displayName = dbUser.displayName;
        user.username = dbUser.username;
        user.emailVerified = dbUser.emailVerified ?? null;
      }

      return true;
    },
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


function computeAuthBaseUrl() {
  const candidates = [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter(Boolean) as string[];

  if (candidates.length === 0) {
    throw new Error(
      "Aucune URL d'authentification n'est définie. Renseignez AUTH_URL ou NEXTAUTH_URL."
    );
  }

  const base = candidates[0]!;

  return base.replace(/\/?$/, "");
}

function requiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`La variable d'environnement ${key} est obligatoire pour l'authentification.`);
  }

  return value;
}



async function upsertGoogleUser({
  email,
  name,
  image,
}: {
  email: string;
  name: string | null;
  image: string | null;
}) {
  const existing = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: { role: true },
        orderBy: { assignedAt: "asc" },
      },
    },
  });

  if (existing) {
    const needsUpdate =
      (!existing.displayName && name) ||
      (!existing.avatarUrl && image) ||
      !existing.emailVerified;

    if (needsUpdate) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          displayName: existing.displayName ?? name ?? existing.email,
          avatarUrl: existing.avatarUrl ?? image,
          emailVerified: existing.emailVerified ?? new Date(),
        },
        include: {
          roles: {
            include: { role: true },
            orderBy: { assignedAt: "asc" },
          },
        },
      });

      return updated;
    }

    return existing;
  }

  const displayName = name ?? email.split("@")[0];
  const username = await generateUniqueUsername(displayName);
  const placeholderPassword = randomBytes(16).toString("hex");
  const hashedPass = await hash(placeholderPassword, 10);

  return prisma.user.create({
    data: {
      email,
      displayName,
      username,
      hashedPass,
      avatarUrl: image,
      emailVerified: new Date(),
    },
    include: {
      roles: {
        include: { role: true },
        orderBy: { assignedAt: "asc" },
      },
    },
  });
}

async function generateUniqueUsername(base: string) {
  const normalizedBase = base
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  const fallback = "user";
  const root = normalizedBase.length ? normalizedBase : fallback;

  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? root : `${root}${i + 1}`;
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }
  }

  return `${root}${Date.now()}`;
}
