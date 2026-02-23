"use client";
import { Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { AvatarImage } from "@keyhole/lib/components/atoms/avatar-image";
import { NavLink } from "@keyhole/lib/components/molecules/nav-link";

const UserBar = () => {
  const { data: session, status } = useSession();

  return (
    <div
      className="fixed left-0 top-0 p-0 m-0 flex flex-row w-full justify-stretch border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit border bg-gray-200"
    >
      {status === "authenticated" && session?.user?.image ? (
        <>
          <div>
            <AvatarImage src={session.user.image} alt="Profile Image" />
          </div>
          <p className="p-3">{session.user.name}</p>
          <NavLink href="/">Home Page</NavLink>
          {session.user.githubLogin && <NavLink href="/github">Github Info</NavLink>}
          <button className={'ml-auto p-3'} onClick={() => signOut()}>
            Logout
          </button>
        </>
      ) : status === "unauthenticated" ? (
        <>
          <div className="p-2 text-3xl">👤</div>
          <p className="px-2 py-3">Guest</p>
          <NavLink href="/">Home Page</NavLink>
          <button className={'ml-auto p-3'} onClick={() => signIn()}>
            Login
          </button>
        </>
      ) : (
        <>
          <p className="px-2 py-3">Loading Session...</p>
        </>)
      }
    </div>
  );
};

export const Header = ({ session } : { session: Session | null}) => {

  return <SessionProvider session={session}>
    <UserBar />
  </SessionProvider>;
}

