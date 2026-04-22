import type { JiraHttpClient } from '../../../http/jira.client.js';
import {
  JiraIssueSchema,
  JiraSearchResponseSchema,
} from '../types.js';
import type { JiraIssue, JiraSearchResponse } from '../types.js';
import { getLogger } from '../../../shared/logger.js';

const log = getLogger('JiraIssuesService');

const DEFAULT_FIELDS =
  'summary,status,assignee,reporter,priority,issuetype,created,updated,duedate,labels,description,comment,fixVersions,components';

export class JiraIssuesService {
  constructor(private readonly client: JiraHttpClient) {}

  async searchIssues(jql: string, limit = 50, startAt = 0): Promise<JiraSearchResponse> {
    log.info(`Searching issues: ${jql}`);
    const data = await this.client.get<unknown>('/search', {
      jql,
      maxResults: Math.min(limit, 100),
      startAt,
      fields: DEFAULT_FIELDS,
    });
    return JiraSearchResponseSchema.parse(data);
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    log.info(`Getting issue: ${issueKey}`);
    const data = await this.client.get<unknown>(`/issue/${issueKey}`, {
      fields: DEFAULT_FIELDS,
    });
    return JiraIssueSchema.parse(data);
  }
}

export function formatIssue(issue: JiraIssue): string {
  const f = issue.fields;
  const lines: string[] = [
    `**${issue.key}** — ${f.summary}`,
    `Status: ${f.status?.name ?? 'Unknown'} | Type: ${f.issuetype?.name ?? 'Unknown'}`,
    `Priority: ${f.priority?.name ?? 'None'} | Assignee: ${f.assignee?.displayName ?? 'Unassigned'}`,
  ];

  if (f.description) {
    lines.push(`\nDescription: ${extractText(f.description)}`);
  }
  if (f.labels && f.labels.length > 0) {
    lines.push(`Labels: ${f.labels.join(', ')}`);
  }
  if (f.duedate) {
    lines.push(`Due: ${f.duedate}`);
  }
  if (f.comment && f.comment.total > 0) {
    lines.push(`\nComments (${f.comment.total}):`);
    for (const c of f.comment.comments.slice(0, 3)) {
      lines.push(`  [${c.author.displayName}] ${extractText(c.body)}`);
    }
  }

  return lines.join('\n');
}

export function formatSearchResults(result: JiraSearchResponse): string {
  if (result.issues.length === 0) return 'No issues found.';

  const header = `Found ${result.total} issue(s) (showing ${result.issues.length}):`;
  const rows = result.issues.map((issue) => {
    const f = issue.fields;
    return `• **${issue.key}** ${f.summary} [${f.status?.name ?? '?'}] - ${f.assignee?.displayName ?? 'Unassigned'}`;
  });

  return [header, ...rows].join('\n');
}

function extractText(node: unknown): string {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n['type'] === 'text' && typeof n['text'] === 'string') return n['text'];
  if (Array.isArray(n['content'])) {
    return (n['content'] as unknown[]).map(extractText).join('');
  }
  return '';
}
