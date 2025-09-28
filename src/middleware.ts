/**
 * @file Middleware pour la protection des routes.
 * @description Ce middleware utilise NextAuth pour protéger les routes de l'application.
 * Il vérifie si un utilisateur est authentifié et s'il a les permissions nécessaires
 * pour accéder à une route spécifique en se basant sur son rôle (RBAC).
 */
import { withAuth } from "next-auth/middleware";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

/**
 * @const {RoutePermission[]} ROUTE_PERMISSIONS
 * @description Liste ordonnée des préfixes de route et des permissions requises pour y accéder.
 */
type RoutePermission = {
  prefix: string;
  permission: keyof typeof PERMISSIONS;
};

const ROUTE_PERMISSIONS: RoutePermission[] = [
  { prefix: "/admin", permission: PERMISSIONS["admin:access"] },
  { prefix: "/players", permission: PERMISSIONS["players:read"] },
  { prefix: "/reports/new", permission: PERMISSIONS["reports:create"] },
  { prefix: "/reports", permission: PERMISSIONS["reports:read"] },
];

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;

      const path = req.nextUrl.pathname;
      const role = token.role as Role;

      const orderedRoutePermissions = [...ROUTE_PERMISSIONS].sort(
        (a, b) => b.prefix.length - a.prefix.length,
      );

      for (const { prefix, permission } of orderedRoutePermissions) {
        if (path.startsWith(prefix)) {
          return hasPermission(role, permission);
        }
      }

      return true; // Pour les routes non mappées comme /profile
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
