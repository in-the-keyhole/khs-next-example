import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGithubProfile, getGithubEvents, getGithubUserData } from '@keyhole/services/GithubService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const login = 'janedoe';
const token = 'mock-token';

const mockProfile = {
  login,
  name: 'Jane Doe',
  location: 'Kansas City, MO',
  html_url: 'https://github.com/janedoe',
};

const mockEvents = [
  {
    id: '1',
    type: 'PushEvent',
    repo: { name: `${login}/my-project` },
    payload: { commits: [{ message: 'Initial commit' }] },
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('GithubService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getGithubProfile', () => {
    it('requests the correct GitHub API URL with auth header', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockProfile) });

      await getGithubProfile(login, token);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/users/${login}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('returns the parsed profile response', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockProfile) });

      const result = await getGithubProfile(login, token);

      expect(result).toEqual(mockProfile);
    });
  });

  describe('getGithubEvents', () => {
    it('requests the correct GitHub API URL with auth header', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockEvents) });

      await getGithubEvents(login, token);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/users/${login}/events`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('returns the parsed events response', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockEvents) });

      const result = await getGithubEvents(login, token);

      expect(result).toEqual(mockEvents);
    });
  });

  describe('getGithubUserData', () => {
    it('fetches profile and events concurrently', async () => {
      mockFetch
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockProfile) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockEvents) });

      await getGithubUserData(login, token);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/users/${login}`,
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/users/${login}/events`,
        expect.any(Object),
      );
    });

    it('returns combined profile and events', async () => {
      mockFetch
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockProfile) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockEvents) });

      const result = await getGithubUserData(login, token);

      expect(result).toEqual({ profile: mockProfile, events: mockEvents });
    });
  });
});
