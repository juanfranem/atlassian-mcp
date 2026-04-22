import type { McpServerEntry } from '../types.js';
import { buildMcpEntry } from '../config-writer.js';

export function printConfig(entry: McpServerEntry): void {
  const config = {
    mcpServers: {
      atlassian: buildMcpEntry(entry.env),
    },
  };
  process.stdout.write('\nAdd the following to your MCP client config:\n\n');
  process.stdout.write(JSON.stringify(config, null, 2) + '\n\n');
}
