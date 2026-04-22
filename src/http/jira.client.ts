import { BaseHttpClient } from './client.js';
import type { BaseHttpClientOptions } from './client.js';
import type { JiraConfig } from '../config/schema.js';

export class JiraHttpClient extends BaseHttpClient {
  constructor(config: JiraConfig) {
    const options: BaseHttpClientOptions = {
      baseUrl: `${config.url.replace(/\/$/, '')}/rest/api/3`,
      authType: config.authType,
      sslVerify: config.sslVerify,
      timeoutMs: config.timeoutMs,
      ...(config.username !== undefined ? { username: config.username } : {}),
      ...(config.apiToken !== undefined ? { apiToken: config.apiToken } : {}),
      ...(config.personalToken !== undefined ? { personalToken: config.personalToken } : {}),
      ...(config.httpProxy !== undefined ? { httpProxy: config.httpProxy } : {}),
      ...(config.httpsProxy !== undefined ? { httpsProxy: config.httpsProxy } : {}),
    };
    super(options);
  }
}
