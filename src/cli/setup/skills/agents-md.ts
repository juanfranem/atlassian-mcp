import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import type { Scope } from '../types.js';

const SECTION_HEADER = '## Atlassian MCP Tools';

const SECTION_CONTENT = `## Atlassian MCP Tools

This project uses [atlassian-mcp](https://www.npmjs.com/package/atlassian-mcp) to access Jira and Confluence.

### Jira tools
- **jira_search** — search issues with JQL (params: \`jql\`, \`limit\`, \`startAt\`)
- **jira_get_issue** — get issue by key e.g. \`PROJ-123\` (param: \`issueKey\`)
- **jira_get_projects** — list accessible projects
- **jira_get_fields** — list field definitions including custom fields

### Confluence tools
- **confluence_search** — search content with CQL (params: \`cql\`, \`limit\`)
- **confluence_get_page** — get page by numeric ID (param: \`pageId\`)
- **confluence_get_page_children** — list child pages (params: \`pageId\`, \`limit\`)
- **confluence_get_spaces** — list accessible spaces

### Tips
- Always include \`type = page\` in CQL to reduce noise
- Use \`jira_get_projects\` to find exact project keys
- Use \`confluence_get_spaces\` to discover space keys
`;

function getAgentsPath(scope: Scope): string {
  if (scope === 'global') {
    return join(homedir(), '.claude', 'CLAUDE.md');
  }
  return join(process.cwd(), 'AGENTS.md');
}

export async function generate(scope: Scope): Promise<string> {
  const agentsPath = getAgentsPath(scope);

  let existing = '';
  try {
    existing = await readFile(agentsPath, 'utf-8');
  } catch {
    // ENOENT — create fresh
  }

  if (existing.includes(SECTION_HEADER)) {
    return agentsPath;
  }

  const content = existing ? existing + '\n\n' + SECTION_CONTENT : SECTION_CONTENT;
  await writeFile(agentsPath, content, 'utf-8');
  return agentsPath;
}
