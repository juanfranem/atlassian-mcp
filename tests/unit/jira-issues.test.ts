import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraIssuesService, formatIssue, formatSearchResults } from '../../src/modules/jira/issues/service.js';
import type { JiraHttpClient } from '../../src/http/jira.client.js';

const mockClient = {
  get: vi.fn(),
} as unknown as JiraHttpClient;

const mockSearchResponse = {
  total: 2,
  maxResults: 50,
  startAt: 0,
  issues: [
    {
      id: '10001',
      key: 'PROJ-1',
      self: 'https://company.atlassian.net/rest/api/3/issue/10001',
      fields: {
        summary: 'Fix login bug',
        status: { id: '1', name: 'In Progress' },
        assignee: { accountId: 'abc', displayName: 'Jane Doe' },
        reporter: { accountId: 'xyz', displayName: 'John Smith' },
        priority: { id: '2', name: 'High' },
        issuetype: { id: '1', name: 'Bug', subtask: false },
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z',
      },
    },
    {
      id: '10002',
      key: 'PROJ-2',
      self: 'https://company.atlassian.net/rest/api/3/issue/10002',
      fields: {
        summary: 'Add dark mode',
        status: { id: '2', name: 'Open' },
        assignee: null,
        reporter: { accountId: 'xyz', displayName: 'John Smith' },
        priority: null,
        issuetype: { id: '2', name: 'Story', subtask: false },
        created: '2024-01-03T00:00:00.000Z',
        updated: '2024-01-04T00:00:00.000Z',
      },
    },
  ],
};

describe('JiraIssuesService', () => {
  let service: JiraIssuesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JiraIssuesService(mockClient);
  });

  it('searchIssues returns parsed results', async () => {
    vi.mocked(mockClient.get).mockResolvedValue(mockSearchResponse);

    const result = await service.searchIssues('project = PROJ');

    expect(mockClient.get).toHaveBeenCalledWith('/search', expect.objectContaining({ jql: 'project = PROJ' }));
    expect(result.total).toBe(2);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]?.key).toBe('PROJ-1');
  });

  it('searchIssues respects limit capped at 100', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ ...mockSearchResponse, issues: [] });

    await service.searchIssues('project = PROJ', 200);

    expect(mockClient.get).toHaveBeenCalledWith('/search', expect.objectContaining({ maxResults: 100 }));
  });

  it('getIssue returns single issue', async () => {
    const singleIssue = mockSearchResponse.issues[0];
    vi.mocked(mockClient.get).mockResolvedValue(singleIssue);

    const issue = await service.getIssue('PROJ-1');

    expect(mockClient.get).toHaveBeenCalledWith('/issue/PROJ-1', expect.any(Object));
    expect(issue.key).toBe('PROJ-1');
    expect(issue.fields.summary).toBe('Fix login bug');
  });
});

describe('formatIssue', () => {
  it('formats issue with all fields', () => {
    const issue = mockSearchResponse.issues[0]!;
    const formatted = formatIssue(issue);

    expect(formatted).toContain('PROJ-1');
    expect(formatted).toContain('Fix login bug');
    expect(formatted).toContain('In Progress');
    expect(formatted).toContain('Jane Doe');
    expect(formatted).toContain('High');
  });

  it('handles null assignee gracefully', () => {
    const issue = mockSearchResponse.issues[1]!;
    const formatted = formatIssue(issue);

    expect(formatted).toContain('Unassigned');
  });
});

describe('formatSearchResults', () => {
  it('formats multiple results', () => {
    const result = {
      total: 2,
      maxResults: 50,
      startAt: 0,
      issues: mockSearchResponse.issues,
    };
    const formatted = formatSearchResults(result);

    expect(formatted).toContain('Found 2 issue(s)');
    expect(formatted).toContain('PROJ-1');
    expect(formatted).toContain('PROJ-2');
  });

  it('handles empty results', () => {
    const result = { total: 0, maxResults: 50, startAt: 0, issues: [] };
    expect(formatSearchResults(result)).toBe('No issues found.');
  });
});
