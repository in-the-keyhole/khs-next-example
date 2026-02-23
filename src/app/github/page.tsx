import { getGithubPageProps } from "@keyhole/controllers/PageController";
import { GithubPage } from "@keyhole/lib/components/pages/github";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Keyhole Next | Github",
  description: "Welcome to Keyhole Next! A Next.js example for developers.",
};


export default async function GithubPageView() {
  const { profile, events } = await getGithubPageProps();

  return <GithubPage profile={profile} events={events}/>;
}