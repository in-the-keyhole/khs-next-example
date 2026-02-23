"use client";
import Image from "next/image";
import { Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

const UserBar = () => {
  const { data: session, status, update } = useSession();

  return (
    <div
      className="fixed left-0 top-0 flex flex-row w-full items-center h-12 px-2 border-b border-slate-600 bg-slate-700 text-slate-100 shadow-md"
    >
      {status === "authenticated" ? (
        <>
          {session?.user?.image ? (
            <Image
              className="rounded-full"
              src={session.user.image}
              alt={"Profile Image"}
              height={36}
              width={36}
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
          <span className="ml-2 text-sm font-medium">{session?.user?.name}</span>
          <nav className="ml-4 flex gap-1">
            <a href="/" className="px-3 py-1 text-sm rounded hover:bg-slate-600 transition-colors">Home</a>
            {session?.user?.githubLogin && <a href="/github" className="px-3 py-1 text-sm rounded hover:bg-slate-600 transition-colors">Github Info</a>}
            {session?.auth?.provider === 'keyhole' && <a href="/timesheet" className="px-3 py-1 text-sm rounded hover:bg-slate-600 transition-colors">Timesheet</a>}
          </nav>
          <button className="ml-auto px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 transition-colors" onClick={() => signOut()}>
            Logout
          </button>
        </>
      ) : status === "unauthenticated" ? (
        <>
          <span className="text-xl">👤</span>
          <span className="ml-2 text-sm text-slate-300">Guest</span>
          <nav className="ml-4 flex gap-1">
            <a href="/" className="px-3 py-1 text-sm rounded hover:bg-slate-600 transition-colors">Home</a>
          </nav>
          <button className="ml-auto px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 transition-colors" onClick={() => signIn()}>
            Login
          </button>
        </>
      ) : (
        <span className="text-sm text-slate-400">Loading...</span>
      )}
    </div>
  );
};

export const Header = ({ session } : { session: Session | null}) => {

  return <SessionProvider session={session}>
    <UserBar />
  </SessionProvider>;
}

