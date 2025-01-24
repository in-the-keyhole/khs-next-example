import { getServerSession } from "@keyhole/services/AuthService";
import { redirect } from "next/navigation";

export const getHomePageProps = async () => {
  const session = await getServerSession();

  return {
    name: session?.user?.name ?? undefined,
  };
};
export const getGithubPageProps = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect(`/`)
  }

  const { githubLogin } = session?.user;

  if (!githubLogin) {
    redirect(`/`)
  }

  const githubUserApiUrl = `https://api.github.com/users/${githubLogin}`;
  const githubApiOptions = { 
    headers: {
      Authorization: `Bearer ${session.auth.token}`,
    }
  };
  const [
    profileResponse,
    eventsResponse,
  ] = await Promise.all([
    fetch(githubUserApiUrl, githubApiOptions),
    fetch(`${githubUserApiUrl}/events`, githubApiOptions)
  ]);

  const props = {
    profile: await profileResponse.json(),
    events: await eventsResponse.json(),
  };


  return props;
}
