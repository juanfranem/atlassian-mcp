import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { AppConfig } from './config/schema.js';
import { JiraHttpClient } from './http/jira.client.js';
import { ConfluenceHttpClient } from './http/confluence.client.js';
import { registerTools } from './shared/registry.js';
import { getLogger } from './shared/logger.js';
import { createIssueTools } from './modules/jira/issues/tools.js';
import { createProjectTools } from './modules/jira/projects/tools.js';
import { createPageTools } from './modules/confluence/pages/tools.js';
import { createSpaceTools } from './modules/confluence/spaces/tools.js';

const log = getLogger('Server');

export async function createMcpServer(config: AppConfig): Promise<McpServer> {
  const server = new McpServer({
    name: 'atlassian-mcp',
    version: '0.1.0',
  });

  const tools = [];

  if (config.jira) {
    const jiraClient = new JiraHttpClient(config.jira);
    tools.push(...createIssueTools(jiraClient), ...createProjectTools(jiraClient));
    log.info('Jira tools registered');
  }

  if (config.confluence) {
    const confluenceClient = new ConfluenceHttpClient(config.confluence);
    tools.push(...createPageTools(confluenceClient), ...createSpaceTools(confluenceClient));
    log.info('Confluence tools registered');
  }

  registerTools(server, tools, config.server.readOnlyMode);
  log.info(`Registered ${tools.length} tool(s) (readOnly=${config.server.readOnlyMode})`);

  return server;
}

export async function startServer(config: AppConfig): Promise<void> {
  const server = await createMcpServer(config);
  const { transport, port, host } = config.server;

  if (transport === 'stdio') {
    log.info('Starting stdio transport');
    const t = new StdioServerTransport();
    await server.connect(t);
    return;
  }

  const httpServer = createServer();

  if (transport === 'sse') {
    log.info(`Starting SSE transport on ${host}:${port}`);

    const sseTransports = new Map<string, SSEServerTransport>();

    httpServer.on('request', (req, res) => {
      const url = req.url ?? '/';

      if (req.method === 'GET' && url === '/sse') {
        const t = new SSEServerTransport('/messages', res);
        sseTransports.set(t.sessionId, t);
        res.on('close', () => { sseTransports.delete(t.sessionId); });
        void server.connect(t);
        return;
      }

      if (req.method === 'POST' && url.startsWith('/messages')) {
        const sessionId = new URL(url, `http://${host}`).searchParams.get('sessionId') ?? '';
        const t = sseTransports.get(sessionId);
        if (!t) { res.writeHead(404).end('Session not found'); return; }
        void t.handlePostMessage(req, res);
        return;
      }

      res.writeHead(404).end('Not found');
    });
  } else {
    log.info(`Starting streamable-http transport on ${host}:${port}`);
    const t = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    httpServer.on('request', (req, res) => {
      void t.handleRequest(req, res);
    });

    await server.connect(t);
  }

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, host, resolve);
    httpServer.once('error', reject);
  });

  log.info(`Server listening on ${host}:${port}`);
}
