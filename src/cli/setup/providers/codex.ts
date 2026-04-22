import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { parse, stringify } from 'smol-toml';
import type { McpServerEntry, Scope } from '../types.js';
import { ensureDir } from '../config-writer.js';
import { SetupError } from '../types.js';

function getConfigPath(scope: Scope): string {
  if (scope === 'global') {
    return join(homedir(), '.codex', 'config.toml');
  }
  return join(process.cwd(), '.codex', 'config.toml');
}

export async function configure(entry: McpServerEntry, scope: Scope): Promise<string> {
  const configPath = getConfigPath(scope);

  let parsed: Record<string, unknown> = {};
  try {
    const content = await readFile(configPath, 'utf-8');
    parsed = parse(content) as Record<string, unknown>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      if (err instanceof Error && err.message.includes('parse')) {
        throw new SetupError(
          `Cannot parse existing TOML config at ${configPath} — fix it and re-run setup.`,
          configPath,
        );
      }
      throw err;
    }
  }

  const mcpServers = (parsed['mcp_servers'] ?? {}) as Record<string, unknown>;
  mcpServers['atlassian'] = {
    command: 'npx',
    args: ['-y', 'atlassian-mcp'],
    env: entry.env,
  };
  parsed['mcp_servers'] = mcpServers;

  await ensureDir(configPath);
  await writeFile(configPath, stringify(parsed), 'utf-8');
  return configPath;
}
