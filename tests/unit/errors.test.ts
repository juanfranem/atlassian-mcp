import { describe, it, expect } from 'vitest';
import {
  AtlassianError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  isAtlassianError,
  toToolError,
} from '../../src/shared/errors.js';

describe('Error hierarchy', () => {
  it('AuthenticationError extends AtlassianError', () => {
    const err = new AuthenticationError();
    expect(err).toBeInstanceOf(AtlassianError);
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(401);
    expect(err.name).toBe('AuthenticationError');
  });

  it('AuthorizationError has 403 status', () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError includes resource name', () => {
    const err = new NotFoundError('Issue PROJ-1');
    expect(err.message).toContain('PROJ-1');
    expect(err.statusCode).toBe(404);
  });

  it('RateLimitError includes retry-after when provided', () => {
    const err = new RateLimitError(30);
    expect(err.message).toContain('30');
    expect(err.statusCode).toBe(429);
  });
});

describe('isAtlassianError', () => {
  it('returns true for AtlassianError instances', () => {
    expect(isAtlassianError(new AuthenticationError())).toBe(true);
    expect(isAtlassianError(new AtlassianError('test'))).toBe(true);
  });

  it('returns false for plain errors', () => {
    expect(isAtlassianError(new Error('plain'))).toBe(false);
    expect(isAtlassianError('string error')).toBe(false);
  });
});

describe('toToolError', () => {
  it('extracts message from AtlassianError', () => {
    const err = new AuthenticationError('Custom auth message');
    expect(toToolError(err)).toBe('Custom auth message');
  });

  it('extracts message from plain Error', () => {
    expect(toToolError(new Error('plain error'))).toBe('plain error');
  });

  it('converts unknown to string', () => {
    expect(toToolError('raw string')).toBe('raw string');
    expect(toToolError(42)).toBe('42');
  });
});
