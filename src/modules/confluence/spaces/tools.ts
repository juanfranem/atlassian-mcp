import { z } from 'zod';
import type { ToolDefinition } from '../../../shared/registry.js';
import type { ConfluenceHttpClient } from '../../../http/confluence.client.js';
import { ConfluenceSpacesService, formatSpaces } from './service.js';
import { toToolError } from '../../../shared/errors.js';

export function createSpaceTools(client: ConfluenceHttpClient): ToolDefinition[] {
  const service = new ConfluenceSpacesService(client);

  const confluenceGetSpaces: ToolDefinition = {
    name: 'confluence_get_spaces',
    description: 'List accessible Confluence spaces.',
    inputSchema: {
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Max number of spaces to return (default: 50)'),
    },
    readonly: true,
    async handler({ limit }: { limit?: number }) {
      try {
        const spaces = await service.getSpaces(limit ?? 50);
        return formatSpaces(spaces);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  return [confluenceGetSpaces];
}
