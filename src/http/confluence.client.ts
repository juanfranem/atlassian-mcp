import { BaseHttpClient } from './client.js';
import type { BaseHttpClientOptions } from './client.js';
import type { ConfluenceConfig } from '../config/schema.js';

export class ConfluenceHttpClient extends BaseHttpClient {
  constructor(config: ConfluenceConfig) {
    const baseUrl = config.url.replace(/\/$/, '');
    const options: BaseHttpClientOptions = {
      baseUrl: `${baseUrl}/rest/api`,
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
