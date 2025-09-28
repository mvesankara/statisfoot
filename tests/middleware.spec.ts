import { isAuthorized, resolveRequiredPermission } from "../src/middleware";
import { PERMISSIONS, ROLES } from "../src/lib/rbac";
import { assert, runTests, type TestCase } from "./test-helpers.js";

const tests: TestCase[] = [
  {
    name: "/reports/new requires reports:create permission",
    run: () => {
      const permission = resolveRequiredPermission("/reports/new");
      assert.equal(permission, PERMISSIONS["reports:create"]);
    },
  },
  {
    name: "/reports section fallback requires reports:read",
    run: () => {
      const permission = resolveRequiredPermission("/reports");
      assert.equal(permission, PERMISSIONS["reports:read"]);
    },
  },
  {
    name: "scout with reports:create can access /reports/new",
    run: () => {
      const scoutRole = ROLES.SCOUT;
      assert.ok(isAuthorized(scoutRole, "/reports/new"));
    },
  },
  {
    name: "scout without reports:read cannot access /reports",
    run: () => {
      const scoutRole = ROLES.SCOUT;
      assert.ok(!isAuthorized(scoutRole, "/reports"));
    },
  },
];

void runTests(tests);
