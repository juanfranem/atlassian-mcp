import { z } from 'zod';

export const AuthTypeSchema = z.enum(['basic', 'pat']);
export type AuthType = z.infer<typeof AuthTypeSchema>;

const BaseServiceSchema = z.object({
  url: z.url({ error: 'Must be a valid URL' }),
  authType: AuthTypeSchema,
  username: z.string().optional(),
  apiToken: z.string().optional(),
  personalToken: z.string().optional(),
  sslVerify: z.boolean().default(true),
  timeoutMs: z.number().int().min(1000).max(300_000).default(30_000),
  httpProxy: z.string().optional(),
  httpsProxy: z.string().optional(),
});

export const JiraConfigSchema = BaseServiceSchema.extend({
  projectsFilter: z.array(z.string()).default([]),
}).refine(
  (cfg) =>
    cfg.authType === 'pat'
      ? cfg.personalToken != null
      : cfg.username != null && cfg.apiToken != null,
  { message: 'Invalid auth config: basic requires username+apiToken, pat requires personalToken' },
);

export const ConfluenceConfigSchema = BaseServiceSchema.extend({
  spacesFilter: z.array(z.string()).default([]),
}).refine(
  (cfg) =>
    cfg.authType === 'pat'
      ? cfg.personalToken != null
      : cfg.username != null && cfg.apiToken != null,
  { message: 'Invalid auth config: basic requires username+apiToken, pat requires personalToken' },
);

export const ServerConfigSchema = z.object({
  transport: z.enum(['stdio', 'sse', 'streamable-http']).default('stdio'),
  port: z.number().int().min(1).max(65535).default(8000),
  host: z.string().default('0.0.0.0'),
  readOnlyMode: z.boolean().default(true),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('warn'),
});

export const AppConfigSchema = z.object({
  server: ServerConfigSchema,
  jira: JiraConfigSchema.optional(),
  confluence: ConfluenceConfigSchema.optional(),
});

export type JiraConfig = z.infer<typeof JiraConfigSchema>;
export type ConfluenceConfig = z.infer<typeof ConfluenceConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
