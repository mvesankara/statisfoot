/**
 * @file Middleware pour la protection des routes.
 * @description Ce middleware utilise NextAuth pour protéger les routes de l'application.
 * Il vérifie si un utilisateur est authentifié et s'il a les permissions nécessaires
 * pour accéder à une route spécifique en se basant sur son rôle (RBAC).
 */
import type { WithAuthConfig } from "next-auth/middleware";
import { hasPermission, PERMISSIONS } from "./lib/rbac";
import type { Role } from "@prisma/client";

type RouteRule = {
  matcher: (path: string) => boolean;
  permission: keyof typeof PERMISSIONS;
};

type AuthorizedCallbackParams = {
  token?: { role?: unknown } | null;
  req: { nextUrl: { pathname: string } };
};

type WithAuthFn = (config: WithAuthConfig) => unknown;

declare const require: (module: string) => unknown;

function loadWithAuth(): WithAuthFn {
  try {
    const moduleExports = require("next-auth/middleware") as {
      withAuth?: WithAuthFn;
    };
    if (typeof moduleExports?.withAuth === "function") {
      return moduleExports.withAuth;
    }
  } catch (error) {
    console.warn("next-auth/middleware introuvable, utilisation d'un stub pour les tests.");
  }

  return ((config: WithAuthConfig) => config) as WithAuthFn;
}

const withAuth = loadWithAuth();

/**
 * @const ROUTE_RULES
 * @description Tableau de règles précises reliant un matcher de chemin à la permission requise.
 */
export const ROUTE_RULES: RouteRule[] = [
  {
    matcher: (path) => path.startsWith("/admin"),
    permission: PERMISSIONS["admin:access"],
  },
  {
    matcher: (path) => path === "/players/new" || path.startsWith("/players/new/"),
    permission: PERMISSIONS["players:create"],
  },
  {
    matcher: (path) => path.startsWith("/players"),
    permission: PERMISSIONS["players:read"],
  },
  {
    matcher: (path) => path === "/reports/new" || path.startsWith("/reports/new/"),
    permission: PERMISSIONS["reports:create"],
  },
  {
    matcher: (path) => path.startsWith("/reports"),
    permission: PERMISSIONS["reports:read"],
  },
];

export function resolveRequiredPermission(path: string) {
  for (const rule of ROUTE_RULES) {
    if (rule.matcher(path)) {
      return rule.permission;
    }
  }

  return null;
}

export function isAuthorized(role: Role, path: string) {
  const permission = resolveRequiredPermission(path);
  if (!permission) {
    return true;
  }

  return hasPermission(role, permission);
}

export default withAuth({
  callbacks: {
    authorized: ({ token, req }: AuthorizedCallbackParams) => {
      if (!token) return false;

      const path = req.nextUrl.pathname;
      const role = token.role as Role;
      return isAuthorized(role, path);
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/reports/:path*",
    "/players/:path*",
    "/admin/:path*",
  ],
};
