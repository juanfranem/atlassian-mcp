# Installation

← [Back to README](../README.md)

---

## Prerequisites

- **Node.js** 20 or later
- An Atlassian Cloud, Server, or Data Center instance
- An API token or Personal Access Token (see [Authentication](authentication.md))

---

## Option 1: Build from source

```bash
# Clone the repository
git clone https://github.com/your-org/atlassian-mcp
cd atlassian-mcp

# Install dependencies
npm install

# Build
npm run build
```

The compiled output is placed in `dist/`. The entry point is `dist/index.js`.

Configure your MCP client:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "node",
      "args": ["/absolute/path/to/atlassian/dist/index.js"],
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

## Option 2: Run without building (development)

Use `tsx` to run TypeScript directly — no build step required:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/atlassian/src/index.ts"],
      "env": {
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

> This is slower to start but requires no manual rebuild after code changes.

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
      "command": "node",
      "args": ["/absolute/path/to/atlassian/dist/index.js"],
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
      "command": "node",
      "args": ["/absolute/path/to/atlassian/dist/index.js"],
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
