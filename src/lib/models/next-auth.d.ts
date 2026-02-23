import NextAuth, { DefaultSession } from "next-auth"
import { GithubProfile } from "next-auth/providers/github"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      githubLogin?: string
    } & DefaultSession["user"],
    auth: {
      provider: string,
      accountId: string,
      token: string,
      roles?: string[],
      jsessionid?: string,
    }
  }
}