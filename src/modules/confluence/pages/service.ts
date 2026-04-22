import type { ConfluenceHttpClient } from '../../../http/confluence.client.js';
import {
  ConfluencePageSchema,
  ConfluencePageListSchema,
  ConfluenceSearchResponseSchema,
} from '../types.js';
import type { ConfluencePage, ConfluenceSearchResponse } from '../types.js';
import { getLogger } from '../../../shared/logger.js';

const log = getLogger('ConfluencePagesService');

export class ConfluencePagesService {
  constructor(private readonly client: ConfluenceHttpClient) {}

  async getPage(pageId: string): Promise<ConfluencePage> {
    log.info(`Getting page: ${pageId}`);
    const data = await this.client.get<unknown>(`/content/${pageId}`, {
      expand: 'body.storage,body.view,space,version,ancestors',
    });
    return ConfluencePageSchema.parse(data);
  }

  async getPageChildren(pageId: string, limit = 25): Promise<ConfluencePage[]> {
    log.info(`Getting children of page: ${pageId}`);
    const data = await this.client.get<unknown>(`/content/${pageId}/child/page`, {
      limit: Math.min(limit, 100),
      expand: 'space,version',
    });
    const parsed = ConfluencePageListSchema.parse(data);
    return parsed.results;
  }

  async searchContent(cql: string, limit = 25): Promise<ConfluenceSearchResponse> {
    log.info(`Searching content: ${cql}`);
    const data = await this.client.get<unknown>('/content/search', {
      cql,
      limit: Math.min(limit, 100),
      expand: 'space',
    });
    return ConfluenceSearchResponseSchema.parse(data);
  }
}

export function formatPage(page: ConfluencePage): string {
  const body =
    page.body?.view?.value ??
    page.body?.storage?.value ??
    '(no body content)';

  const lines: string[] = [
    `**${page.title}** (ID: ${page.id})`,
    `Space: ${page.space?.name ?? page.space?.key ?? 'Unknown'}`,
    `Version: ${page.version?.number ?? '?'}`,
  ];

  if (page.ancestors && page.ancestors.length > 0) {
    const breadcrumb = page.ancestors.map((a) => a.title).join(' > ');
    lines.push(`Breadcrumb: ${breadcrumb} > ${page.title}`);
  }

  lines.push('', stripHtml(body));

  return lines.join('\n');
}

export function formatSearchResults(result: ConfluenceSearchResponse): string {
  if (result.results.length === 0) return 'No content found.';

  const header = `Found ${result.totalSize} result(s) (showing ${result.results.length}):`;
  const rows = result.results.map((r) => {
    const space = r.space?.name ?? r.space?.key ?? '?';
    const excerpt = r.excerpt ? ` — ${r.excerpt.slice(0, 80)}...` : '';
    return `• **[${space}]** ${r.title}${excerpt}`;
  });

  return [header, ...rows].join('\n');
}

export function formatPageList(pages: ConfluencePage[]): string {
  if (pages.length === 0) return 'No child pages found.';
  const rows = pages.map((p) => `• **${p.title}** (ID: ${p.id})`);
  return [`Child pages (${pages.length}):`, ...rows].join('\n');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 2000);
}
