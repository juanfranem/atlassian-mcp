import { z } from 'zod';
import type { ToolDefinition } from '../../../shared/registry.js';
import type { JiraHttpClient } from '../../../http/jira.client.js';
import { JiraIssuesService, formatIssue, formatSearchResults } from './service.js';
import { toToolError } from '../../../shared/errors.js';

export function createIssueTools(client: JiraHttpClient): ToolDefinition[] {
  const service = new JiraIssuesService(client);

  const jiraSearch: ToolDefinition = {
    name: 'jira_search',
    description:
      'Search Jira issues using JQL (Jira Query Language). Returns matching issues with key details.',
    inputSchema: {
      jql: z.string().describe('JQL query string (e.g. "project = PROJ AND status = Open")'),
      limit: z.number().int().min(1).max(100).optional().describe('Max results (1-100, default: 50)'),
      startAt: z.number().int().min(0).optional().describe('Offset for pagination (default: 0)'),
    },
    readonly: true,
    async handler({ jql, limit, startAt }: { jql: string; limit?: number; startAt?: number }) {
      try {
        const result = await service.searchIssues(jql, limit ?? 50, startAt ?? 0);
        return formatSearchResults(result);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  const jiraGetIssue: ToolDefinition = {
    name: 'jira_get_issue',
    description: 'Get a Jira issue by its key (e.g. PROJ-123) with full details.',
    inputSchema: {
      issueKey: z.string().describe('Issue key (e.g. PROJ-123)'),
    },
    readonly: true,
    async handler({ issueKey }: { issueKey: string }) {
      try {
        const issue = await service.getIssue(issueKey);
        return formatIssue(issue);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  return [jiraSearch, jiraGetIssue];
}
