import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolDefinition<TInput extends Record<string, z.ZodTypeAny> = Record<string, any>> {
  name: string;
  description: string;
  inputSchema: TInput;
  readonly: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (args: any) => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyToolDefinition = ToolDefinition<any>;

export function registerTools(server: McpServer, tools: AnyToolDefinition[], readOnlyMode: boolean): void {
  for (const tool of tools) {
    if (readOnlyMode && !tool.readonly) continue;

    server.registerTool(
      tool.name,
      {
        description: tool.description,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        inputSchema: tool.inputSchema,
        annotations: {
          readOnlyHint: tool.readonly,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (args: any) => {
          const result = await tool.handler(args) as string;
        return { content: [{ type: 'text' as const, text: result }] };
      },
    );
  }
}
