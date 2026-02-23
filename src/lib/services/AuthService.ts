import NextAuth, { AuthOptions, getServerSession as _getServerSession } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const SHERPA_API_URL = process.env.SHERPA_API_URL || 'https://keyholekc.com/sherpa';

// Get auth options - validates env vars at runtime only
const getAuthOptions = (): AuthOptions => {
  const clientId = process.env.AUTH_GITHUB_ID || '';
  const clientSecret = process.env.AUTH_GITHUB_SECRET || '';

  // Only warn during build, throw at runtime if actually used without env vars
  if ((!clientId || !clientSecret) && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn(
      'Warning: AUTH_GITHUB_ID and AUTH_GITHUB_SECRET should be set for production'
    );
  }

  return {
    providers: [
      GithubProvider({
        clientId,
        clientSecret,
      }),
      CredentialsProvider({
        id: 'keyhole',
        name: 'Keyhole',
        credentials: {
          userid: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.userid || !credentials?.password) {
            return null;
          }

          try {
            const response = await fetch(SHERPA_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
              },
              body: new URLSearchParams({
                action: 'authenticate',
                userid: credentials.userid,
                password: credentials.password,
              }).toString(),
            });

            if (!response.ok) {
              const text = await response.text();
              console.error(`Sherpa auth failed: ${response.status}`, text);
              return null;
            }

            const data = await response.json();

            if (!data.token) {
              return null;
            }

            const setCookie = response.headers.get('set-cookie');
            const jsessionid = setCookie?.match(/JSESSIONID=([^;]+)/)?.[1];

            return {
              id: data.userid,
              name: data.userid,
              email: data.userid,
              keyholeToken: data.token,
              roles: data.roles,
              jsessionid,
            };
          } catch {
            return null;
          }
        },
      }),
    ],
    pages: {
      signIn: '/auth/signin',
    },
    session: {
      strategy: 'jwt',
      maxAge: 24 * 60 * 60, // 24 hours
      updateAge: 60 * 60, // Update session every hour
    },
    callbacks: {
      async session({ session, token }) {
        session.auth = {
          provider: token?.provider as string,
          accountId: token?.providerAccountId as string,
          token: token?.providerToken as string,
        };

        if (token.roles) {
          session.auth.roles = token.roles as string[];
        }

        if (token.jsessionid) {
          session.auth.jsessionid = token.jsessionid as string;
        }

        if (token.provider === 'github' && session.user) {
          session.user.githubLogin = token?.githubLogin as string;
        }

        return session;
      },
      async jwt({ token, user, profile, account }) {
        // Initial sign-in
        if (account) {
          token.provider = account.provider;
          token.providerAccountId = account.providerAccountId;
        }

        // GitHub OAuth sign-in
        if (profile) {
          token.providerToken = account?.access_token;
        }

        if (account?.provider === 'github') {
          token.githubLogin = (profile as GithubProfile)?.login;
        }

        // Keyhole credentials sign-in
        if (account?.provider === 'keyhole' && user) {
          const keyholeUser = user as { keyholeToken?: string; roles?: string[]; jsessionid?: string };
          token.providerToken = keyholeUser.keyholeToken;
          token.providerAccountId = user.id;
          token.roles = keyholeUser.roles;
          token.jsessionid = keyholeUser.jsessionid;
        }

        return token;
      },
    },
  };
};

export const getServerAuthHandler = () => NextAuth(getAuthOptions());
export const getServerSession = async () => await _getServerSession(getAuthOptions());
