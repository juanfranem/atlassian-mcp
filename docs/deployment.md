# Deployment

← [Back to README](../README.md)

---

## stdio (default)

The default transport. The MCP client launches the server as a subprocess and communicates via stdin/stdout. No additional setup is needed.

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "node",
      "args": ["/path/to/atlassian/dist/index.js"],
      "env": {
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_token"
      }
    }
  }
}
```

---

## Docker — basic

```bash
docker build -t atlassian-mcp .

docker run --rm \
  -e JIRA_URL="https://your-company.atlassian.net" \
  -e JIRA_USERNAME="your.email@company.com" \
  -e JIRA_API_TOKEN="your_token" \
  -e CONFLUENCE_URL="https://your-company.atlassian.net/wiki" \
  -e CONFLUENCE_USERNAME="your.email@company.com" \
  -e CONFLUENCE_API_TOKEN="your_confluence_token" \
  atlassian-mcp
```

---

## Docker — with environment file

Create a `.env.docker` file (never commit this):

```bash
JIRA_URL=https://your-company.atlassian.net
JIRA_USERNAME=your.email@company.com
JIRA_API_TOKEN=your_token
CONFLUENCE_URL=https://your-company.atlassian.net/wiki
CONFLUENCE_USERNAME=your.email@company.com
CONFLUENCE_API_TOKEN=your_confluence_token
READ_ONLY_MODE=true
LOG_LEVEL=warn
```

Then run:

```bash
docker run --rm --env-file .env.docker atlassian-mcp
```

---

## Docker Compose — SSE transport

For deployments where multiple clients connect to a shared server instance:

```yaml
# docker-compose.yml
services:
  atlassian-mcp:
    build: .
    environment:
      JIRA_URL: ${JIRA_URL}
      JIRA_USERNAME: ${JIRA_USERNAME}
      JIRA_API_TOKEN: ${JIRA_API_TOKEN}
      CONFLUENCE_URL: ${CONFLUENCE_URL}
      CONFLUENCE_USERNAME: ${CONFLUENCE_USERNAME}
      CONFLUENCE_API_TOKEN: ${CONFLUENCE_API_TOKEN}
      TRANSPORT: sse
      PORT: 8000
      HOST: 0.0.0.0
      READ_ONLY_MODE: "true"
      LOG_LEVEL: warn
    ports:
      - "8000:8000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8000/sse', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
```

MCP client config for SSE:

```json
{
  "mcpServers": {
    "atlassian": {
      "url": "http://localhost:8000/sse"
    }
  }
}
```

---

## Docker Compose — streamable-http transport

For stateless, horizontally scalable deployments:

```yaml
services:
  atlassian-mcp:
    build: .
    environment:
      JIRA_URL: ${JIRA_URL}
      JIRA_USERNAME: ${JIRA_USERNAME}
      JIRA_API_TOKEN: ${JIRA_API_TOKEN}
      TRANSPORT: streamable-http
      PORT: 8000
      READ_ONLY_MODE: "true"
    ports:
      - "8000:8000"
    restart: unless-stopped
```

MCP client config for streamable-http:

```json
{
  "mcpServers": {
    "atlassian": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

---

## Transport comparison

| Transport | Clients | Session | Best for |
|-----------|---------|---------|----------|
| `stdio` | 1 (parent process) | Stateful | Claude Desktop, IDEs |
| `sse` | Multiple | Stateful per session | Shared team server |
| `streamable-http` | Multiple | Stateless | Cloud deployments, load balancing |

---

## Security recommendations for production

1. **Never log credentials** — set `LOG_LEVEL=warn` or `LOG_LEVEL=error` in production
2. **Use secrets management** — pass credentials via environment variables from a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.) rather than hardcoding them
3. **Restrict network access** — for SSE/HTTP transports, put the server behind a reverse proxy with authentication
4. **Read-only mode** — keep `READ_ONLY_MODE=true` (the default) unless write access is explicitly required
5. **SSL verification** — never set `JIRA_SSL_VERIFY=false` or `CONFLUENCE_SSL_VERIFY=false` in production

---

## Updating

```bash
git pull
npm install
npm run build
# Restart the MCP client or Docker container
```
