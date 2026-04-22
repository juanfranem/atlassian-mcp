import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfluencePagesService, formatPage, formatSearchResults, formatPageList } from '../../src/modules/confluence/pages/service.js';
import type { ConfluenceHttpClient } from '../../src/http/confluence.client.js';

const mockClient = {
  get: vi.fn(),
} as unknown as ConfluenceHttpClient;

const mockPage = {
  id: '123456',
  type: 'page',
  title: 'Deployment Guide',
  space: { key: 'DEV', name: 'Development' },
  version: { number: 5, when: '2024-01-10T12:00:00.000Z' },
  body: {
    view: { value: '<p>This is the deployment guide content.</p>' },
  },
  ancestors: [
    { id: '100', title: 'Engineering' },
    { id: '101', title: 'Operations' },
  ],
};

const mockSearchResponse = {
  results: [
    {
      id: '123',
      type: 'page',
      title: 'Getting Started',
      space: { key: 'DEV', name: 'Development' },
      excerpt: 'This page explains how to get started...',
    },
    {
      id: '456',
      type: 'page',
      title: 'API Reference',
      space: { key: 'API', name: 'API Docs' },
    },
  ],
  totalSize: 2,
};

describe('ConfluencePagesService', () => {
  let service: ConfluencePagesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConfluencePagesService(mockClient);
  });

  it('getPage returns parsed page', async () => {
    vi.mocked(mockClient.get).mockResolvedValue(mockPage);

    const page = await service.getPage('123456');

    expect(mockClient.get).toHaveBeenCalledWith('/content/123456', expect.any(Object));
    expect(page.id).toBe('123456');
    expect(page.title).toBe('Deployment Guide');
  });

  it('searchContent passes CQL and limit', async () => {
    vi.mocked(mockClient.get).mockResolvedValue(mockSearchResponse);

    const result = await service.searchContent('type = page AND space = DEV', 10);

    expect(mockClient.get).toHaveBeenCalledWith('/content/search', expect.objectContaining({
      cql: 'type = page AND space = DEV',
      limit: 10,
    }));
    expect(result.results).toHaveLength(2);
  });

  it('getPageChildren returns list', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ results: [mockPage], size: 1 });

    const pages = await service.getPageChildren('100', 25);

    expect(mockClient.get).toHaveBeenCalledWith('/content/100/child/page', expect.any(Object));
    expect(pages).toHaveLength(1);
  });
});

describe('formatPage', () => {
  it('formats page with ancestors breadcrumb', () => {
    const formatted = formatPage(mockPage);

    expect(formatted).toContain('Deployment Guide');
    expect(formatted).toContain('123456');
    expect(formatted).toContain('Development');
    expect(formatted).toContain('Engineering > Operations');
    expect(formatted).toContain('deployment guide content');
  });
});

describe('formatSearchResults', () => {
  it('formats search results with excerpts', () => {
    const formatted = formatSearchResults(mockSearchResponse);

    expect(formatted).toContain('Found 2 result(s)');
    expect(formatted).toContain('Getting Started');
    expect(formatted).toContain('API Reference');
    expect(formatted).toContain('get started');
  });

  it('handles empty results', () => {
    expect(formatSearchResults({ results: [], totalSize: 0 })).toBe('No content found.');
  });
});

describe('formatPageList', () => {
  it('formats page list', () => {
    const formatted = formatPageList([mockPage]);
    expect(formatted).toContain('Deployment Guide');
    expect(formatted).toContain('123456');
  });

  it('handles empty list', () => {
    expect(formatPageList([])).toBe('No child pages found.');
  });
});
