import Image from "next/image";
import { UserBar } from "@keyhole/components/userBar";
import { Session } from "next-auth";


export default async function Home({ session }: { session: Session }) {
  "use server";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UserBar session={session}/>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col">
          <Image src="/keyhole.svg" alt="Keyhole Logo" width={480} height={192} />
          <h1 className="text-3xl font-bold text-center">Welcome to Keyhole Next!</h1>
          <p className="text-center mt-4">
            A Next.js example for developers.
          </p>
      </div>
    </main>
  );
}
