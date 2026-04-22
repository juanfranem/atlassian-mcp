# Configuration

← [Back to README](../README.md)

---

All configuration is done through **environment variables** — either via the MCP client's `env` block (recommended) or a `.env` file in the project root.

---

## Jira

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JIRA_URL` | Yes* | — | Jira base URL. Cloud: `https://company.atlassian.net`. Server: `https://jira.company.com` |
| `JIRA_USERNAME` | Yes (basic) | — | Email address (Cloud) or username (Server/DC) |
| `JIRA_API_TOKEN` | Yes (basic) | — | API token (Cloud) or password (Server/DC) |
| `JIRA_PERSONAL_TOKEN` | Yes (PAT) | — | Personal Access Token — takes precedence over basic auth |
| `JIRA_SSL_VERIFY` | No | `true` | Set `false` to disable SSL certificate verification |
| `JIRA_TIMEOUT_MS` | No | `30000` | HTTP request timeout in milliseconds |
| `JIRA_PROJECTS_FILTER` | No | — | Comma-separated project keys to restrict results (e.g. `PROJ,DEV,OPS`) |

*At least one of `JIRA_URL` or `CONFLUENCE_URL` must be set.

---

## Confluence

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CONFLUENCE_URL` | Yes* | — | Confluence base URL. Cloud: `https://company.atlassian.net/wiki`. Server: `https://wiki.company.com` |
| `CONFLUENCE_USERNAME` | Yes (basic) | — | Email address (Cloud) or username (Server/DC) |
| `CONFLUENCE_API_TOKEN` | Yes (basic) | — | API token (Cloud) or password (Server/DC) |
| `CONFLUENCE_PERSONAL_TOKEN` | Yes (PAT) | — | Personal Access Token — takes precedence over basic auth |
| `CONFLUENCE_SSL_VERIFY` | No | `true` | Set `false` to disable SSL certificate verification |
| `CONFLUENCE_TIMEOUT_MS` | No | `30000` | HTTP request timeout in milliseconds |
| `CONFLUENCE_SPACES_FILTER` | No | — | Comma-separated space keys to restrict results (e.g. `DEV,DOCS,TEAM`) |

---

## Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANSPORT` | No | `stdio` | Transport protocol: `stdio`, `sse`, or `streamable-http` |
| `PORT` | No | `8000` | Port for `sse` and `streamable-http` transports |
| `HOST` | No | `0.0.0.0` | Host for `sse` and `streamable-http` transports |
| `READ_ONLY_MODE` | No | `true` | When `true`, only read-only tools are registered |
| `LOG_LEVEL` | No | `warn` | Log verbosity: `error`, `warn`, `info`, `debug` |

---

## Proxy

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HTTPS_PROXY` | No | — | HTTPS proxy URL (takes precedence over `HTTP_PROXY`) |
| `HTTP_PROXY` | No | — | HTTP proxy URL |

Proxy example:

```json
{
  "env": {
    "JIRA_URL": "https://your-company.atlassian.net",
    "JIRA_USERNAME": "your.email@company.com",
    "JIRA_API_TOKEN": "your_token",
    "HTTPS_PROXY": "https://proxy.company.com:8443"
  }
}
```

---

## Content filtering

Use `JIRA_PROJECTS_FILTER` and `CONFLUENCE_SPACES_FILTER` to limit the scope of results.

**Jira — filter by project:**

```json
{
  "env": {
    "JIRA_URL": "https://your-company.atlassian.net",
    "JIRA_USERNAME": "your.email@company.com",
    "JIRA_API_TOKEN": "your_token",
    "JIRA_PROJECTS_FILTER": "BACKEND,FRONTEND,PLATFORM"
  }
}
```

> This does **not** restrict which tools are available — it is metadata used in prompts to help the AI scope searches correctly.

**Confluence — filter by space:**

```json
{
  "env": {
    "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
    "CONFLUENCE_USERNAME": "your.email@company.com",
    "CONFLUENCE_API_TOKEN": "your_token",
    "CONFLUENCE_SPACES_FILTER": "ENG,PRODUCT,DOCS"
  }
}
```

---

## Logging

Set `LOG_LEVEL` to control log verbosity. All logs go to `stderr` and are never sent to the MCP client.

| Level | Output |
|-------|--------|
| `error` | Only critical failures |
| `warn` | Errors + rate limit warnings (default) |
| `info` | + Incoming tool calls and API requests |
| `debug` | + Full request/response details |

> Authorization headers and tokens are **always redacted** regardless of log level.

```json
{
  "env": {
    "JIRA_URL": "...",
    "LOG_LEVEL": "debug"
  }
}
```

---

## Using a .env file

As an alternative to the MCP `env` block, you can create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your credentials
```

Then run without the `env` block in the MCP config:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "node",
      "args": ["/path/to/atlassian/dist/index.js"]
    }
  }
}
```

> Variables set in the MCP `env` block always take precedence over `.env` file values.

---

## Full example config

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "node",
      "args": ["/path/to/atlassian/dist/index.js"],
      "env": {
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_jira_token",
        "JIRA_PROJECTS_FILTER": "PROJ,DEV",

        "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
        "CONFLUENCE_USERNAME": "your.email@company.com",
        "CONFLUENCE_API_TOKEN": "your_confluence_token",
        "CONFLUENCE_SPACES_FILTER": "ENG,DOCS",

        "READ_ONLY_MODE": "true",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```
