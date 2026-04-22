#!/usr/bin/env node
import { loadConfig } from './config/loader.js';
import { initLogger, getLogger } from './shared/logger.js';
import { startServer } from './server.js';

async function main(): Promise<void> {
  const [,, command] = process.argv;
  if (command === 'setup' || command === 'init') {
    const { runSetup } = await import('./cli/setup/index.js');
    await runSetup();
    process.exit(0);
  }

  const config = loadConfig();
  initLogger(config.server.logLevel);

  const log = getLogger('Main');
  log.info(`Starting atlassian-mcp (transport=${config.server.transport}, readOnly=${config.server.readOnlyMode})`);

  await startServer(config);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Fatal: ${message}\n`);
  process.exit(1);
});
