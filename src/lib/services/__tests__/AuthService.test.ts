import type { Session, Account, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { GithubProfile } from 'next-auth/providers/github';

// Replicate the callback logic from AuthService for isolated testing

describe('AuthService', () => {
  describe('session callback', () => {
    const sessionCallback = async ({ session, token }: { session: Session; token: JWT }) => {
      session.auth = {
        provider: token?.provider as string,
        accountId: token?.providerAccountId as string,
        token: token?.providerToken as string,
      };

      if (token.roles) {
        session.auth.roles = token.roles as string[];
      }

      if (token.provider === 'github' && session.user) {
        session.user.githubLogin = token?.githubLogin as string;
      }

      return session;
    };

    it('should add auth info to session from token', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01',
      } as Session;

      const mockToken: JWT = {
        provider: 'github',
        providerAccountId: '12345',
        providerToken: 'gho_test_token',
        githubLogin: 'testuser',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken });

      expect(result.auth).toEqual({
        provider: 'github',
        accountId: '12345',
        token: 'gho_test_token',
      });
    });

    it('should add githubLogin to user when provider is github', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01',
      } as Session;

      const mockToken: JWT = {
        provider: 'github',
        providerAccountId: '12345',
        providerToken: 'gho_test_token',
        githubLogin: 'testuser',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken });

      expect(result.user?.githubLogin).toBe('testuser');
    });

    it('should not add githubLogin when provider is not github', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01',
      } as Session;

      const mockToken: JWT = {
        provider: 'keyhole',
        providerAccountId: 'jdoe',
        providerToken: 'sherpa_token_123',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken });

      expect(result.user?.githubLogin).toBeUndefined();
    });

    it('should add roles to session.auth when token has roles', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01',
      } as Session;

      const mockToken: JWT = {
        provider: 'keyhole',
        providerAccountId: 'jdoe',
        providerToken: 'sherpa_token_123',
        roles: ['admin', 'developer'],
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken });

      expect(result.auth.roles).toEqual(['admin', 'developer']);
    });

    it('should not add roles when token has no roles', async () => {
      const mockSession = {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2025-01-01',
      } as Session;

      const mockToken: JWT = {
        provider: 'github',
        providerAccountId: '12345',
        providerToken: 'gho_test_token',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken });

      expect(result.auth.roles).toBeUndefined();
    });

    it('should handle missing user in session', async () => {
      const mockSession = {
        expires: '2025-01-01',
      } as Session;

      const mockToken: JWT = {
        provider: 'github',
        providerAccountId: '12345',
        providerToken: 'gho_test_token',
        githubLogin: 'testuser',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken });

      expect(result.auth.provider).toBe('github');
    });
  });

  describe('jwt callback', () => {
    const jwtCallback = async ({
      token,
      user,
      profile,
      account,
    }: {
      token: JWT;
      user?: User & { keyholeToken?: string; roles?: string[] };
      profile?: GithubProfile;
      account?: Account | null;
    }) => {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }

      if (profile) {
        token.providerToken = account?.access_token;
      }

      if (account?.provider === 'github') {
        token.githubLogin = (profile as GithubProfile)?.login;
      }

      if (account?.provider === 'keyhole' && user) {
        token.providerToken = user.keyholeToken;
        token.providerAccountId = user.id;
        token.roles = user.roles;
      }

      return token;
    };

    it('should set provider info on initial sign-in', async () => {
      const mockToken: JWT = { sub: 'user123' };
      const mockAccount: Account = {
        provider: 'github',
        providerAccountId: '12345',
        access_token: 'gho_test_token',
        type: 'oauth',
      };

      const result = await jwtCallback({ token: mockToken, account: mockAccount });

      expect(result.provider).toBe('github');
      expect(result.providerAccountId).toBe('12345');
    });

    it('should add GitHub profile data on OAuth sign-in', async () => {
      const mockToken: JWT = { sub: 'user123' };
      const mockProfile = { login: 'testuser' } as GithubProfile;
      const mockAccount: Account = {
        provider: 'github',
        providerAccountId: '12345',
        access_token: 'gho_test_token',
        type: 'oauth',
      };

      const result = await jwtCallback({
        token: mockToken,
        profile: mockProfile,
        account: mockAccount,
      });

      expect(result.githubLogin).toBe('testuser');
      expect(result.providerToken).toBe('gho_test_token');
    });

    it('should store Keyhole token and roles on credentials sign-in', async () => {
      const mockToken: JWT = { sub: 'user123' };
      const mockUser = {
        id: 'jdoe',
        name: 'jdoe',
        email: 'jdoe',
        keyholeToken: 'sherpa_token_abc',
        roles: ['admin', 'developer'],
      };
      const mockAccount: Account = {
        provider: 'keyhole',
        providerAccountId: 'jdoe',
        type: 'credentials',
      };

      const result = await jwtCallback({
        token: mockToken,
        user: mockUser,
        account: mockAccount,
      });

      expect(result.provider).toBe('keyhole');
      expect(result.providerToken).toBe('sherpa_token_abc');
      expect(result.providerAccountId).toBe('jdoe');
      expect(result.roles).toEqual(['admin', 'developer']);
    });

    it('should not add githubLogin for keyhole provider', async () => {
      const mockToken: JWT = { sub: 'user123' };
      const mockUser = {
        id: 'jdoe',
        name: 'jdoe',
        email: 'jdoe',
        keyholeToken: 'sherpa_token_abc',
      };
      const mockAccount: Account = {
        provider: 'keyhole',
        providerAccountId: 'jdoe',
        type: 'credentials',
      };

      const result = await jwtCallback({
        token: mockToken,
        user: mockUser,
        account: mockAccount,
      });

      expect(result.githubLogin).toBeUndefined();
    });

    it('should not modify provider fields on subsequent requests (no account)', async () => {
      const mockToken: JWT = {
        sub: 'user123',
        provider: 'keyhole',
        providerToken: 'existing_token',
      };

      const result = await jwtCallback({ token: mockToken });

      expect(result.provider).toBe('keyhole');
      expect(result.providerToken).toBe('existing_token');
    });
  });
});
