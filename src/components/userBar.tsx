"use client";
import Image from "next/image";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import LoginBtn from "./loginBtn";


const _UserBar = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="hidden" />
  }


  return (<div className="
    fixed left-0 top-0 p-0 m-0 flex flex-row w-full justify-stretch border-b border-gray-300 bg-gradient-to-b from-zinc-200
    backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit static w-auto  rounded-xl 
    lg:border bg-gray-200 dark:bg-zinc-800/30"
  >
    {session?.user?.image && <div>
      <Image src={session?.user?.image} alt={'Github Profile Image'} height={48} width={48} />
    </div>}
    {session?.user?.name && <div className="p-3">
      Hello, {session?.user?.name ?? 'Stranger'}!
    </div>}
    {<LoginBtn className="ml-auto p-3" session={session}/>}
  </div>);
}

export const UserBar = ({ session } : { session: Session}) => {
  return (
    <SessionProvider session={session}>
      {<_UserBar />}
    </SessionProvider>
  )
}