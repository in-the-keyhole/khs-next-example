"use client";
import Image from "next/image";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react"

const UserBar = () => {
  const { data: session, status, update } = useSession();

  return (
    <div
      className="
      fixed left-0 top-0 p-0 m-0 flex flex-row w-full justify-stretch border-b border-gray-300 bg-gradient-to-b from-zinc-200
      backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit border bg-gray-200"
    >
      {status === "authenticated" ? (
        <>
          <div>
            <Image
              className="rounded-full"
              src={session?.user?.image}
              alt={"Github Profile Image"}
              height={48}
              width={48}
            />
          </div>
          <p className="p-3">{session?.user?.name}</p>
          <button className={'ml-auto p-3'} onClick={() => signOut()}>
            Logout
          </button>
        </>
      ) : status === "unauthenticated" ? (
        <>
          <div className="p-2 text-3xl">👤</div>
          <p className="px-2 py-3">Guest</p>
          <button className={'ml-auto p-3'} onClick={() => signIn()}>
            Login
          </button>
        </>
      ) : <div className="hidden" />}
    </div>
  );
};

export const Header = ({ session } : { session: Session | null}) => {

  return <SessionProvider session={session}>
    <UserBar />
  </SessionProvider>;
}

