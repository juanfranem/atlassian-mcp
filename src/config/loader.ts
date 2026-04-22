import 'dotenv/config';
import type { AppConfig, JiraConfig, ConfluenceConfig, ServerConfig } from './schema.js';
import {
  JiraConfigSchema,
  ConfluenceConfigSchema,
  ServerConfigSchema,
  AppConfigSchema,
} from './schema.js';

function parseAuthType(url: string | undefined): 'basic' | 'pat' {
  if (!url) return 'basic';
  const hasPatToken =
    process.env['JIRA_PERSONAL_TOKEN'] ?? process.env['CONFLUENCE_PERSONAL_TOKEN'];
  return hasPatToken ? 'pat' : 'basic';
}

function parseCsvFilter(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function loadJiraConfig(): JiraConfig | undefined {
  const url = process.env['JIRA_URL'];
  if (!url) return undefined;

  const personalToken = process.env['JIRA_PERSONAL_TOKEN'];
  const authType = personalToken ? 'pat' : 'basic';

  return JiraConfigSchema.parse({
    url,
    authType,
    username: process.env['JIRA_USERNAME'],
    apiToken: process.env['JIRA_API_TOKEN'],
    personalToken,
    sslVerify: process.env['JIRA_SSL_VERIFY'] !== 'false',
    timeoutMs: process.env['JIRA_TIMEOUT_MS'] ? parseInt(process.env['JIRA_TIMEOUT_MS'], 10) : undefined,
    httpProxy: process.env['HTTP_PROXY'],
    httpsProxy: process.env['HTTPS_PROXY'],
    projectsFilter: parseCsvFilter(process.env['JIRA_PROJECTS_FILTER']),
  });
}

function loadConfluenceConfig(): ConfluenceConfig | undefined {
  const url = process.env['CONFLUENCE_URL'];
  if (!url) return undefined;

  const personalToken = process.env['CONFLUENCE_PERSONAL_TOKEN'];
  const authType = personalToken ? 'pat' : 'basic';

  return ConfluenceConfigSchema.parse({
    url,
    authType,
    username: process.env['CONFLUENCE_USERNAME'],
    apiToken: process.env['CONFLUENCE_API_TOKEN'],
    personalToken,
    sslVerify: process.env['CONFLUENCE_SSL_VERIFY'] !== 'false',
    timeoutMs: process.env['CONFLUENCE_TIMEOUT_MS']
      ? parseInt(process.env['CONFLUENCE_TIMEOUT_MS'], 10)
      : undefined,
    httpProxy: process.env['HTTP_PROXY'],
    httpsProxy: process.env['HTTPS_PROXY'],
    spacesFilter: parseCsvFilter(process.env['CONFLUENCE_SPACES_FILTER']),
  });
}

function loadServerConfig(): ServerConfig {
  return ServerConfigSchema.parse({
    transport: process.env['TRANSPORT'],
    port: process.env['PORT'] ? parseInt(process.env['PORT'], 10) : undefined,
    host: process.env['HOST'],
    readOnlyMode: process.env['READ_ONLY_MODE'] !== 'false',
    logLevel: process.env['LOG_LEVEL'],
  });
}

export function loadConfig(): AppConfig {
  const jira = loadJiraConfig();
  const confluence = loadConfluenceConfig();

  if (!jira && !confluence) {
    throw new Error(
      'No service configured. Set JIRA_URL and/or CONFLUENCE_URL environment variables.',
    );
  }

  return AppConfigSchema.parse({
    server: loadServerConfig(),
    jira,
    confluence,
  });
}

// Suppress unused warning — only used for type-narrowing side effect
void parseAuthType;
