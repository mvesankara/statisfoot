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
  {
    name: "/players/new requires players:create permission",
    run: () => {
      const permission = resolveRequiredPermission("/players/new");
      assert.equal(permission, PERMISSIONS["players:create"]);
    },
  },
  {
    name: "recruiter can access /players/new",
    run: () => {
      const recruiterRole = ROLES.RECRUITER;
      assert.ok(isAuthorized(recruiterRole, "/players/new"));
    },
  },
  {
    name: "scout cannot access /players/new",
    run: () => {
      const scoutRole = ROLES.SCOUT;
      assert.ok(!isAuthorized(scoutRole, "/players/new"));
    },
  },
];

void runTests(tests);
