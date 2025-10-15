#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { join } = require('node:path');

function run(command, args, { shell = false } = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell,
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error(`Unable to execute \`${command}\`. Is it installed and available on your PATH?`);
    } else {
      console.error(result.error);
    }
    return 1;
  }

  if (typeof result.status === 'number') {
    return result.status;
  }

  if (result.signal) {
    process.kill(process.pid, result.signal);
  }

  return 1;
}

function ensureBuild() {
  const buildIdPath = join(process.cwd(), '.next', 'BUILD_ID');
  if (existsSync(buildIdPath)) {
    console.log('Using existing production build found at .next/BUILD_ID.');
    return true;
  }

  console.log('No production build detected. Running `npm run build` before starting Next.js...');
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const buildStatus = run(npmCommand, ['run', 'build']);
  if (buildStatus !== 0) {
    console.error('`npm run build` failed; aborting start.');
    process.exit(buildStatus);
  }

  return existsSync(buildIdPath);
}

if (!ensureBuild()) {
  console.error('No production build found even after running `npm run build`. Aborting.');
  process.exit(1);
}

const nextBinary = process.platform === 'win32'
  ? join(process.cwd(), 'node_modules', '.bin', 'next.cmd')
  : join(process.cwd(), 'node_modules', '.bin', 'next');
const startArgs = ['start', ...process.argv.slice(2)];
const startStatus = run(nextBinary, startArgs);
process.exit(startStatus);
