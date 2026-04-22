import * as p from '@clack/prompts';
import { isCancel } from '@clack/prompts';
import type { Service, ServiceConfig, DeploymentType, AuthType, Provider, Scope, WizardResult } from './types.js';

function bail(reason?: string): never {
  p.cancel(reason ?? 'Setup cancelled.');
  process.exit(0);
}

function check<T>(value: T | symbol): T {
  if (isCancel(value)) bail();
  return value as T;
}

async function collectServiceConfig(service: Service): Promise<ServiceConfig> {
  const label = service === 'jira' ? 'Jira' : 'Confluence';

  const deployment = check(
    await p.select<DeploymentType>({
      message: `${label} deployment type`,
      options: [
        { value: 'cloud', label: 'Cloud (Atlassian Cloud / atlassian.net)' },
        { value: 'server', label: 'Server / Data Center (self-hosted)' },
      ],
    }),
  );

  const url = check(
    await p.text({
      message: `${label} instance URL`,
      placeholder: deployment === 'cloud' ? 'https://yourcompany.atlassian.net' : 'https://jira.yourcompany.com',
      validate(val): string | undefined {
        try {
          new URL(val ?? '');
        } catch {
          return 'Enter a valid URL including https://';
        }
        return undefined;
      },
    }),
  );

  const authOptions =
    deployment === 'cloud'
      ? [
          { value: 'apiToken' as AuthType, label: 'API Token (email + token from id.atlassian.com)' },
          { value: 'pat' as AuthType, label: 'Personal Access Token (PAT)' },
        ]
      : [
          { value: 'apiToken' as AuthType, label: 'Basic auth (username + password)' },
          { value: 'pat' as AuthType, label: 'Personal Access Token (PAT)' },
        ];

  const authType = check(
    await p.select<AuthType>({
      message: `${label} authentication type`,
      options: authOptions,
    }),
  );

  let username: string | undefined;
  if (authType === 'apiToken') {
    const userLabel = deployment === 'cloud' ? 'Email address' : 'Username';
    username = check(
      await p.text({
        message: `${label} ${userLabel}`,
        validate(val): string | undefined {
          if (!val?.trim()) return 'Required';
          return undefined;
        },
      }),
    );
  }

  const tokenLabel =
    authType === 'pat' ? 'Personal Access Token' : deployment === 'cloud' ? 'API Token' : 'Password';

  const token = check(
    await p.password({
      message: `${label} ${tokenLabel}`,
      validate(val): string | undefined {
        if (!val?.trim()) return 'Required';
        return undefined;
      },
    }),
  );

  return { service, deployment, url, authType, username, token };
}

export async function runWizard(): Promise<WizardResult> {
  // Read version from package.json
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const pkg = require('../../../package.json') as { version: string };

  p.intro(`atlassian-mcp setup  v${pkg.version}`);

  const selectedServices = check(
    await p.multiselect<Service>({
      message: 'Which services do you want to configure?',
      options: [
        { value: 'jira', label: 'Jira' },
        { value: 'confluence', label: 'Confluence' },
      ],
      required: true,
    }),
  );

  const services: ServiceConfig[] = [];
  for (const svc of selectedServices) {
    services.push(await collectServiceConfig(svc));
  }

  const provider = check(
    await p.select<Provider>({
      message: 'Which AI tool do you want to configure?',
      options: [
        { value: 'claude-desktop', label: 'Claude Desktop' },
        { value: 'claude-code', label: 'Claude Code (CLI)' },
        { value: 'cursor', label: 'Cursor' },
        { value: 'vscode', label: 'VS Code (with MCP extension)' },
        { value: 'windsurf', label: 'Windsurf' },
        { value: 'opencode', label: 'OpenCode' },
        { value: 'codex', label: 'OpenAI Codex CLI' },
        { value: 'manual', label: 'Manual (show config JSON to copy)' },
      ],
    }),
  );

  // Determine scope
  const alwaysGlobal = new Set<Provider>(['claude-desktop', 'windsurf']);
  const alwaysProject = new Set<Provider>(['vscode', 'manual']);

  let scope: Scope = 'global';
  if (!alwaysGlobal.has(provider) && !alwaysProject.has(provider)) {
    scope = check(
      await p.select<Scope>({
        message: 'Install scope',
        options: [
          { value: 'global', label: 'Global (applies to all projects)' },
          { value: 'project', label: 'Project (current directory only)' },
        ],
      }),
    );
  } else if (alwaysProject.has(provider)) {
    scope = 'project';
  }

  let generateSkills = false;
  let skillScope: Scope = scope;

  if (provider !== 'manual') {
    generateSkills = check(
      await p.confirm({
        message: 'Generate agent/skill context files so the AI knows how to use the tools?',
        initialValue: true,
      }),
    );

    if (generateSkills && !alwaysGlobal.has(provider) && !alwaysProject.has(provider)) {
      const differentScope = check(
        await p.confirm({
          message: `Use the same scope (${scope}) for skill files?`,
          initialValue: true,
        }),
      );
      if (!differentScope) {
        skillScope = check(
          await p.select<Scope>({
            message: 'Skill file scope',
            options: [
              { value: 'global', label: 'Global' },
              { value: 'project', label: 'Project' },
            ],
          }),
        );
      }
    }
  }

  return { services, provider, scope, generateSkills, skillScope };
}
