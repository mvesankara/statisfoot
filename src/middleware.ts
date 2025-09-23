/**
 * @file Middleware pour la protection des routes.
 * @description Ce middleware utilise NextAuth (v5) pour protéger les routes de l'application.
 * Il vérifie si un utilisateur est authentifié et s'il a les permissions nécessaires
 * pour accéder à une route spécifique en se basant sur son rôle (RBAC).
 */
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

/**
 * @const {Record<string, keyof typeof PERMISSIONS>} ROUTE_PERMISSIONS
 * @description Mappe les préfixes de route aux permissions requises pour y accéder.
 */
const ROUTE_PERMISSIONS: Record<string, keyof typeof PERMISSIONS> = {
  "/admin": "admin:access",
  "/players": "players:read",
  "/reports": "reports:read",
};

export default auth((req) => {
  // `auth` de NextAuth gère automatiquement la redirection des utilisateurs non authentifiés.
  // Si `req.auth` est null, l'utilisateur sera redirigé vers la page de connexion.
  const { auth } = req;
  const { pathname } = req.nextUrl;

  // Si l'utilisateur n'est pas authentifié, la protection est déjà gérée par la redirection.
  // La logique ci-dessous s'exécute uniquement pour les utilisateurs authentifiés.
  if (!auth) {
    // Ceci est une double sécurité, normalement `auth` redirige déjà.
    return false;
  }

  // Récupérer le rôle de l'utilisateur depuis la session
  const role = auth.user?.role as Role | undefined;

  // Vérifier les permissions pour les routes protégées par RBAC
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (!role || !hasPermission(role, permission)) {
        // Rediriger vers une page d'accès refusé ou la page d'accueil si l'utilisateur n'a pas la permission
        // Pour l'instant, nous retournons `false`, ce qui devrait provoquer une redirection vers la page de connexion.
        // Une meilleure approche serait de rediriger vers une page `/unauthorized`.
        return false;
      }
    }
  }

  // Autoriser l'accès pour toutes les autres routes authentifiées (ex: /profile, /dashboard)
  return true;
});

// Appliquer le middleware à toutes les routes spécifiées
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/reports/:path*",
    "/players/:path*",
    "/admin/:path*",
  ],
};
