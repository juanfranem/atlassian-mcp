import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { EnvBlock, ServiceConfig, McpServerEntry } from './types.js';
import { SetupError } from './types.js';

export async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    if (err instanceof SyntaxError) {
      throw new SetupError(
        `Cannot parse existing config at ${filePath} — fix the JSON or delete it and re-run setup.`,
        filePath,
      );
    }
    throw err;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDir(filePath);
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function buildMcpEntry(envBlock: EnvBlock): McpServerEntry {
  return {
    command: 'npx',
    args: ['-y', 'atlassian-mcp'],
    env: envBlock,
  };
}

export function buildEnvBlock(services: ServiceConfig[]): EnvBlock {
  const env: EnvBlock = {};
  for (const svc of services) {
    if (svc.service === 'jira') {
      env['JIRA_URL'] = svc.url;
      if (svc.authType === 'apiToken') {
        if (svc.username) env['JIRA_USERNAME'] = svc.username;
        env['JIRA_API_TOKEN'] = svc.token;
      } else {
        env['JIRA_PERSONAL_TOKEN'] = svc.token;
      }
    } else {
      env['CONFLUENCE_URL'] = svc.url;
      if (svc.authType === 'apiToken') {
        if (svc.username) env['CONFLUENCE_USERNAME'] = svc.username;
        env['CONFLUENCE_API_TOKEN'] = svc.token;
      } else {
        env['CONFLUENCE_PERSONAL_TOKEN'] = svc.token;
      }
    }
  }
  return env;
}
