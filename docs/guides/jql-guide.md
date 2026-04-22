# JQL Guide

← [Back to README](../../README.md) | [Tools Reference](../tools-reference.md#jira_search)

JQL (Jira Query Language) is the query language used by `jira_search`. This guide covers the syntax, operators, common fields, and practical patterns.

---

## Basic syntax

```
field operator value [AND|OR field operator value] [ORDER BY field [ASC|DESC]]
```

Examples:

```
project = PROJ
status = "In Progress" AND assignee = currentUser()
project = PROJ ORDER BY created DESC
```

---

## Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Exact match | `status = "Done"` |
| `!=` | Not equal | `status != "Done"` |
| `~` | Contains text | `summary ~ "login"` |
| `!~` | Does not contain | `summary !~ "login"` |
| `>` / `<` | Greater/less than | `created > "-7d"` |
| `>=` / `<=` | Greater/less or equal | `priority >= High` |
| `IN` | In a list of values | `status IN ("Open", "In Progress")` |
| `NOT IN` | Not in a list | `status NOT IN ("Done", "Won't Fix")` |
| `IS EMPTY` | Field has no value | `assignee IS EMPTY` |
| `IS NOT EMPTY` | Field has a value | `duedate IS NOT EMPTY` |
| `WAS` | Historical value | `status WAS "In Progress"` |

---

## Common fields

| Field | Description | Example values |
|-------|-------------|----------------|
| `project` | Project key or name | `= PROJ`, `IN (PROJ, DEV)` |
| `status` | Issue status | `= "In Progress"`, `IN ("Open", "In Progress")` |
| `assignee` | Assigned user | `= currentUser()`, `= "john.doe"`, `IS EMPTY` |
| `reporter` | Reported by user | `= currentUser()` |
| `priority` | Issue priority | `= High`, `IN (High, Critical)` |
| `issuetype` | Issue type | `= Bug`, `= Story`, `= Epic` |
| `created` | Creation date | `>= -7d`, `>= "2024-01-01"` |
| `updated` | Last update date | `>= -1d` |
| `duedate` | Due date | `<= endOfWeek()`, `IS EMPTY` |
| `labels` | Labels | `= "backend"`, `IN ("backend", "api")` |
| `fixVersion` | Fix version | `= "v2.0"` |
| `component` | Component | `= "Authentication"` |
| `sprint` | Sprint name or ID | `= "Sprint 42"`, `in openSprints()` |
| `epic` | Epic link | `= "PROJ-10"` |
| `resolution` | Resolution status | `= EMPTY` (unresolved), `= Fixed` |
| `text` | Full text search | `~ "deployment pipeline"` |

---

## Functions

| Function | Description | Example |
|----------|-------------|---------|
| `currentUser()` | The authenticated user | `assignee = currentUser()` |
| `membersOf("group")` | Members of a group | `assignee in membersOf("developers")` |
| `startOfDay()` | Start of today | `created >= startOfDay()` |
| `endOfDay()` | End of today | `duedate <= endOfDay()` |
| `startOfWeek()` | Start of current week | `created >= startOfWeek()` |
| `endOfWeek()` | End of current week | `duedate <= endOfWeek()` |
| `startOfMonth()` | Start of current month | `created >= startOfMonth()` |
| `now()` | Current date/time | `updated >= now()` |
| `openSprints()` | Currently open sprints | `sprint in openSprints()` |
| `closedSprints()` | Closed sprints | `sprint in closedSprints()` |

---

## Date formats

Relative dates use the format `-Nd` (N days ago), `-Nw` (N weeks), `-Nm` (N months):

```
created >= -7d      # last 7 days
updated >= -2w      # last 2 weeks
created >= -1m      # last month
```

Absolute dates use `YYYY-MM-DD`:

```
created >= "2024-01-01"
duedate <= "2024-12-31"
```

---

## Practical patterns

### My open issues

```
assignee = currentUser() AND resolution = EMPTY ORDER BY priority DESC
```

### Unassigned bugs in a project

```
project = PROJ AND issuetype = Bug AND assignee IS EMPTY AND status != Done
```

### Issues updated in the last 24 hours

```
project = PROJ AND updated >= -1d ORDER BY updated DESC
```

### Current sprint issues

```
project = PROJ AND sprint in openSprints() ORDER BY status ASC
```

### Overdue issues

```
duedate < now() AND resolution = EMPTY AND assignee = currentUser()
```

### High-priority unresolved issues

```
priority IN (Critical, High) AND resolution = EMPTY ORDER BY priority DESC, created ASC
```

### Issues created this week by my team

```
project = PROJ AND created >= startOfWeek() AND assignee in membersOf("my-team")
```

### Bug triage — new ungroomed bugs

```
issuetype = Bug AND status = Open AND priority IS EMPTY AND created >= -7d
```

---

## Tips

- JQL is **case-insensitive** for keywords (`AND`, `OR`, `IN`) but values may be case-sensitive depending on the field
- Wrap values with spaces in **double quotes**: `status = "In Progress"`
- Use `ORDER BY created DESC` as a default sort to get the newest issues first
- Chain multiple conditions: `project = PROJ AND status != Done AND assignee = currentUser()`
- Negate a condition with `NOT`: `NOT (status = Done OR status = "Won't Fix")`
