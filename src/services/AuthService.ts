import NextAuth, { AuthOptions, getServerSession as _getServerSession } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";

const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.auth = {
        provider: token?.provider as string,
        accountId: token?.providerAccountId as string,
        token: token?.providerToken as string,
      };

      if (token.provider === 'github' && session.user) {
        session.user.githubLogin = token?.githubLogin as string;
      }

      return session;
    },
    async jwt({ token, profile, account }) {
      if (profile) {
        token.provider = account?.provider;
        token.providerAccountId = account?.providerAccountId;
        token.providerToken = account?.access_token;
      }

      if (account?.provider === 'github') {
        token.githubLogin = (profile as GithubProfile)?.login;
      }

      return token;
    },
  },
}

export const getServerAuthHandler = () => NextAuth(authOptions);
export const getServerSession = async () => await _getServerSession(authOptions);