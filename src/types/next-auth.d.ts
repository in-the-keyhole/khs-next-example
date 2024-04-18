import NextAuth, { DefaultSession } from "next-auth"
import { GithubProfile } from "next-auth/providers/github"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string,
    user: {
      name: string,
      email: string,
      image: string,
      github: GithubProfile,
    } & DefaultSession["user"]
  }
}