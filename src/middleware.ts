import { withAuth } from "next-auth/middleware";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

const ROUTE_PERMISSIONS: Record<string, keyof typeof PERMISSIONS> = {
  "/admin": PERMISSIONS["admin:access"],
  "/players": PERMISSIONS["players:read"],
  "/reports": PERMISSIONS["reports:read"],
};

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;

      const path = req.nextUrl.pathname;
      const role = token.role as Role;

      for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
        if (path.startsWith(route)) {
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
