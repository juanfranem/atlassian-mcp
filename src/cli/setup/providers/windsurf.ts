import { homedir } from 'node:os';
import { join } from 'node:path';
import type { McpServersFormat, McpServerEntry } from '../types.js';
import { readJsonFile, writeJsonFile, buildMcpEntry } from '../config-writer.js';

function getConfigPath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env['APPDATA'] ?? join(home, 'AppData', 'Roaming');
    return join(appData, 'Codeium', 'windsurf', 'mcp_config.json');
  }
  return join(home, '.codeium', 'windsurf', 'mcp_config.json');
}

export async function configure(entry: McpServerEntry): Promise<string> {
  const configPath = getConfigPath();
  const existing = await readJsonFile<McpServersFormat>(configPath);
  const config: McpServersFormat = existing ?? {};
  config.mcpServers = { ...config.mcpServers, atlassian: buildMcpEntry(entry.env) };
  await writeJsonFile(configPath, config);
  return configPath;
}
