import { join } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import type { Scope } from '../types.js';

const RULE_CONTENT = `---
description: Atlassian MCP (Jira + Confluence) tool usage guide
globs: '**'
alwaysApply: true
---

# Atlassian MCP — Tool Guide

When working with Jira or Confluence tasks, use the MCP tools provided by atlassian-mcp.

## Jira tools

- **jira_search** — search issues with JQL (params: \`jql\`, \`limit\`, \`startAt\`)
- **jira_get_issue** — get issue details by key like \`PROJ-123\` (param: \`issueKey\`)
- **jira_get_projects** — list accessible projects (param: \`limit\`)
- **jira_get_fields** — list all field definitions including custom fields

### JQL patterns
\`\`\`
assignee = currentUser() AND status != Done ORDER BY updated DESC
project = PROJ AND issuetype = Bug AND sprint in openSprints()
project = PROJ AND status = Blocked ORDER BY priority DESC
\`\`\`

## Confluence tools

- **confluence_search** — search with CQL (params: \`cql\`, \`limit\`)
- **confluence_get_page** — get page by numeric ID (param: \`pageId\`)
- **confluence_get_page_children** — list child pages (params: \`pageId\`, \`limit\`)
- **confluence_get_spaces** — list accessible spaces (param: \`limit\`)

### CQL patterns
\`\`\`
space = ENG AND type = page AND text ~ "keyword"
type = page AND label = "runbook" ORDER BY lastmodified DESC
ancestor = 123456 AND type = page
\`\`\`

## Tips
- Always include \`type = page\` in CQL to exclude comments/attachments
- Use \`jira_get_fields\` to find custom field IDs before using \`cf[]\` in JQL
- Use \`confluence_get_spaces\` to discover space keys
`;

function getRulePath(scope: Scope): string {
  const base = scope === 'global' ? join(process.env['HOME'] ?? '~', '.cursor') : join(process.cwd(), '.cursor');
  return join(base, 'rules', 'atlassian.mdc');
}

export async function generate(scope: Scope): Promise<string> {
  const rulePath = getRulePath(scope);
  await mkdir(join(rulePath, '..'), { recursive: true });
  await writeFile(rulePath, RULE_CONTENT, 'utf-8');
  return rulePath;
}
