# Tools Reference

← [Back to README](../README.md)

---

All tools are **read-only**. No tool creates, updates, or deletes any data.

- [Jira Tools](#jira-tools)
  - [jira_search](#jira_search)
  - [jira_get_issue](#jira_get_issue)
  - [jira_get_projects](#jira_get_projects)
  - [jira_get_fields](#jira_get_fields)
- [Confluence Tools](#confluence-tools)
  - [confluence_search](#confluence_search)
  - [confluence_get_page](#confluence_get_page)
  - [confluence_get_page_children](#confluence_get_page_children)
  - [confluence_get_spaces](#confluence_get_spaces)

---

## Jira Tools

### jira_search

Search Jira issues using JQL (Jira Query Language).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jql` | string | Yes | JQL query string |
| `limit` | integer | No | Max results to return. Range: 1–100. Default: `50` |
| `startAt` | integer | No | Pagination offset. Default: `0` |

**Example:**

```json
{
  "jql": "project = PROJ AND status = 'In Progress' AND assignee = currentUser()",
  "limit": 20
}
```

**Returns:** A formatted list of matching issues with key, summary, status, assignee, and priority.

**Tips:**
- Use `ORDER BY` to control sorting: `... ORDER BY created DESC`
- Combine with `startAt` for pagination through large result sets
- See the [JQL Guide](guides/jql-guide.md) for syntax reference

---

### jira_get_issue

Get full details of a specific Jira issue by its key.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueKey` | string | Yes | Issue key (e.g. `PROJ-123`) |

**Example:**

```json
{
  "issueKey": "PROJ-123"
}
```

**Returns:** Full issue details including summary, description, status, assignee, reporter, priority, labels, fix versions, components, due date, and up to 3 recent comments.

**Tips:**
- Use `jira_search` first to find the issue key, then `jira_get_issue` for full details
- Description is returned as plain text extracted from Atlassian Document Format (ADF)

---

### jira_get_projects

List all Jira projects accessible with the configured credentials.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max number of projects. Range: 1–100. Default: `50` |

**Example:**

```json
{
  "limit": 100
}
```

**Returns:** A list of projects with key, name, type, and description.

---

### jira_get_fields

Get all field definitions available in the Jira instance — both system fields and custom fields.

**Parameters:**

None.

**Example:**

```json
{}
```

**Returns:** A list of fields with ID, name, type, and whether it is a custom field.

**Tips:**
- Use this to discover custom field IDs for use in JQL queries
- Custom field IDs follow the pattern `customfield_10XXX`

---

## Confluence Tools

### confluence_search

Search Confluence content using CQL (Confluence Query Language).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cql` | string | Yes | CQL query string |
| `limit` | integer | No | Max results to return. Range: 1–100. Default: `25` |

**Example:**

```json
{
  "cql": "space = ENG AND type = page AND text ~ \"deployment\" ORDER BY lastmodified DESC",
  "limit": 10
}
```

**Returns:** A list of matching content items with title, space, and a short excerpt.

**Tips:**
- See the [CQL Guide](guides/cql-guide.md) for syntax reference
- Use `type = page` to restrict results to pages only
- Use `text ~ "keyword"` for full-text search

---

### confluence_get_page

Get a Confluence page by its numeric ID, with full content.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageId` | string | Yes | Numeric page ID (e.g. `"123456"`) |

**Example:**

```json
{
  "pageId": "123456"
}
```

**Returns:** Full page content including title, space, version, breadcrumb path, and up to 2000 characters of body text (HTML stripped).

**Tips:**
- Use `confluence_search` to find a page and get its ID, then `confluence_get_page` for full content
- The page ID is the number in the URL: `.../wiki/spaces/ENG/pages/**123456**/Page+Title`

---

### confluence_get_page_children

List the direct child pages of a given Confluence page.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageId` | string | Yes | Parent page ID |
| `limit` | integer | No | Max child pages to return. Range: 1–100. Default: `25` |

**Example:**

```json
{
  "pageId": "123456",
  "limit": 50
}
```

**Returns:** A list of child pages with title and ID.

**Tips:**
- Useful for navigating Confluence page hierarchies
- Combine with `confluence_get_page` to drill down into specific pages

---

### confluence_get_spaces

List all Confluence spaces accessible with the configured credentials.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max number of spaces. Range: 1–100. Default: `50` |

**Example:**

```json
{
  "limit": 100
}
```

**Returns:** A list of spaces with key, name, and description.

**Tips:**
- Use space keys in CQL queries: `space = ENG AND ...`
- Personal spaces are included in the results (type = `personal`)
