# Installation

← [Back to README](../README.md)

---

## Prerequisites

- **Node.js** 20 or later
- An Atlassian Cloud, Server, or Data Center instance
- An API token or Personal Access Token (see [Authentication](authentication.md))

---

## Option 1: Setup wizard via npx (recommended)

No install or clone needed. Run:

```bash
npx @juanfranem/atlassian-mcp setup
```

The wizard will:
1. Ask which services to configure (Jira, Confluence, or both)
2. Ask for your instance URL and credentials
3. Ask which AI client to configure (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, OpenCode, Codex CLI, or print JSON for manual use)
4. Write the correct config file automatically

---

## Option 2: Manual config (npx)

Add this to your client's MCP config file. No local install required — `npx` fetches the package on first run:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@juanfranem/atlassian-mcp"],
      "env": {
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

---

## Option 3: Docker

```bash
docker build -t atlassian-mcp .

docker run --rm \
  -e JIRA_URL="https://your-company.atlassian.net" \
  -e JIRA_USERNAME="your.email@company.com" \
  -e JIRA_API_TOKEN="your_api_token" \
  atlassian-mcp
```

See [Deployment](deployment.md) for production Docker configurations.

---

## MCP Client Configuration

### Claude Desktop

Config file location:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@juanfranem/atlassian-mcp"],
      "env": {
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_api_token",
        "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
        "CONFLUENCE_USERNAME": "your.email@company.com",
        "CONFLUENCE_API_TOKEN": "your_confluence_token"
      }
    }
  }
}
```

### Cursor

Config file: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@juanfranem/atlassian-mcp"],
      "env": {
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

### Windsurf

Config file: `~/.codeium/windsurf/mcp_config.json`

Same format as Cursor above.

---

## Partial configuration

You can configure **only Jira**, **only Confluence**, or **both**. Tools are only registered for the services that have env vars set.

**Jira only:**
```json
{
  "env": {
    "JIRA_URL": "https://your-company.atlassian.net",
    "JIRA_USERNAME": "your.email@company.com",
    "JIRA_API_TOKEN": "your_api_token"
  }
}
```

**Confluence only:**
```json
{
  "env": {
    "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
    "CONFLUENCE_USERNAME": "your.email@company.com",
    "CONFLUENCE_API_TOKEN": "your_api_token"
  }
}
```

---

## Verify the installation

After configuring your MCP client, restart it and ask:

> *"List my Jira projects"*

or

> *"List available Confluence spaces"*

If you see results, the server is working correctly.

---

## Next steps

- [Authentication](authentication.md) — API tokens and PAT setup
- [Configuration](configuration.md) — All available environment variables
- [Tools Reference](tools-reference.md) — What each tool does
