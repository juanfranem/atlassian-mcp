import type { JiraHttpClient } from '../../../http/jira.client.js';
import { JiraProjectListSchema, JiraFieldSchema } from '../types.js';
import type { JiraProject, JiraField } from '../types.js';
import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';

const log = getLogger('JiraProjectsService');

export class JiraProjectsService {
  constructor(private readonly client: JiraHttpClient) {}

  async getProjects(maxResults = 50): Promise<JiraProject[]> {
    log.info('Fetching projects');
    const data = await this.client.get<unknown>('/project/search', {
      maxResults: Math.min(maxResults, 100),
      orderBy: 'name',
    });
    const parsed = JiraProjectListSchema.parse(data);
    return parsed.values;
  }

  async getFields(): Promise<JiraField[]> {
    log.info('Fetching fields');
    const data = await this.client.get<unknown>('/field');
    return z.array(JiraFieldSchema).parse(data);
  }
}

export function formatProjects(projects: JiraProject[]): string {
  if (projects.length === 0) return 'No projects found.';
  const rows = projects.map(
    (p) => `• **${p.key}** — ${p.name}${p.description ? ` (${p.description})` : ''}`,
  );
  return [`Projects (${projects.length}):`, ...rows].join('\n');
}

export function formatFields(fields: JiraField[]): string {
  if (fields.length === 0) return 'No fields found.';
  const rows = fields.map(
    (f) => `• **${f.id}** — ${f.name} [${f.custom ? 'custom' : 'system'}]${f.schema ? ` (${f.schema.type})` : ''}`,
  );
  return [`Fields (${fields.length}):`, ...rows].join('\n');
}
