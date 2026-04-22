import { homedir } from 'node:os';
import { join } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import type { Scope } from '../types.js';

const SKILL_CONTENT = `---
description: Work with Jira issues and Confluence pages via the atlassian-mcp MCP tools
---

# Atlassian MCP — Tool Guide

## Available tools

### Jira
| Tool | Purpose | Key params |
|------|---------|------------|
| \`jira_search\` | Search issues via JQL | \`jql\`, \`limit\`, \`startAt\` |
| \`jira_get_issue\` | Get a single issue | \`issueKey\` (e.g. \`PROJ-123\`) |
| \`jira_get_projects\` | List accessible projects | \`limit\` |
| \`jira_get_fields\` | List all fields (including custom) | — |

### Confluence
| Tool | Purpose | Key params |
|------|---------|------------|
| \`confluence_search\` | Search content via CQL | \`cql\`, \`limit\` |
| \`confluence_get_page\` | Get a page by ID | \`pageId\` |
| \`confluence_get_page_children\` | List child pages | \`pageId\`, \`limit\` |
| \`confluence_get_spaces\` | List accessible spaces | \`limit\` |

## Common JQL patterns

\`\`\`
# My open issues
assignee = currentUser() AND status != Done ORDER BY updated DESC

# Bugs in current sprint
project = PROJ AND issuetype = Bug AND sprint in openSprints()

# Recently created, unassigned
project = PROJ AND assignee IS EMPTY AND created >= -3d ORDER BY created DESC

# Blocked issues
project = PROJ AND status = Blocked ORDER BY priority DESC
\`\`\`

## Common CQL patterns

\`\`\`
# Pages in a space updated this week
space = ENG AND type = page AND lastmodified >= now("-7d") ORDER BY lastmodified DESC

# Full-text search
space = ENG AND type = page AND text ~ "authentication"

# Pages with a label
type = page AND label = "runbook" ORDER BY lastmodified DESC

# Child pages of a section
ancestor = 123456 AND type = page
\`\`\`

## Workflow tips

- Use \`jira_get_projects\` first to find the correct project key
- Use \`jira_get_fields\` to find custom field IDs (format: \`customfield_10XXX\`)
- Use \`confluence_get_spaces\` to find space keys before searching
- Always include \`type = page\` in CQL to exclude comments and attachments
- Wrap multi-word values in double quotes: \`status = "In Progress"\`
`;

function getSkillPath(scope: Scope): string {
  const base = scope === 'global' ? join(homedir(), '.claude') : join(process.cwd(), '.claude');
  return join(base, 'commands', 'atlassian.md');
}

export async function generate(scope: Scope): Promise<string> {
  const skillPath = getSkillPath(scope);
  await mkdir(join(skillPath, '..'), { recursive: true });
  await writeFile(skillPath, SKILL_CONTENT, 'utf-8');
  return skillPath;
}
