import { join } from 'node:path';
import type { VsCodeFormat, McpServerEntry } from '../types.js';
import { readJsonFile, writeJsonFile, buildMcpEntry } from '../config-writer.js';

function getConfigPath(): string {
  return join(process.cwd(), '.vscode', 'mcp.json');
}

export async function configure(entry: McpServerEntry): Promise<string> {
  const configPath = getConfigPath();
  const existing = await readJsonFile<VsCodeFormat>(configPath);
  const config: VsCodeFormat = existing ?? {};
  config.servers = { ...config.servers, atlassian: buildMcpEntry(entry.env) };
  await writeJsonFile(configPath, config);
  return configPath;
}
