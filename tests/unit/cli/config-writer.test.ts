import { describe, it, expect, beforeEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { readJsonFile, writeJsonFile, buildEnvBlock } from '../../../src/cli/setup/config-writer.js';
import type { ServiceConfig } from '../../../src/cli/setup/types.js';
import { SetupError } from '../../../src/cli/setup/types.js';

let testDir: string;

beforeEach(async () => {
  testDir = join(tmpdir(), `atlassian-mcp-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });
});

describe('readJsonFile', () => {
  it('returns null for missing file', async () => {
    const result = await readJsonFile(join(testDir, 'missing.json'));
    expect(result).toBeNull();
  });

  it('parses valid JSON', async () => {
    const filePath = join(testDir, 'valid.json');
    await writeFile(filePath, '{"key":"value"}', 'utf-8');
    const result = await readJsonFile<{ key: string }>(filePath);
    expect(result).toEqual({ key: 'value' });
  });

  it('throws SetupError for malformed JSON', async () => {
    const filePath = join(testDir, 'bad.json');
    await writeFile(filePath, '{invalid json}', 'utf-8');
    await expect(readJsonFile(filePath)).rejects.toBeInstanceOf(SetupError);
  });
});

describe('writeJsonFile', () => {
  it('creates file with formatted JSON', async () => {
    const filePath = join(testDir, 'nested', 'out.json');
    await writeJsonFile(filePath, { a: 1 });
    const result = await readJsonFile<{ a: number }>(filePath);
    expect(result).toEqual({ a: 1 });
  });

  it('creates parent directories automatically', async () => {
    const filePath = join(testDir, 'deep', 'nested', 'dir', 'out.json');
    await expect(writeJsonFile(filePath, {})).resolves.not.toThrow();
  });
});

describe('buildEnvBlock', () => {
  it('builds Jira Cloud API Token env vars', () => {
    const services: ServiceConfig[] = [
      {
        service: 'jira',
        deployment: 'cloud',
        url: 'https://company.atlassian.net',
        authType: 'apiToken',
        username: 'user@example.com',
        token: 'mytoken',
      },
    ];
    const env = buildEnvBlock(services);
    expect(env).toEqual({
      JIRA_URL: 'https://company.atlassian.net',
      JIRA_USERNAME: 'user@example.com',
      JIRA_API_TOKEN: 'mytoken',
    });
  });

  it('builds Jira PAT env vars', () => {
    const services: ServiceConfig[] = [
      {
        service: 'jira',
        deployment: 'server',
        url: 'https://jira.example.com',
        authType: 'pat',
        token: 'my-pat',
      },
    ];
    const env = buildEnvBlock(services);
    expect(env).toEqual({
      JIRA_URL: 'https://jira.example.com',
      JIRA_PERSONAL_TOKEN: 'my-pat',
    });
  });

  it('builds Confluence API Token env vars', () => {
    const services: ServiceConfig[] = [
      {
        service: 'confluence',
        deployment: 'cloud',
        url: 'https://company.atlassian.net/wiki',
        authType: 'apiToken',
        username: 'user@example.com',
        token: 'conftoken',
      },
    ];
    const env = buildEnvBlock(services);
    expect(env).toEqual({
      CONFLUENCE_URL: 'https://company.atlassian.net/wiki',
      CONFLUENCE_USERNAME: 'user@example.com',
      CONFLUENCE_API_TOKEN: 'conftoken',
    });
  });

  it('builds combined Jira + Confluence env vars', () => {
    const services: ServiceConfig[] = [
      { service: 'jira', deployment: 'cloud', url: 'https://a.atlassian.net', authType: 'pat', token: 'jpat' },
      {
        service: 'confluence',
        deployment: 'cloud',
        url: 'https://a.atlassian.net/wiki',
        authType: 'apiToken',
        username: 'u@e.com',
        token: 'ctoken',
      },
    ];
    const env = buildEnvBlock(services);
    expect(env['JIRA_PERSONAL_TOKEN']).toBe('jpat');
    expect(env['CONFLUENCE_API_TOKEN']).toBe('ctoken');
    expect(env['CONFLUENCE_USERNAME']).toBe('u@e.com');
  });

  it('omits username when not provided', () => {
    const services: ServiceConfig[] = [
      {
        service: 'jira',
        deployment: 'cloud',
        url: 'https://a.atlassian.net',
        authType: 'apiToken',
        token: 'tok',
      },
    ];
    const env = buildEnvBlock(services);
    expect('JIRA_USERNAME' in env).toBe(false);
  });
});
