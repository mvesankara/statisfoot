const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const DEFAULT_ENV_FILES = [
  ".env.local",
  ".env.development.local",
  ".env.test.local",
  ".env.production.local",
  ".env",
  ".env.development",
  ".env.test",
  ".env.production",
];

function loadEnv(files = DEFAULT_ENV_FILES) {
  const cwd = process.cwd();

  for (const relativePath of files) {
    if (!relativePath) continue;

    const filePath = path.resolve(cwd, relativePath);
    if (!fs.existsSync(filePath)) continue;

    dotenv.config({ path: filePath, override: false });
  }
}

module.exports = {
  loadEnv,
  DEFAULT_ENV_FILES,
};
