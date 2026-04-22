import { homedir } from 'node:os';
import { join } from 'node:path';
import type { OpenCodeFormat, OpenCodeEntry, McpServerEntry, Scope } from '../types.js';
import { readJsonFile, writeJsonFile } from '../config-writer.js';

function getConfigPath(scope: Scope): string {
  if (scope === 'global') {
    return join(homedir(), '.config', 'opencode', 'opencode.json');
  }
  return join(process.cwd(), 'opencode.json');
}

export async function configure(entry: McpServerEntry, scope: Scope): Promise<string> {
  const configPath = getConfigPath(scope);
  const existing = await readJsonFile<OpenCodeFormat>(configPath);
  const config: OpenCodeFormat = existing ?? {};
  const ocEntry: OpenCodeEntry = {
    type: 'local',
    command: ['npx', '-y', '@juanfranem/atlassian-mcp'],
    enabled: true,
    environment: entry.env,
  };
  config.mcp = { ...config.mcp, atlassian: ocEntry };
  await writeJsonFile(configPath, config);
  return configPath;
}
