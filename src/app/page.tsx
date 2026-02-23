import { getPublicPageProps  } from "@keyhole/controllers/PageController";
import Image from "next/image";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Keyhole Next |  Home",
  description: "Welcome to Keyhole Next! A Next.js example for developers.",
};


export default async function Home() {
  const { name } = await getPublicPageProps ();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center pt-20 px-8 pb-8">
      <div className="flex flex-col items-center">
          <Image className="" src="/keyhole.svg" alt="Keyhole Logo" width={480} height={192} priority/>
          <h1 className="p-2 text-3xl font-bold text-center">Welcome to Keyhole Next{name && `, ${name}`}!</h1>
          <p className="text-center mt-4">
            A Next.js example for developers.
          </p>
      </div>
    </main>
  );
}
