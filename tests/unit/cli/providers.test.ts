import { describe, it, expect, vi, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile, mkdir } from 'node:fs/promises';
import type { McpServerEntry } from '../../../src/cli/setup/types.js';

const testEntry: McpServerEntry = {
  command: 'npx',
  args: ['-y', 'atlassian-mcp'],
  env: { JIRA_URL: 'https://test.atlassian.net', JIRA_API_TOKEN: 'token' },
};

async function getTempDir(): Promise<string> {
  const dir = join(tmpdir(), `atlassian-mcp-prov-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

describe('vscode provider', () => {
  it('writes servers key (not mcpServers) to .vscode/mcp.json', async () => {
    const dir = await getTempDir();
    vi.stubEnv('PWD', dir);
    // Override cwd for this test
    const originalCwd = process.cwd;
    process.cwd = () => dir;

    try {
      const { configure } = await import('../../../src/cli/setup/providers/vscode.js');
      await configure(testEntry);
      const content = JSON.parse(await readFile(join(dir, '.vscode', 'mcp.json'), 'utf-8')) as {
        servers: Record<string, McpServerEntry>;
      };
      expect(content.servers).toBeDefined();
      expect(content.servers['atlassian']).toBeDefined();
      expect(content.servers['atlassian']?.command).toBe('npx');
    } finally {
      process.cwd = originalCwd;
    }
  });
});

describe('claude-code provider', () => {
  it('writes mcpServers key to .claude/settings.json (project scope)', async () => {
    const dir = await getTempDir();
    const originalCwd = process.cwd;
    process.cwd = () => dir;

    try {
      const { configure } = await import('../../../src/cli/setup/providers/claude-code.js');
      await configure(testEntry, 'project');
      const content = JSON.parse(await readFile(join(dir, '.claude', 'settings.json'), 'utf-8')) as {
        mcpServers: Record<string, McpServerEntry>;
      };
      expect(content.mcpServers?.['atlassian']?.command).toBe('npx');
    } finally {
      process.cwd = originalCwd;
    }
  });

  it('merges with existing config without overwriting other servers', async () => {
    const dir = await getTempDir();
    const originalCwd = process.cwd;
    process.cwd = () => dir;

    try {
      const claudeDir = join(dir, '.claude');
      await mkdir(claudeDir, { recursive: true });
      await (await import('node:fs/promises')).writeFile(
        join(claudeDir, 'settings.json'),
        JSON.stringify({ mcpServers: { other: { command: 'other', args: [], env: {} } } }),
        'utf-8',
      );

      const { configure } = await import('../../../src/cli/setup/providers/claude-code.js');
      await configure(testEntry, 'project');
      const content = JSON.parse(await readFile(join(dir, '.claude', 'settings.json'), 'utf-8')) as {
        mcpServers: Record<string, McpServerEntry>;
      };
      expect(content.mcpServers?.['other']).toBeDefined();
      expect(content.mcpServers?.['atlassian']).toBeDefined();
    } finally {
      process.cwd = originalCwd;
    }
  });
});

describe('cursor provider', () => {
  it('writes mcpServers to .cursor/mcp.json (project scope)', async () => {
    const dir = await getTempDir();
    const originalCwd = process.cwd;
    process.cwd = () => dir;

    try {
      const { configure } = await import('../../../src/cli/setup/providers/cursor.js');
      await configure(testEntry, 'project');
      const content = JSON.parse(await readFile(join(dir, '.cursor', 'mcp.json'), 'utf-8')) as {
        mcpServers: Record<string, McpServerEntry>;
      };
      expect(content.mcpServers?.['atlassian']?.args).toContain('@juanfranem/atlassian-mcp');
    } finally {
      process.cwd = originalCwd;
    }
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
