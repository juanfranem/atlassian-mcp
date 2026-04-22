import { z } from 'zod';
import type { ToolDefinition } from '../../../shared/registry.js';
import type { JiraHttpClient } from '../../../http/jira.client.js';
import { JiraProjectsService, formatProjects, formatFields } from './service.js';
import { toToolError } from '../../../shared/errors.js';

export function createProjectTools(client: JiraHttpClient): ToolDefinition[] {
  const service = new JiraProjectsService(client);

  const jiraGetProjects: ToolDefinition = {
    name: 'jira_get_projects',
    description: 'List accessible Jira projects.',
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional().describe('Max number of projects to return (default: 50)'),
    },
    readonly: true,
    async handler({ limit }: { limit?: number }) {
      try {
        const projects = await service.getProjects(limit ?? 50);
        return formatProjects(projects);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  const jiraGetFields: ToolDefinition = {
    name: 'jira_get_fields',
    description: 'Get all Jira field definitions (system and custom fields).',
    inputSchema: {},
    readonly: true,
    async handler(_args: Record<string, never>) {
      try {
        const fields = await service.getFields();
        return formatFields(fields);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  return [jiraGetProjects, jiraGetFields];
}
