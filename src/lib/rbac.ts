import type { Role } from "@prisma/client";

export const ROLES = {
  SCOUT: "SCOUT",
  RECRUITER: "RECRUITER",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
} as const;

export const PERMISSIONS = {
  "players:read": "players:read",
  "players:create": "players:create",
  "players:update": "players:update",
  "players:delete": "players:delete",
  "reports:read": "reports:read",
  "reports:create": "reports:create",
  "reports:update": "reports:update",
  "reports:delete": "reports:delete",
  "admin:access": "admin:access",
} as const;

export const GRANTS: Record<Role, (keyof typeof PERMISSIONS)[]> = {
  [ROLES.SCOUT]: [PERMISSIONS["players:read"], PERMISSIONS["reports:create"]],
  [ROLES.RECRUITER]: [
    PERMISSIONS["players:read"],
    PERMISSIONS["players:create"],
    PERMISSIONS["reports:read"],
  ],
  [ROLES.AGENT]: [
    PERMISSIONS["players:read"],
    PERMISSIONS["players:create"],
    PERMISSIONS["players:update"],
    PERMISSIONS["reports:read"],
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

export function hasPermission(role: Role, permission: keyof typeof PERMISSIONS) {
  return GRANTS[role]?.includes(permission) ?? false;
}
