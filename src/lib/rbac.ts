/**
 * @file Configuration du Contrôle d'Accès Basé sur les Rôles (RBAC).
 * @description Ce fichier définit les rôles, les permissions, et la relation entre eux (grants).
 * Il fournit également une fonction pour vérifier si un rôle possède une permission spécifique.
 */
import { UserRoleEnum } from "@prisma/client";

/**
 * @const {object} ROLES
 * @description Énumération des rôles disponibles dans l'application.
 */
export const ROLES = {
  SCOUT: UserRoleEnum.SCOUT,
  RECRUITER: UserRoleEnum.RECRUITER,
  AGENT: UserRoleEnum.AGENT,
  ADMIN: UserRoleEnum.ADMIN,
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * @const {object} PERMISSIONS
 * @description Énumération des permissions définies pour les actions dans l'application.
 */
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

/**
 * @const {Record<Role, (keyof typeof PERMISSIONS)[]>} GRANTS
 * @description Mappe chaque rôle à un tableau de permissions qui lui sont accordées.
 */
export const GRANTS: Record<AppRole, (keyof typeof PERMISSIONS)[]> = {
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

/**
 * @function hasPermission
 * @description Vérifie si un rôle donné possède une permission spécifique.
 * @param {Role} role - Le rôle de l'utilisateur.
 * @param {keyof typeof PERMISSIONS} permission - La permission à vérifier.
 * @returns {boolean} `true` si le rôle a la permission, sinon `false`.
 */
export function hasPermission(role: AppRole, permission: keyof typeof PERMISSIONS) {
  return GRANTS[role]?.includes(permission) ?? false;
}
