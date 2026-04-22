import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JiraConfigSchema, ConfluenceConfigSchema, ServerConfigSchema } from '../../src/config/schema.js';

describe('JiraConfigSchema', () => {
  it('accepts valid basic auth config', () => {
    const result = JiraConfigSchema.safeParse({
      url: 'https://company.atlassian.net',
      authType: 'basic',
      username: 'user@example.com',
      apiToken: 'my-token',
      sslVerify: true,
      timeoutMs: 30000,
      projectsFilter: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid PAT config', () => {
    const result = JiraConfigSchema.safeParse({
      url: 'https://jira.company.com',
      authType: 'pat',
      personalToken: 'my-pat-token',
      sslVerify: true,
      timeoutMs: 30000,
      projectsFilter: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects basic auth without credentials', () => {
    const result = JiraConfigSchema.safeParse({
      url: 'https://company.atlassian.net',
      authType: 'basic',
      sslVerify: true,
      timeoutMs: 30000,
      projectsFilter: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL', () => {
    const result = JiraConfigSchema.safeParse({
      url: 'not-a-url',
      authType: 'basic',
      username: 'user',
      apiToken: 'token',
      sslVerify: true,
      timeoutMs: 30000,
      projectsFilter: [],
    });
    expect(result.success).toBe(false);
  });

  it('applies default values', () => {
    const result = JiraConfigSchema.safeParse({
      url: 'https://company.atlassian.net',
      authType: 'basic',
      username: 'user',
      apiToken: 'token',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sslVerify).toBe(true);
      expect(result.data.timeoutMs).toBe(30000);
      expect(result.data.projectsFilter).toEqual([]);
    }
  });
});

describe('ServerConfigSchema', () => {
  it('applies default values', () => {
    const result = ServerConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transport).toBe('stdio');
      expect(result.data.port).toBe(8000);
      expect(result.data.readOnlyMode).toBe(true);
      expect(result.data.logLevel).toBe('warn');
    }
  });

  it('accepts streamable-http transport', () => {
    const result = ServerConfigSchema.safeParse({ transport: 'streamable-http' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid transport', () => {
    const result = ServerConfigSchema.safeParse({ transport: 'invalid' });
    expect(result.success).toBe(false);
  });
});
