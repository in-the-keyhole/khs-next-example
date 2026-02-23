import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks must be declared before the module imports that consume them
vi.mock('@keyhole/services/AuthService', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@keyhole/services/GithubService', () => ({
  getGithubUserData: vi.fn(),
}));

// redirect() in Next.js throws internally — simulate that behaviour so tests
// correctly model the control flow that stops execution after a redirect.
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { getServerSession } from '@keyhole/services/AuthService';
import { getGithubUserData } from '@keyhole/services/GithubService';
import { redirect } from 'next/navigation';
import {
  getPublicPageProps,
  getPrivatePageProps,
  getGithubPageProps,
} from '@keyhole/controllers/PageController';

const mockGetServerSession = vi.mocked(getServerSession);
const mockGetGithubUserData = vi.mocked(getGithubUserData);
const mockRedirect = vi.mocked(redirect);

const mockSession = {
  user: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    image: 'https://avatars.githubusercontent.com/u/1?v=4',
    githubLogin: 'janedoe',
  },
  auth: {
    provider: 'github',
    accountId: '12345',
    token: 'mock-token',
  },
  expires: '2099-01-01T00:00:00.000Z',
};

describe('PageController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublicPageProps', () => {
    it('returns the user name from an active session', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession);

      const result = await getPublicPageProps();

      expect(result).toEqual({ name: 'Jane Doe' });
    });

    it('returns undefined name when there is no session', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const result = await getPublicPageProps();

      expect(result).toEqual({ name: undefined });
    });
  });

  describe('getPrivatePageProps', () => {
    it('redirects to home when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      await expect(getPrivatePageProps()).rejects.toThrow('NEXT_REDIRECT:/');
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    it('returns the user name when authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession);

      const result = await getPrivatePageProps();

      expect(result).toEqual({ name: 'Jane Doe' });
    });
  });

  describe('getGithubPageProps', () => {
    it('redirects to home when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      await expect(getGithubPageProps()).rejects.toThrow('NEXT_REDIRECT:/');
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    it('redirects to home when githubLogin is not present', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        ...mockSession,
        user: { ...mockSession.user, githubLogin: undefined },
      });

      await expect(getGithubPageProps()).rejects.toThrow('NEXT_REDIRECT:/');
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    it('fetches github data with the login and token from the session', async () => {
      const mockData = { profile: { login: 'janedoe', name: 'Jane Doe' }, events: [] };
      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockGetGithubUserData.mockResolvedValueOnce(mockData);

      await getGithubPageProps();

      expect(mockGetGithubUserData).toHaveBeenCalledWith('janedoe', 'mock-token');
    });

    it('returns the github user data', async () => {
      const mockData = { profile: { login: 'janedoe', name: 'Jane Doe' }, events: [] };
      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockGetGithubUserData.mockResolvedValueOnce(mockData);

      const result = await getGithubPageProps();

      expect(result).toEqual(mockData);
    });
  });
});
