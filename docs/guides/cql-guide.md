# CQL Guide

← [Back to README](../../README.md) | [Tools Reference](../tools-reference.md#confluence_search)

CQL (Confluence Query Language) is the query language used by `confluence_search`. This guide covers the syntax, operators, common fields, and practical patterns.

---

## Basic syntax

```
field operator value [AND|OR field operator value] [ORDER BY field [ASC|DESC]]
```

Examples:

```
space = ENG
type = page AND space = ENG
text ~ "deployment" ORDER BY lastmodified DESC
```

---

## Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Exact match | `space = "ENG"` |
| `!=` | Not equal | `type != "comment"` |
| `~` | Contains text | `text ~ "authentication"` |
| `!~` | Does not contain | `title !~ "draft"` |
| `IN` | In a list | `space IN ("ENG", "DOCS")` |
| `NOT IN` | Not in a list | `type NOT IN ("comment", "attachment")` |
| `>` / `<` | Greater/less than (dates) | `lastmodified > "2024-01-01"` |
| `>=` / `<=` | Greater/less or equal | `lastmodified >= now("-7d")` |
| `IS EMPTY` | No value | `ancestor IS EMPTY` |
| `IS NOT EMPTY` | Has a value | `label IS NOT EMPTY` |

---

## Common fields

| Field | Description | Example values |
|-------|-------------|----------------|
| `space` | Space key | `= "ENG"`, `IN ("ENG", "DOCS")` |
| `type` | Content type | `= "page"`, `= "blogpost"`, `= "comment"` |
| `title` | Page title | `= "Home"`, `~ "deployment"` |
| `text` | Full body text | `~ "kubernetes"` |
| `label` | Content label | `= "architecture"`, `IN ("api", "reference")` |
| `ancestor` | Parent page ID | `= 123456` |
| `parent` | Direct parent page | `= 123456` |
| `creator` | Page creator | `= currentUser()`, `= "john.doe"` |
| `contributor` | Anyone who edited | `= currentUser()` |
| `created` | Creation date | `>= "2024-01-01"`, `>= now("-7d")` |
| `lastmodified` | Last modified date | `>= now("-1d")` |
| `space.title` | Space display name | `= "Engineering"` |

---

## Content types

| Type | Description |
|------|-------------|
| `page` | Standard wiki pages |
| `blogpost` | Blog posts |
| `comment` | Page and inline comments |
| `attachment` | File attachments |

Use `type = page` in most searches to avoid noise from comments and attachments.

---

## Functions

| Function | Description | Example |
|----------|-------------|---------|
| `currentUser()` | The authenticated user | `creator = currentUser()` |
| `now()` | Current date/time | `lastmodified >= now()` |
| `now("-7d")` | Relative date (7 days ago) | `created >= now("-7d")` |
| `now("-1w")` | Relative date (1 week ago) | `lastmodified >= now("-1w")` |
| `now("-1M")` | Relative date (1 month ago) | `created >= now("-1M")` |

---

## Practical patterns

### Pages in a space updated recently

```
space = ENG AND type = page AND lastmodified >= now("-7d") ORDER BY lastmodified DESC
```

### Full-text search in a specific space

```
space = ENG AND type = page AND text ~ "kubernetes deployment"
```

### Find pages by title keyword

```
type = page AND title ~ "architecture" ORDER BY title ASC
```

### Pages created by me

```
type = page AND creator = currentUser() ORDER BY created DESC
```

### Pages with a specific label

```
type = page AND label = "runbook" ORDER BY lastmodified DESC
```

### Pages under a specific parent

```
ancestor = 123456 AND type = page
```

### Recent blog posts

```
type = blogpost ORDER BY created DESC
```

### Search across multiple spaces

```
space IN ("ENG", "PRODUCT", "DESIGN") AND type = page AND text ~ "onboarding"
```

### Find pages not updated in 6 months (stale docs)

```
space = ENG AND type = page AND lastmodified <= now("-6M") ORDER BY lastmodified ASC
```

---

## Tips

- Always include `type = page` in searches unless you specifically need other content types — it greatly reduces noise
- CQL is **case-insensitive** for field names and operators; space keys are usually uppercase
- The `text ~` operator searches the full page body — use it for keyword searches when you don't know the exact title
- Use `ancestor = <pageId>` to search within an entire section of the page hierarchy
- Wrap multi-word values in double quotes: `space = "My Team Space"`
- Combine `title ~` (for title matching) and `text ~` (for body search) with `OR` for broader results:
  ```
  type = page AND (title ~ "API" OR text ~ "API reference")
  ```
