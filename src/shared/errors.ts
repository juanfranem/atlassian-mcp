export class AtlassianError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'AtlassianError';
  }
}

export class AuthenticationError extends AtlassianError {
  constructor(message = 'Authentication failed. Check your credentials.') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AtlassianError {
  constructor(message = 'Insufficient permissions to perform this action.') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AtlassianError {
  constructor(resource: string) {
    super(`${resource} not found.`, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AtlassianError {
  constructor(retryAfter?: number) {
    const suffix = retryAfter ? ` Retry after ${retryAfter}s.` : '';
    super(`Rate limit exceeded.${suffix}`, 429);
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends AtlassianError {
  constructor(service: string) {
    super(`${service} is currently unavailable.`, 503);
    this.name = 'ServiceUnavailableError';
  }
}

export function isAtlassianError(err: unknown): err is AtlassianError {
  return err instanceof AtlassianError;
}

export function toToolError(err: unknown): string {
  if (err instanceof AtlassianError) return err.message;
  if (err instanceof Error) return err.message;
  return String(err);
}
