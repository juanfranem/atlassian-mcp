# atlassian-mcp

A **read-only** [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for Atlassian **Jira** and **Confluence**, built with TypeScript.

Expose your Jira issues and Confluence pages directly to any MCP-compatible AI client — Claude Desktop, Cursor, Windsurf, and more.

---

## Quick Start

### 1. Get your API token

- **Atlassian Cloud**: [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- **Jira/Confluence Server/DC**: Create a Personal Access Token in your profile settings

### 2. Configure your MCP client

Add this to your client's MCP config file (e.g. `claude_desktop_config.json`):

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
        "CONFLUENCE_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

> You can configure only Jira, only Confluence, or both — whichever env vars are present determine which tools are registered.

### 3. Build and start using it

```bash
# Clone and install
git clone https://github.com/your-org/atlassian-mcp
cd atlassian-mcp
npm install

# Build
npm run build

# Or run directly without building (for development)
npm run dev
```

Then restart your MCP client and start asking questions like:

- *"Show me all open bugs in the PROJ project"*
- *"Find the deployment guide in Confluence"*
- *"What issues are assigned to me this sprint?"*

---

## Documentation

| Topic | Description |
|-------|-------------|
| [Installation](docs/installation.md) | Build from source, run with tsx, Docker |
| [Authentication](docs/authentication.md) | Cloud API token, Server/DC PAT |
| [Configuration](docs/configuration.md) | All environment variables, per-service options |
| [Tools Reference](docs/tools-reference.md) | All 8 MCP tools with parameters |
| [JQL Guide](docs/guides/jql-guide.md) | Jira Query Language syntax and examples |
| [CQL Guide](docs/guides/cql-guide.md) | Confluence Query Language syntax and examples |
| [Common Workflows](docs/guides/common-workflows.md) | Practical multi-tool usage patterns |
| [Deployment](docs/deployment.md) | Docker, production configuration |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |

---

## Compatibility

| Feature | Atlassian Cloud | Server / Data Center |
|---------|:--------------:|:--------------------:|
| Basic Auth (API Token) | ✅ | ✅ |
| PAT Authentication | ✅ | ✅ |
| Jira tools | ✅ | ✅ |
| Confluence tools | ✅ | ✅ |
| SSL verification toggle | ✅ | ✅ |
| Proxy support | ✅ | ✅ |

---

## Available Tools

### Jira

| Tool | Description |
|------|-------------|
| `jira_search` | Search issues using JQL |
| `jira_get_issue` | Get full details of an issue by key |
| `jira_get_projects` | List accessible projects |
| `jira_get_fields` | List all field definitions (system + custom) |

### Confluence

| Tool | Description |
|------|-------------|
| `confluence_search` | Search content using CQL |
| `confluence_get_page` | Get a page by ID with full content |
| `confluence_get_page_children` | List child pages of a page |
| `confluence_get_spaces` | List accessible spaces |

---

## Transports

| Transport | Use case |
|-----------|----------|
| `stdio` | Claude Desktop, Cursor, Windsurf (default) |
| `sse` | Multiple simultaneous clients |
| `streamable-http` | Stateless, horizontally scalable deployments |

---

## Security

- All tools are **read-only** by default (`READ_ONLY_MODE=true`)
- Credentials are never logged — Authorization headers are automatically redacted
- Input validated with [Zod](https://zod.dev) schemas before any API call
- SSL verification enabled by default

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
