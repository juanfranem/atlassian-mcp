import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import type { Scope } from '../types.js';

const SECTION_HEADER = '## Atlassian MCP';

const SECTION_CONTENT = `## Atlassian MCP

When working with Jira or Confluence, use the MCP tools from atlassian-mcp.

### Jira tools: jira_search, jira_get_issue, jira_get_projects, jira_get_fields
### Confluence tools: confluence_search, confluence_get_page, confluence_get_page_children, confluence_get_spaces

#### JQL quick reference
- My open issues: \`assignee = currentUser() AND status != Done ORDER BY updated DESC\`
- Current sprint: \`project = PROJ AND sprint in openSprints() ORDER BY priority DESC\`
- Recent bugs: \`project = PROJ AND issuetype = Bug AND created >= -7d\`

#### CQL quick reference
- Search in space: \`space = ENG AND type = page AND text ~ "keyword"\`
- Pages with label: \`type = page AND label = "runbook" ORDER BY lastmodified DESC\`
- Child pages: \`ancestor = <pageId> AND type = page\`
`;

function getRulesPath(scope: Scope): string {
  if (scope === 'global') {
    return join(homedir(), '.windsurfrc');
  }
  return join(process.cwd(), '.windsurfrc');
}

export async function generate(scope: Scope): Promise<string> {
  const rulesPath = getRulesPath(scope);

  let existing = '';
  try {
    existing = await readFile(rulesPath, 'utf-8');
  } catch {
    // ENOENT — create fresh
  }

  if (existing.includes(SECTION_HEADER)) {
    return rulesPath;
  }

  const content = existing ? existing + '\n\n' + SECTION_CONTENT : SECTION_CONTENT;
  await writeFile(rulesPath, content, 'utf-8');
  return rulesPath;
}
