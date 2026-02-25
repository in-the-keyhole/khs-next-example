export interface PublicPageProps {
    name?: string;
}

export interface PrivatePageProps {
    name?: string;
}

import { GithubProfile } from "next-auth/providers/github";

export interface GithubPageProps {
    profile: GithubProfile;
    events: GithubEvent[];
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: { commits: { message: string }[] };
  created_at: string;
}