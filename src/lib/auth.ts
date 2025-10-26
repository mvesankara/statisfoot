import NextAuth, {
  AuthError,
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { debug, debugError } from "@/lib/debug";

type UserRole = "ADMIN" | "SCOUT" | "COACH" | "RECRUITER" | "VIEWER" | "AGENT";

// Augmentation des types NextAuth pour inclure des champs personnalisés
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role?: UserRole | null;
      displayName?: string | null;
      username?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id?: string;
    role?: UserRole | null;
    displayName?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole | null;
    displayName?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}

const AUTH_BASE_URL = computeAuthBaseUrl();
const AUTH_SECRET = resolveAuthSecret(AUTH_BASE_URL);
const GOOGLE_REDIRECT_URI = `${AUTH_BASE_URL}/api/auth/callback/google`;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Provide a secret via AUTH_SECRET (or NEXTAUTH_SECRET for backwards compatibility).
  secret: AUTH_SECRET,
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
        debug("auth:credentials", "Tentative de connexion via Credentials", {
          email,
        });
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

        debug("auth:credentials", "Connexion réussie", {
          userId: user.id,
          role: primaryRole,
        });

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
          role: UserRole | null;
          displayName: string;
          username: string;
          emailVerified: Date | null;
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      debug("auth:signIn", "Callback signIn déclenché", {
        provider: account?.provider,
        userId: user.id,
      });
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
        debug("auth:signIn", "Utilisateur Google synchronisé", {
          userId: user.id,
          role: user.role,
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      debug("auth:jwt", "Callback JWT exécuté", {
        hasUser: Boolean(user),
        tokenUserId: token.userId,
      });
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
        debug("auth:jwt", "Token mis à jour depuis l'utilisateur", {
          userId: id,
          role,
        });
      }
      return token;
    },
    async session({ session, token }) {
      debug("auth:session", "Callback session exécuté", {
        tokenUserId: token.userId,
        hasSessionUser: Boolean(session.user),
      });
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
        debug("auth:session", "Session enrichie", {
          userId: session.user.id,
          role: session.user.role,
        });
      }
      return session;
    },
  },
};

const authHandler = NextAuth(authOptions);

export const handlers = { GET: authHandler, POST: authHandler };

export async function auth() {
  debug("auth", "Récupération de la session serveur");
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    if (error instanceof AuthError && error.type === "JWT_SESSION_ERROR") {
      console.warn(
        "Impossible de décrypter la session existante. La session est ignorée et un nouvel utilisateur devra se reconnecter.",
        error
      );
      debug("auth", "Échec de récupération de session (JWT_SESSION_ERROR)");
      return null;
    }

    debugError("auth", error);
    throw error;
  }
}


function computeAuthBaseUrl() {
  const candidates = [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter(Boolean) as string[];

  const base = candidates[0] ?? "http://localhost:3000";

  return base.replace(/\/?$/, "");
}

function resolveAuthSecret(baseUrl: string) {
  const explicitSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (explicitSecret) {
    return explicitSecret;
  }

  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i;
  if (localhostPattern.test(baseUrl)) {
    console.warn(
      "Aucune variable AUTH_SECRET ou NEXTAUTH_SECRET trouvée. Utilisation d'un secret de secours pour l'environnement local. Ne pas utiliser en production."
    );
    return "development-only-auth-secret-please-change-me";
  }

  throw new Error(
    "Les variables d'environnement AUTH_SECRET ou NEXTAUTH_SECRET sont obligatoires en production pour sécuriser NextAuth."
  );
}

function requiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    console.warn(
      `La variable d'environnement ${key} est absente. Une valeur de secours "missing-${key.toLowerCase()}" est utilisée pour la compilation.`
    );
    return `missing-${key.toLowerCase()}`;
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
  debug("auth:google", "Upsert d'un utilisateur Google", { email });
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
      debug("auth:google", "Mise à jour des informations Google", {
        userId: existing.id,
      });
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

  debug("auth:google", "Création d'un nouvel utilisateur Google", {
    email,
    username,
  });
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
      debug("auth:username", "Nom d'utilisateur disponible trouvé", {
        candidate,
      });
      return candidate;
    }
  }

  const fallbackCandidate = `${root}${Date.now()}`;
  debug("auth:username", "Utilisation du fallback pour le nom d'utilisateur", {
    fallback: fallbackCandidate,
  });
  return fallbackCandidate;
}
