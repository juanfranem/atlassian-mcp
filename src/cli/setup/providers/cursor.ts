import { homedir } from 'node:os';
import { join } from 'node:path';
import type { McpServersFormat, McpServerEntry, Scope } from '../types.js';
import { readJsonFile, writeJsonFile, buildMcpEntry } from '../config-writer.js';

function getConfigPath(scope: Scope): string {
  if (scope === 'global') {
    return join(homedir(), '.cursor', 'mcp.json');
  }
  return join(process.cwd(), '.cursor', 'mcp.json');
}

export async function configure(entry: McpServerEntry, scope: Scope): Promise<string> {
  const configPath = getConfigPath(scope);
  const existing = await readJsonFile<McpServersFormat>(configPath);
  const config: McpServersFormat = existing ?? {};
  config.mcpServers = { ...config.mcpServers, atlassian: buildMcpEntry(entry.env) };
  await writeJsonFile(configPath, config);
  return configPath;
}
