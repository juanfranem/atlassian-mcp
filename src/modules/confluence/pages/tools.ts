import { z } from 'zod';
import type { ToolDefinition } from '../../../shared/registry.js';
import type { ConfluenceHttpClient } from '../../../http/confluence.client.js';
import {
  ConfluencePagesService,
  formatPage,
  formatSearchResults,
  formatPageList,
} from './service.js';
import { toToolError } from '../../../shared/errors.js';

export function createPageTools(client: ConfluenceHttpClient): ToolDefinition[] {
  const service = new ConfluencePagesService(client);

  const confluenceSearch: ToolDefinition = {
    name: 'confluence_search',
    description:
      'Search Confluence content using CQL (Confluence Query Language). Returns pages, blog posts, and other content.',
    inputSchema: {
      cql: z
        .string()
        .describe('CQL query (e.g. "space = DEV AND type = page AND text ~ \\"deployment\\"")'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Max results to return (1-100, default: 25)'),
    },
    readonly: true,
    async handler({ cql, limit }: { cql: string; limit?: number }) {
      try {
        const result = await service.searchContent(cql, limit ?? 25);
        return formatSearchResults(result);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  const confluenceGetPage: ToolDefinition = {
    name: 'confluence_get_page',
    description: 'Get a Confluence page by its ID with full content.',
    inputSchema: {
      pageId: z.string().describe('Confluence page ID (numeric string)'),
    },
    readonly: true,
    async handler({ pageId }: { pageId: string }) {
      try {
        const page = await service.getPage(pageId);
        return formatPage(page);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  const confluenceGetPageChildren: ToolDefinition = {
    name: 'confluence_get_page_children',
    description: 'Get child pages of a Confluence page.',
    inputSchema: {
      pageId: z.string().describe('Parent page ID'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Max child pages to return (default: 25)'),
    },
    readonly: true,
    async handler({ pageId, limit }: { pageId: string; limit?: number }) {
      try {
        const pages = await service.getPageChildren(pageId, limit ?? 25);
        return formatPageList(pages);
      } catch (err) {
        return `Error: ${toToolError(err)}`;
      }
    },
  };

  return [confluenceSearch, confluenceGetPage, confluenceGetPageChildren];
}
