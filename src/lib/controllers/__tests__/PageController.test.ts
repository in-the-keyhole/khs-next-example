import { getPublicPageProps, getPrivatePageProps, getGithubPageProps, getTimesheetPageProps } from '../PageController';
import { getMyClients, getMyEntries } from '@keyhole/services/SherpaService';
import {
  createMockSession,
  mockServerSession,
  mockGetServerSession,
} from '../../../../test/session-bridge';

const mockGetMyClients = getMyClients as jest.Mock;
const mockGetMyEntries = getMyEntries as jest.Mock;

describe('PageController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicPageProps', () => {
    it('should return name when user is authenticated', async () => {
      mockServerSession(createMockSession({ user: { name: 'John Doe' } }));

      const result = await getPublicPageProps();

      expect(result).toEqual({ name: 'John Doe' });
    });

    it('should return undefined name when user is not authenticated', async () => {
      mockServerSession(null);

      const result = await getPublicPageProps();

      expect(result).toEqual({ name: undefined });
    });

    it('should return undefined name when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({});

      const result = await getPublicPageProps();

      expect(result).toEqual({ name: undefined });
    });

    it('should return undefined name when user has no name', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'john@example.com' },
      });

      const result = await getPublicPageProps();

      expect(result).toEqual({ name: undefined });
    });
  });

  describe('getPrivatePageProps', () => {
    it('should return name when user is authenticated', async () => {
      mockServerSession(createMockSession({ user: { name: 'Jane Doe' } }));

      const result = await getPrivatePageProps();

      expect(result).toEqual({ name: 'Jane Doe' });
    });

    it('should redirect to home when user is not authenticated', async () => {
      mockServerSession(null);

      await expect(getPrivatePageProps()).rejects.toThrow('REDIRECT:/');
    });
  });

  describe('getGithubPageProps', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should redirect to home when user is not authenticated', async () => {
      mockServerSession(null);

      await expect(getGithubPageProps()).rejects.toThrow('REDIRECT:/');
    });

    it('should redirect to home when user has no githubLogin', async () => {
      mockServerSession(createMockSession({ user: { githubLogin: undefined } }));

      await expect(getGithubPageProps()).rejects.toThrow('REDIRECT:/');
    });

    it('should throw error for invalid GitHub username format', async () => {
      mockServerSession(
        createMockSession({ user: { githubLogin: '-invalid-username' } }),
      );

      await expect(getGithubPageProps()).rejects.toThrow('Invalid GitHub username format');
    });

    it('should throw error for GitHub username with special characters', async () => {
      mockServerSession(
        createMockSession({ user: { githubLogin: 'user<script>' } }),
      );

      await expect(getGithubPageProps()).rejects.toThrow('Invalid GitHub username format');
    });

    it('should fetch and return github profile and events', async () => {
      const mockProfile = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.png',
      };
      const mockEvents = [
        { id: '1', type: 'PushEvent' },
        { id: '2', type: 'PullRequestEvent' },
      ];

      mockServerSession(createMockSession());

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents),
        });

      const result = await getGithubPageProps();

      expect(result).toEqual({
        profile: mockProfile,
        events: mockEvents,
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should include proper headers in GitHub API requests', async () => {
      const token = 'gho_secret_token_123';
      mockServerSession(
        createMockSession({
          user: { githubLogin: 'octocat' },
          auth: { token },
        }),
      );

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getGithubPageProps();

      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.headers.Authorization).toBe(`Bearer ${token}`);
      expect(options.headers.Accept).toBe('application/vnd.github.v3+json');
      expect(options.headers['User-Agent']).toBe('khs-next-example');
    });

    it('should throw error when GitHub API returns non-ok response', async () => {
      mockServerSession(createMockSession());

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        });

      await expect(getGithubPageProps()).rejects.toThrow('GitHub API error: 404 Not Found');
    });

    it('should throw error when events response is not an array', async () => {
      mockServerSession(createMockSession());

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ login: 'testuser' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ error: 'not an array' }),
        });

      await expect(getGithubPageProps()).rejects.toThrow('Invalid GitHub events response');
    });

    it('should URL encode the GitHub username', async () => {
      mockServerSession(
        createMockSession({ user: { githubLogin: 'test-user' } }),
      );

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getGithubPageProps();

      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toContain('test-user');
    });
  });

  describe('getTimesheetPageProps', () => {
    const keyholeSession = createMockSession({
      auth: { provider: 'keyhole', accountId: 'jdoe', token: 'sherpa_token_123' },
    });

    beforeEach(() => {
      mockGetMyClients.mockReset();
      mockGetMyEntries.mockReset();
    });

    it('should redirect when user is not authenticated', async () => {
      mockServerSession(null);

      await expect(getTimesheetPageProps()).rejects.toThrow('REDIRECT:/');
    });

    it('should redirect when provider is not keyhole', async () => {
      mockServerSession(createMockSession()); // default is github

      await expect(getTimesheetPageProps()).rejects.toThrow('REDIRECT:/');
    });

    it('should fetch clients and entries for current pay period', async () => {
      mockServerSession(keyholeSession);
      mockGetMyClients.mockResolvedValue([
        { id: 1, name: 'Client A' },
      ]);
      mockGetMyEntries.mockResolvedValue([
        { id: 10, day: '2025-02-10', hours: 8, notes: 'Work', client: { id: 1, name: 'Client A' }, user: { id: 1, username: 'jdoe' } },
        { id: 11, day: '2025-02-11', hours: 6, notes: null, client: { id: 1, name: 'Client A' }, user: { id: 1, username: 'jdoe' } },
      ]);

      const result = await getTimesheetPageProps();

      expect(mockGetMyClients).toHaveBeenCalledWith('sherpa_token_123');
      expect(result.clientEntries).toHaveLength(1);
      expect(result.clientEntries[0].totalHours).toBe(14);
      expect(result.grandTotal).toBe(14);
    });

    it('should handle multiple clients', async () => {
      mockServerSession(keyholeSession);
      mockGetMyClients.mockResolvedValue([
        { id: 1, name: 'Client A' },
        { id: 2, name: 'Client B' },
      ]);
      mockGetMyEntries
        .mockResolvedValueOnce([
          { id: 10, day: '2025-02-10', hours: 8, client: { id: 1, name: 'Client A' }, user: { id: 1, username: 'jdoe' } },
        ])
        .mockResolvedValueOnce([
          { id: 20, day: '2025-02-10', hours: 4, client: { id: 2, name: 'Client B' }, user: { id: 1, username: 'jdoe' } },
        ]);

      const result = await getTimesheetPageProps();

      expect(result.clientEntries).toHaveLength(2);
      expect(result.grandTotal).toBe(12);
    });

    it('should handle no clients', async () => {
      mockServerSession(keyholeSession);
      mockGetMyClients.mockResolvedValue([]);

      const result = await getTimesheetPageProps();

      expect(result.clientEntries).toHaveLength(0);
      expect(result.grandTotal).toBe(0);
    });

    it('should use provided start date for pay period', async () => {
      mockServerSession(keyholeSession);
      mockGetMyClients.mockResolvedValue([{ id: 1, name: 'Client A' }]);
      mockGetMyEntries.mockResolvedValue([]);

      const result = await getTimesheetPageProps('2025-01-10');

      // Jan 10 falls in period A: Jan 7–22
      expect(result.payPeriod.start).toEqual(new Date(2025, 0, 7));
      expect(result.payPeriod.end).toEqual(new Date(2025, 0, 22));
    });

    it('should pass correct date range to getMyEntries', async () => {
      mockServerSession(keyholeSession);
      mockGetMyClients.mockResolvedValue([{ id: 5, name: 'Test Client' }]);
      mockGetMyEntries.mockResolvedValue([]);

      await getTimesheetPageProps('2025-03-15');

      // Mar 15 → period A: Mar 7–22
      expect(mockGetMyEntries).toHaveBeenCalledWith('sherpa_token_123', 5, '2025-03-07', '2025-03-22');
    });

    it('should propagate Sherpa API errors', async () => {
      mockServerSession(keyholeSession);
      mockGetMyClients.mockRejectedValue(new Error('Sherpa API error: 500 Internal Server Error'));

      await expect(getTimesheetPageProps()).rejects.toThrow('Sherpa API error: 500 Internal Server Error');
    });
  });
});
