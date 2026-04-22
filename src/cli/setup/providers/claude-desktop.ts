import { homedir } from 'node:os';
import { join } from 'node:path';
import type { McpServersFormat, McpServerEntry } from '../types.js';
import { readJsonFile, writeJsonFile, buildMcpEntry } from '../config-writer.js';

function getConfigPath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env['APPDATA'] ?? join(home, 'AppData', 'Roaming');
    return join(appData, 'Claude', 'claude_desktop_config.json');
  }
  if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  }
  return join(home, '.config', 'Claude', 'claude_desktop_config.json');
}

export async function configure(entry: McpServerEntry): Promise<string> {
  const configPath = getConfigPath();
  const existing = await readJsonFile<McpServersFormat>(configPath);
  const config: McpServersFormat = existing ?? {};
  config.mcpServers = { ...config.mcpServers, atlassian: buildMcpEntry(entry.env) };
  await writeJsonFile(configPath, config);
  return configPath;
}
