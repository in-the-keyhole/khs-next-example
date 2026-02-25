import { DefaultSession } from "next-auth"

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
    }
  }
}