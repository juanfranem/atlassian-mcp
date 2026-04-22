import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getLogger } from '../shared/logger.js';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  AtlassianError,
} from '../shared/errors.js';

const log = getLogger('HttpClient');

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;

export interface BaseHttpClientOptions {
  baseUrl: string;
  authType: 'basic' | 'pat';
  username?: string;
  apiToken?: string;
  personalToken?: string;
  sslVerify: boolean;
  timeoutMs: number;
  httpProxy?: string;
  httpsProxy?: string;
}

export class BaseHttpClient {
  protected readonly http: AxiosInstance;

  constructor(options: BaseHttpClientOptions) {
    this.http = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeoutMs,
    });

    if (!options.sslVerify) {
      void import('https').then(({ Agent }) => {
        this.http.defaults.httpsAgent = new Agent({ rejectUnauthorized: false });
      });
    }

    const proxy = this.resolveProxy(options);
    if (proxy !== undefined) {
      this.http.defaults.proxy = proxy;
    }

    this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      config.headers ??= new axios.AxiosHeaders();

      if (options.authType === 'pat' && options.personalToken) {
        config.headers.set('Authorization', `Bearer ${options.personalToken}`);
      } else if (options.username && options.apiToken) {
        const token = Buffer.from(`${options.username}:${options.apiToken}`).toString('base64');
        config.headers.set('Authorization', `Basic ${token}`);
      }

      config.headers.set('Content-Type', 'application/json');
      config.headers.set('Accept', 'application/json');

      log.debug(`→ ${String(config.method).toUpperCase()} ${String(config.url)}`);
      return config;
    });

    this.http.interceptors.response.use(
      (response) => {
        log.debug(`← ${response.status} ${String(response.config.url)}`);
        return response;
      },
      async (error: unknown) => {
        return this.handleResponseError(error);
      },
    );
  }

  private resolveProxy(options: BaseHttpClientOptions): false | { host: string; port: number; protocol: string } | undefined {
    const proxyUrl = options.httpsProxy ?? options.httpProxy;
    if (!proxyUrl) return undefined;
    try {
      const url = new URL(proxyUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port, 10),
        protocol: url.protocol,
      };
    } catch {
      log.warn(`Invalid proxy URL: ${proxyUrl}`);
      return undefined;
    }
  }

  private async handleResponseError(error: unknown): Promise<never> {
    if (!axios.isAxiosError(error) || !error.response) {
      throw error instanceof Error ? error : new AtlassianError(String(error));
    }

    const { status, config } = error.response;
    const retries = ((config as InternalAxiosRequestConfig & { _retries?: number })['_retries']) ?? 0;

    if (status === 429 && retries < MAX_RETRIES) {
      const retryAfter = parseInt(String(error.response.headers['retry-after'] ?? '1'), 10);
      const delay = retryAfter * 1000 || RETRY_BASE_DELAY_MS * Math.pow(2, retries);
      log.warn(`Rate limited. Retrying in ${delay}ms (attempt ${retries + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      const retryConfig = { ...config, _retries: retries + 1 };
      return this.http.request(retryConfig) as Promise<never>;
    }

    if (status === 401) throw new AuthenticationError();
    if (status === 403) throw new AuthorizationError();
    if (status === 404) throw new NotFoundError('Resource');
    if (status === 429) throw new RateLimitError();
    if (status >= 500) throw new ServiceUnavailableError('Atlassian');

    throw new AtlassianError(
      `API error ${status}: ${JSON.stringify(error.response.data)}`,
      status,
    );
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.http.get<T>(path, { params });
    return response.data;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
