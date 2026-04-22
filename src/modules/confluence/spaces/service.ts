import type { ConfluenceHttpClient } from '../../../http/confluence.client.js';
import { ConfluenceSpaceListSchema } from '../types.js';
import type { ConfluenceSpace } from '../types.js';
import { getLogger } from '../../../shared/logger.js';

const log = getLogger('ConfluenceSpacesService');

export class ConfluenceSpacesService {
  constructor(private readonly client: ConfluenceHttpClient) {}

  async getSpaces(limit = 50): Promise<ConfluenceSpace[]> {
    log.info('Fetching spaces');
    const data = await this.client.get<unknown>('/space', {
      limit: Math.min(limit, 100),
      expand: 'description.plain',
      status: 'current',
    });
    const parsed = ConfluenceSpaceListSchema.parse(data);
    return parsed.results;
  }
}

export function formatSpaces(spaces: ConfluenceSpace[]): string {
  if (spaces.length === 0) return 'No spaces found.';
  const rows = spaces.map((s) => {
    const desc = s.description?.plain?.value
      ? ` — ${s.description.plain.value.slice(0, 60)}`
      : '';
    return `• **${s.key}** — ${s.name}${desc}`;
  });
  return [`Spaces (${spaces.length}):`, ...rows].join('\n');
}
