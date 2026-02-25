import { GithubProfile } from "next-auth/providers/github";
import { GithubEvent } from "@keyhole/lib/models/pageProps";

const GITHUB_API_BASE = 'https://api.github.com';

const githubApiOptions = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getGithubProfile = async (login: string, token: string): Promise<GithubProfile> => {
  const response = await fetch(`${GITHUB_API_BASE}/users/${login}`, githubApiOptions(token));
  return response.json();
};

export const getGithubEvents = async (login: string, token: string): Promise<GithubEvent[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/users/${login}/events`, githubApiOptions(token));
  return response.json();
};

export const getGithubUserData = async (login: string, token: string) => {
  const [profile, events] = await Promise.all([
    getGithubProfile(login, token),
    getGithubEvents(login, token),
  ]);
  return { profile, events };
};
