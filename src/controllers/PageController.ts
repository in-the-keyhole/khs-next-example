import { getServerSession } from "@keyhole/services/AuthService";
import { getGithubUserData } from "@keyhole/services/GithubService";
import { redirect } from "next/navigation";
import { GithubPageProps } from "@keyhole/lib/models/pageProps";

export const getPublicPageProps = async () => {
  const session = await getServerSession();

  return {
    name: session?.user?.name ?? undefined,
  };
};

export const getPrivatePageProps = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect(`/`)
  }

  return {
    name: session?.user?.name ?? undefined,
  };
};


export const getGithubPageProps = async (): Promise<GithubPageProps> => {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const { githubLogin } = session.user;

  if (!githubLogin) {
    redirect('/');
  }

  return getGithubUserData(githubLogin, session.auth.token);
}