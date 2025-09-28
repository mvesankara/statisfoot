import assert from "node:assert/strict";
import test from "node:test";

import { isAuthorized, resolveRequiredPermission } from "../src/middleware";
import { PERMISSIONS, ROLES } from "../src/lib/rbac";
import type { Role } from "@prisma/client";

test("/reports/new requires reports:create permission", () => {
  const permission = resolveRequiredPermission("/reports/new");
  assert.equal(permission, PERMISSIONS["reports:create"]);
});

test("/reports section fallback requires reports:read", () => {
  const permission = resolveRequiredPermission("/reports");
  assert.equal(permission, PERMISSIONS["reports:read"]);
});

test("scout with reports:create can access /reports/new", () => {
  const scoutRole = ROLES.SCOUT as Role;
  assert.ok(isAuthorized(scoutRole, "/reports/new"));
});

test("scout without reports:read cannot access /reports", () => {
  const scoutRole = ROLES.SCOUT as Role;
  assert.ok(!isAuthorized(scoutRole, "/reports"));
});
