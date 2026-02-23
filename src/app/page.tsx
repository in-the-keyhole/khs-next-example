import { getPublicPageProps  } from "@keyhole/controllers/PageController";
import { HomePage } from "@keyhole/lib/components/pages/home";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Keyhole Next |  Home",
  description: "Welcome to Keyhole Next! A Next.js example for developers.",
};


export default async function HomePageView() {
  const { name } = await getPublicPageProps ();

  return (<HomePage name={name} />);
}
