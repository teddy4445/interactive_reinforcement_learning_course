import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
let server;
let code;
try {
  // Keep preview lifecycle in this process to avoid orphaned npm.cmd children on Windows.
  if (args[0] === 'test') {
    const { startStaticServer } = await import('./static-preview.mjs');
    server = await startStaticServer({ port: 4173 });
  }
  const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', ...args], {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || resolve('.local/browsers') },
  });
  code = await new Promise((resolveCode, reject) => {
    child.once('error', reject);
    child.once('exit', (status) => resolveCode(status ?? 1));
  });
} finally {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  }
}
process.exitCode = code;


