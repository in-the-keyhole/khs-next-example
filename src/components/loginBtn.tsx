import { Session } from "next-auth"
import { signIn, signOut } from "next-auth/react"


export default function LoginBtn({ session, className }: { session: Session | null, className: string}) {
  if (session) {
    return (
      <>
        <button className={className} onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      <button className={className} onClick={() => signIn()}>Sign in</button>
    </>
  )
}