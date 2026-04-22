export type Service = 'jira' | 'confluence';
export type DeploymentType = 'cloud' | 'server';
export type AuthType = 'apiToken' | 'pat';
export type Scope = 'global' | 'project';
export type Provider =
  | 'claude-desktop'
  | 'claude-code'
  | 'cursor'
  | 'vscode'
  | 'windsurf'
  | 'opencode'
  | 'codex'
  | 'manual';

export interface ServiceConfig {
  service: Service;
  deployment: DeploymentType;
  url: string;
  authType: AuthType;
  username?: string;
  token: string;
}

export interface WizardResult {
  services: ServiceConfig[];
  provider: Provider;
  scope: Scope;
  generateSkills: boolean;
  skillScope: Scope;
}

export type EnvBlock = Record<string, string>;

export interface McpServerEntry {
  command: string;
  args: string[];
  env: EnvBlock;
}

export interface McpServersFormat {
  mcpServers?: Record<string, McpServerEntry>;
}

export interface VsCodeFormat {
  servers?: Record<string, McpServerEntry>;
}

export interface OpenCodeEntry {
  type: 'local';
  command: string[];
  enabled: boolean;
  environment: EnvBlock;
}

export interface OpenCodeFormat {
  mcp?: Record<string, OpenCodeEntry>;
}

export class SetupError extends Error {
  constructor(
    message: string,
    public readonly filePath?: string,
  ) {
    super(message);
    this.name = 'SetupError';
  }
}
