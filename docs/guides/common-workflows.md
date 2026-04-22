# Common Workflows

← [Back to README](../../README.md)

Practical examples of how to use multiple tools together to accomplish real tasks.

---

## Jira Workflows

### Triage new issues

Find and review recently created, unassigned bugs:

**Step 1 — Find untriaged issues:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND issuetype = Bug AND assignee IS EMPTY AND created >= -3d ORDER BY created DESC",
    "limit": 50
  }
}
```

**Step 2 — Review each issue in detail:**
```json
{
  "tool": "jira_get_issue",
  "args": { "issueKey": "PROJ-456" }
}
```

---

### Sprint planning

Review what's in the current sprint and what needs attention:

**Step 1 — Current sprint overview:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND sprint in openSprints() ORDER BY status ASC, priority DESC",
    "limit": 100
  }
}
```

**Step 2 — Find blockers:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND sprint in openSprints() AND status = Blocked",
    "limit": 20
  }
}
```

**Step 3 — Check unassigned sprint items:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND sprint in openSprints() AND assignee IS EMPTY",
    "limit": 20
  }
}
```

---

### My daily standup prep

Get a quick overview of your own work status:

**Step 1 — What I'm working on:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "assignee = currentUser() AND status = 'In Progress' ORDER BY updated DESC",
    "limit": 10
  }
}
```

**Step 2 — What I completed recently:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "assignee = currentUser() AND status changed to Done AFTER -1d",
    "limit": 10
  }
}
```

**Step 3 — What's blocked or needs review:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "assignee = currentUser() AND status IN ('Blocked', 'In Review') ORDER BY updated DESC",
    "limit": 10
  }
}
```

---

### Find issues by custom field

First discover the custom field ID, then use it in searches:

**Step 1 — Find the field ID:**
```json
{
  "tool": "jira_get_fields",
  "args": {}
}
```

Look for the field in the returned list (e.g. `customfield_10200` for "Team").

**Step 2 — Search using the custom field:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND cf[10200] = 'Platform Team' AND status != Done",
    "limit": 50
  }
}
```

---

### Release prep — what's in this version

Review all issues fixed in an upcoming release:

```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND fixVersion = 'v2.5.0' ORDER BY issuetype ASC, priority DESC",
    "limit": 100
  }
}
```

---

## Confluence Workflows

### Find documentation for a feature

Search across the engineering space for relevant pages:

**Step 1 — Full-text search:**
```json
{
  "tool": "confluence_search",
  "args": {
    "cql": "space = ENG AND type = page AND text ~ \"authentication flow\"",
    "limit": 10
  }
}
```

**Step 2 — Get the most relevant page:**
```json
{
  "tool": "confluence_get_page",
  "args": { "pageId": "123456" }
}
```

---

### Navigate a documentation section

Browse a hierarchy of pages starting from a known root:

**Step 1 — Find the section root:**
```json
{
  "tool": "confluence_search",
  "args": {
    "cql": "space = ENG AND type = page AND title = \"Architecture\"",
    "limit": 5
  }
}
```

**Step 2 — List subsections:**
```json
{
  "tool": "confluence_get_page_children",
  "args": { "pageId": "100000", "limit": 50 }
}
```

**Step 3 — Read a specific subsection:**
```json
{
  "tool": "confluence_get_page",
  "args": { "pageId": "100042" }
}
```

---

### Explore available documentation spaces

**Step 1 — List all spaces:**
```json
{
  "tool": "confluence_get_spaces",
  "args": { "limit": 100 }
}
```

**Step 2 — Search within a discovered space:**
```json
{
  "tool": "confluence_search",
  "args": {
    "cql": "space = PRODUCT AND type = page ORDER BY lastmodified DESC",
    "limit": 20
  }
}
```

---

## Cross-product Workflows

### Link a Jira issue to its documentation

**Step 1 — Get the Jira issue:**
```json
{
  "tool": "jira_get_issue",
  "args": { "issueKey": "PROJ-123" }
}
```

**Step 2 — Find related Confluence docs using keywords from the issue summary:**
```json
{
  "tool": "confluence_search",
  "args": {
    "cql": "space = DOCS AND type = page AND text ~ \"feature name\"",
    "limit": 5
  }
}
```

---

### New team member onboarding

Help a new team member find everything they need:

**Step 1 — List projects they'll work in:**
```json
{
  "tool": "jira_get_projects",
  "args": { "limit": 20 }
}
```

**Step 2 — Find onboarding documentation:**
```json
{
  "tool": "confluence_search",
  "args": {
    "cql": "type = page AND label = \"onboarding\" ORDER BY lastmodified DESC",
    "limit": 10
  }
}
```

**Step 3 — Find team runbooks:**
```json
{
  "tool": "confluence_search",
  "args": {
    "cql": "space = ENG AND type = page AND label = \"runbook\"",
    "limit": 20
  }
}
```

**Step 4 — Check current sprint to understand priorities:**
```json
{
  "tool": "jira_search",
  "args": {
    "jql": "project = PROJ AND sprint in openSprints() ORDER BY priority DESC",
    "limit": 30
  }
}
```
